"""Real-browser first-impression checks; mocked transport never calls paid APIs."""
import json
import os
import signal
import subprocess
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer

import test_mobile_browser as mobile


HARNESS = rb'''<!doctype html><meta charset="utf-8"><iframe id="target" title="Ask IO test"></iframe>
<script>
const frame = document.querySelector('iframe');
const sizes = [[390,844],[320,800],[1440,900]];
const results = [];
const wait = async (condition) => {
  for (let i=0;i<200;i++) { if(condition()) return; await new Promise(r=>setTimeout(r,25)); }
  throw new Error('Browser condition timed out');
};
const assert = (condition, message) => { if(!condition) throw new Error(message); };
let index = 0;
function load() { const [width,height]=sizes[index]; frame.style.cssText=`width:${width}px;height:${height}px;border:0`; frame.src='/ask.html?browser-test='+width; }
frame.onload = async () => {
  try {
    const w=frame.contentWindow, d=frame.contentDocument;
    await d.fonts.ready;
    const input=d.querySelector('#ask-question'), form=d.querySelector('[data-ask-form]');
    const send=form.querySelector('[type=submit]'), retry=d.querySelector('[data-ask-retry]');
    const calls=[];
    let mode='stream', release;
    const payload={answer:'Checked result [Paper 1](https://zenodo.org/records/18854813/latest). <img src=x onerror="window.injected=true">',
      summary:'Checked result [Paper 1](https://zenodo.org/records/18854813/latest). <img src=x onerror="window.injected=true">',
      details:'Supplementary technical equation.', sources:[{title:'Paper 1',url:'https://zenodo.org/records/18854813/latest'}, {title:'Bad',url:'javascript:alert(1)'}]};
    w.fetch=async (url,options={}) => {
      if(String(url).endsWith('/health')) return new w.Response('{"ok":true}',{headers:{'Content-Type':'application/json'}});
      calls.push(JSON.parse(options.body));
      if(mode==='failure') throw new Error('simulated network failure');
      if(mode==='cancel') return await new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new w.DOMException('Cancelled','AbortError')),{once:true}));
      if(mode==='json') return new w.Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json'}});
      const encoder=new w.TextEncoder();
      return new w.Response(new w.ReadableStream({start(controller) {
        controller.enqueue(encoder.encode('data: '+JSON.stringify({type:'progress',stage:'Finding research sources'})+'\n\n'));
        release=()=>{ const text='data: '+JSON.stringify({type:'result',payload})+'\n\n';
          // Split an event across arbitrary byte boundaries, as a real network does.
          const bytes=encoder.encode(text); controller.enqueue(bytes.slice(0,17)); controller.enqueue(bytes.slice(17)); controller.close(); };
      }}),{headers:{'Content-Type':'text/event-stream'}});
    };
    const bottom=input.getBoundingClientRect().bottom, sendBottom=send.getBoundingClientRect().bottom;
    assert(bottom<=w.innerHeight && sendBottom<=w.innerHeight,'Question box or send button below first viewport: '+JSON.stringify({bottom,sendBottom,height:w.innerHeight,console:d.querySelector('.ask-console').getBoundingClientRect().toJSON(),intro:d.querySelector('.ask-intro').getBoundingClientRect().toJSON(),header:d.querySelector('.site-header').getBoundingClientRect().toJSON()}));
    assert(d.documentElement.scrollWidth<=d.documentElement.clientWidth,'Horizontal overflow');
    assert(d.querySelectorAll('[data-ask-starter]').length===3,'Missing starters');
    d.querySelector('[data-ask-starter]').click();
    await wait(()=>release && d.querySelector('.is-pending')?.textContent.includes('Finding research sources'));
    assert(send.disabled,'Submit not locked');
    form.requestSubmit(); form.requestSubmit();
    assert(calls.length===1,'Duplicate paid request');
    assert(calls[0].stream && calls[0].conversation.length===0,'Wrong first request');
    release(); await wait(()=>!send.disabled);
    assert(d.querySelectorAll('.ask-message-assistant a').length>=2,'Sources are not clickable');
    assert(!d.querySelector('.ask-answer-detail').open,'Technical detail not collapsed');
    assert(!w.injected && !d.querySelector('.ask-message img'),'Unsafe answer HTML executed');
    assert(!d.querySelector('a[href^="javascript:"]'),'Unsafe source URL');
    mode='json'; input.value='Why?'; form.requestSubmit(); await wait(()=>!send.disabled);
    assert(calls.at(-1).conversation.length===2,'Follow-up context missing');
    mode='failure'; input.value='Preserve this question'; form.requestSubmit(); await wait(()=>!send.disabled);
    assert(input.value==='Preserve this question' && !retry.hidden,'Failure lost question or retry');
    mode='json'; retry.click(); await wait(()=>!send.disabled);
    assert(input.value==='','Successful retry did not clear input');
    mode='cancel'; input.value='Cancel this question'; form.requestSubmit();
    await wait(()=>calls.at(-1).question==='Cancel this question');
    d.querySelector('[data-ask-cancel]').click(); await wait(()=>!send.disabled);
    assert(input.value==='Cancel this question','Cancel lost question');
    d.querySelector('[data-ask-reset]').click();
    mode='json'; input.value='New topic'; form.requestSubmit(); await wait(()=>!send.disabled);
    assert(calls.at(-1).conversation.length===0,'Reset retained context');
    results.push({width:w.innerWidth,height:w.innerHeight,input_bottom:Math.round(bottom),send_bottom:Math.round(sendBottom),requests:calls.length});
    index++;
    if(index<sizes.length) return load();
    await fetch('/__ask_browser_result__',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({complete:true,results})});
  } catch(error) {
    await fetch('/__ask_browser_result__',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({complete:false,error:String(error),width:sizes[index][0],results})});
  }
}; load();
</script>'''


class AskHandler(mobile.HarnessHandler):
    def do_GET(self):
        if self.path.split('?', 1)[0] == '/__ask_browser__.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(HARNESS)
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/__ask_browser_result__':
            self.server.browser_result = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            self.send_response(204)
            self.end_headers()
            self.server.result_event.set()
        else:
            super().do_POST()


class AskIOBrowserTests(unittest.TestCase):
    def test_first_viewport_and_full_interaction_contract(self):
        chrome = mobile.chrome_binary()
        if not chrome:
            self.skipTest('Chrome unavailable; CI provisions Chrome')
        server = ThreadingHTTPServer(('127.0.0.1', 0), AskHandler)
        server.result_event = threading.Event()
        server.browser_result = None
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with tempfile.TemporaryDirectory(prefix='ask-io-browser-', ignore_cleanup_errors=True) as profile:
                process = subprocess.Popen([chrome, '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
                    f'--user-data-dir={profile}', '--window-size=1500,1000',
                    f'http://127.0.0.1:{server.server_port}/__ask_browser__.html'],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
                try:
                    self.assertTrue(server.result_event.wait(30), 'Browser returned no result')
                finally:
                    if process.poll() is None:
                        os.killpg(process.pid, signal.SIGTERM)
                        try:
                            process.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            os.killpg(process.pid, signal.SIGKILL)
                            process.wait(timeout=5)
            self.assertTrue(server.browser_result['complete'], server.browser_result)
            self.assertEqual([m['width'] for m in server.browser_result['results']], [390, 320, 1440])
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

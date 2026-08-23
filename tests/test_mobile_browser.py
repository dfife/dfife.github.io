import json
import os
import signal
import shutil
import subprocess
import tempfile
import threading
import time
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HARNESS_PATH = "/__evidence_monitor_mobile_overflow__.html"
RESULT_PATH = "/__evidence_monitor_mobile_overflow_result__"
READER_HARNESS_PATH = "/__reader_pages_mobile__.html"
READER_RESULT_PATH = "/__reader_pages_mobile_result__"
HARNESS = b"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Evidence Monitor mobile overflow browser regression</title>
  <style>
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
    iframe { display: block; width: 375px; height: 844px; border: 0; }
  </style>
</head>
<body>
  <iframe id="target" title="Evidence Monitor test target" src="/evidence-monitor.html?mobile-overflow-regression=1"></iframe>
  <script>
    const frame = document.getElementById("target");
    let attempts = 0;

    function finish() {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      const dependency = doc.querySelector(".monitor-dependency-root");
      const authorities = doc.querySelector(".monitor-authority-details");
      if (!dependency || !authorities || !doc.querySelector(".monitor-record")) {
        if (attempts++ < 200) window.setTimeout(finish, 50);
        return;
      }

      authorities.open = true;
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        const root = doc.documentElement;
        const body = doc.body;
        const nav = doc.querySelector(".nav-links");
        const table = doc.querySelector(".monitor-table-wrap");
        const metrics = {
          complete: true,
          user_agent: win.navigator.userAgent,
          target_inner_width: win.innerWidth,
          html_client_width: root.clientWidth,
          html_scroll_width: root.scrollWidth,
          body_client_width: body.clientWidth,
          body_scroll_width: body.scrollWidth,
          html_fits: root.scrollWidth <= root.clientWidth,
          body_fits: body.scrollWidth <= body.clientWidth,
          nav_internal_scroll_preserved: nav.scrollWidth > nav.clientWidth && getComputedStyle(nav).overflowX === "auto",
          table_internal_scroll_preserved: table.scrollWidth > table.clientWidth && getComputedStyle(table).overflowX === "auto"
        };
        fetch("/__evidence_monitor_mobile_overflow_result__", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(metrics),
          keepalive: true
        });
      }));
    }

    frame.addEventListener("load", finish);
  </script>
</body>
</html>
"""

READER_HARNESS = b"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reader pages mobile browser regression</title>
  <style>
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
    iframe { display: block; width: 375px; height: 844px; border: 0; }
  </style>
</head>
<body>
  <iframe id="target" title="Reader page test target"></iframe>
  <script>
    const pages = [
      "/", "/evidence-monitor.html", "/bridge-map.html",
      "/participate.html", "/glossary.html", "/ask.html"
    ];
    const frame = document.getElementById("target");
    const results = [];
    let pageIndex = 0;
    let attempts = 0;

    function inspect() {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      const path = pages[pageIndex];
      const dynamicReady = path === "/evidence-monitor.html"
        ? doc.querySelector(".reader-record")
        : path === "/bridge-map.html"
          ? doc.querySelector(".node")
          : doc.querySelector("main");
      if (!dynamicReady && attempts++ < 200) {
        window.setTimeout(inspect, 50);
        return;
      }
      const root = doc.documentElement;
      const body = doc.body;
      const nav = doc.querySelector(".nav-links");
      const links = [...doc.querySelectorAll("a[href]")];
      const overflowing_elements = [...doc.querySelectorAll("body *")]
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {tag: element.tagName, class_name: element.className || "", right: Math.round(rect.right), width: Math.round(rect.width)};
        })
        .filter(item => item.right > root.clientWidth + 1)
        .slice(0, 12);
      results.push({
        path,
        inner_width: win.innerWidth,
        html_client_width: root.clientWidth,
        html_scroll_width: root.scrollWidth,
        body_client_width: body.clientWidth,
        body_scroll_width: body.scrollWidth,
        html_fits: root.scrollWidth <= root.clientWidth,
        body_fits: body.scrollWidth <= body.clientWidth,
        nav_internal_scroll_preserved: nav.scrollWidth > nav.clientWidth && getComputedStyle(nav).overflowX === "auto",
        nav_scroll_behavior_correct: getComputedStyle(nav).overflowX === "auto" && nav.scrollWidth >= nav.clientWidth,
        overflowing_elements,
        all_links_keyboard_reachable: links.length > 0 && links.every(link => link.getAttribute("tabindex") !== "-1"),
        native_disclosures_valid: [...doc.querySelectorAll("details")].every(details => details.firstElementChild?.tagName === "SUMMARY"),
        rendered_node_count: doc.querySelectorAll(".node").length
      });
      pageIndex += 1;
      attempts = 0;
      if (pageIndex < pages.length) {
        frame.src = pages[pageIndex] + "?reader-mobile-regression=1";
        return;
      }
      fetch("/__reader_pages_mobile_result__", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({complete: true, results}),
        keepalive: true
      });
    }

    frame.addEventListener("load", inspect);
    frame.src = pages[0] + "?reader-mobile-regression=1";
  </script>
</body>
</html>
"""


class HarnessHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        request_path = self.path.split("?", 1)[0]
        if request_path == HARNESS_PATH:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(HARNESS)))
            self.end_headers()
            self.wfile.write(HARNESS)
            return
        if request_path == READER_HARNESS_PATH:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(READER_HARNESS)))
            self.end_headers()
            self.wfile.write(READER_HARNESS)
            return
        super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] not in {RESULT_PATH, READER_RESULT_PATH}:
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        try:
            self.server.browser_result = json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            self.send_error(400, str(exc))
            return
        self.send_response(204)
        self.end_headers()
        self.server.result_event.set()

    def log_message(self, _format, *args):
        return


def chrome_binary():
    configured = os.environ.get("IO_CHROME_BINARY")
    candidates = [configured] if configured else []
    candidates.extend(
        shutil.which(name)
        for name in (
            "google-chrome",
            "google-chrome-stable",
            "chrome",
            "chromium",
            "chromium-browser",
        )
    )
    candidates.extend(
        sorted(
            Path.home().glob(
                ".cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux*/chrome-headless-shell"
            ),
            reverse=True,
        )
    )
    candidates.extend(
        sorted(
            Path.home().glob(
                ".cache/ms-playwright/chromium-*/chrome-linux*/chrome"
            ),
            reverse=True,
        )
    )
    for candidate in candidates:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


class EvidenceMonitorChromeRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), HarnessHandler)
        cls.server.browser_result = None
        cls.server.result_event = threading.Event()
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join(timeout=5)

    def test_html_and_body_fit_client_width_with_internal_scroll_preserved(self):
        chrome = chrome_binary()
        if chrome is None:
            self.skipTest("Chrome/Chromium is unavailable; CI provisions stable Chrome")

        self.server.browser_result = None
        self.server.result_event.clear()
        with tempfile.TemporaryDirectory(
            prefix="io-mobile-chrome-", ignore_cleanup_errors=True
        ) as profile:
            process = subprocess.Popen(
                [
                    chrome,
                    "--headless=new",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    f"--user-data-dir={profile}",
                    "--window-size=390,844",
                    f"http://127.0.0.1:{self.server.server_port}{HARNESS_PATH}",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            deadline = time.monotonic() + 20
            try:
                while not self.server.result_event.wait(0.1):
                    if process.poll() is not None or time.monotonic() >= deadline:
                        break
            finally:
                if process.poll() is None:
                    os.killpg(process.pid, signal.SIGTERM)
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        os.killpg(process.pid, signal.SIGKILL)
                        process.wait(timeout=5)

        self.assertTrue(
            self.server.result_event.is_set(),
            f"Chrome did not return browser metrics; exit={process.returncode}",
        )
        metrics = self.server.browser_result
        self.assertEqual(metrics["target_inner_width"], 375)
        self.assertLessEqual(metrics["html_scroll_width"], metrics["html_client_width"])
        self.assertLessEqual(metrics["body_scroll_width"], metrics["body_client_width"])
        self.assertTrue(metrics["html_fits"])
        self.assertTrue(metrics["body_fits"])
        self.assertTrue(metrics["nav_internal_scroll_preserved"])
        self.assertTrue(metrics["table_internal_scroll_preserved"])

    def test_reader_pages_fit_mobile_and_keep_native_keyboard_controls(self):
        chrome = chrome_binary()
        if chrome is None:
            self.skipTest("Chrome/Chromium is unavailable; CI provisions stable Chrome")

        self.server.browser_result = None
        self.server.result_event.clear()
        with tempfile.TemporaryDirectory(
            prefix="io-reader-mobile-chrome-", ignore_cleanup_errors=True
        ) as profile:
            process = subprocess.Popen(
                [
                    chrome,
                    "--headless=new",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    f"--user-data-dir={profile}",
                    "--window-size=390,844",
                    f"http://127.0.0.1:{self.server.server_port}{READER_HARNESS_PATH}",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            deadline = time.monotonic() + 35
            try:
                while not self.server.result_event.wait(0.1):
                    if process.poll() is not None or time.monotonic() >= deadline:
                        break
            finally:
                if process.poll() is None:
                    os.killpg(process.pid, signal.SIGTERM)
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        os.killpg(process.pid, signal.SIGKILL)
                        process.wait(timeout=5)

        self.assertTrue(
            self.server.result_event.is_set(),
            f"Chrome did not return reader-page metrics; exit={process.returncode}",
        )
        payload = self.server.browser_result
        self.assertTrue(payload["complete"])
        self.assertEqual(len(payload["results"]), 6)
        for metrics in payload["results"]:
            with self.subTest(path=metrics["path"]):
                self.assertEqual(metrics["inner_width"], 375)
                self.assertLessEqual(metrics["html_scroll_width"], metrics["html_client_width"], metrics["overflowing_elements"])
                self.assertLessEqual(metrics["body_scroll_width"], metrics["body_client_width"], metrics["overflowing_elements"])
                self.assertTrue(metrics["html_fits"])
                self.assertTrue(metrics["body_fits"])
                self.assertTrue(metrics["nav_scroll_behavior_correct"])
                self.assertTrue(metrics["all_links_keyboard_reachable"])
                self.assertTrue(metrics["native_disclosures_valid"])
                if metrics["path"] == "/bridge-map.html":
                    self.assertEqual(metrics["rendered_node_count"], 70)


if __name__ == "__main__":
    unittest.main()

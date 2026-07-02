# Ask IO Chatbot Local Ownership

The public Ask IO page is:

```text
https://dfife.github.io/ask.html
```

This static checkout contains the browser-facing page and JavaScript:

```text
/opt/cosmology-lab/tmp/dfife.github.io/ask.html
/opt/cosmology-lab/tmp/dfife.github.io/assets/js/ask.js
/opt/cosmology-lab/tmp/dfife.github.io/assets/css/site.css
```

The backend gateway is managed in:

```text
/opt/cosmology-lab/io_website_chat_gateway
```

Read the gateway operations note first:

```text
/opt/cosmology-lab/io_website_chat_gateway/README.md
```

Runtime path:

```text
ask.html -> assets/js/ask.js -> https://ask.fifeapp.io/api/ask
fallback -> https://ask.fifeapp.com/api/ask
backend -> io-chat-gateway.service -> io-mcp-gateway.service -> lab-state MCP
```

Layout ownership:

- The Ask page viewport layout is controlled in `assets/css/site.css` by the
  `.ask-page`, `.ask-shell`, `.ask-console`, `.ask-thread`, and `.ask-form`
  rules.
- The chat console is intentionally viewport-sized: desktop gives most width to
  the console column, and tablet/mobile stack the intro above a full-width chat
  panel.
- The Ask page should not create a horizontal page scrollbar. Long answer text,
  inline code, evidence blocks, and the mobile nav wrap or break inside their
  containers instead of widening the page.
- If the layout is changed, test desktop and mobile widths and keep the CSS
  cache-bust query in `ask.html` current.

Do not treat this static repo as the full chatbot implementation. It only owns
the published page and browser widget. The API behavior, IO evidence retrieval,
OpenAI composition, rate/domain guards, and systemd deployment live in
`/opt/cosmology-lab/io_website_chat_gateway`.

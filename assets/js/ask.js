(function () {
  const endpoints = [
    "https://ask.fifeapp.com",
    "https://ask.fifeapp.io"
  ];

  const form = document.querySelector("[data-ask-form]");
  const question = document.querySelector("#ask-question");
  const thread = document.querySelector("[data-ask-thread]");
  const counter = document.querySelector("[data-ask-counter]");
  const statusText = document.querySelector("[data-ask-status]");
  const statusDot = document.querySelector("[data-ask-status-dot]");

  let activeEndpoint = endpoints[0];

  function setStatus(text, state) {
    if (statusText) statusText.textContent = text;
    if (statusDot) statusDot.dataset.state = state;
  }

  function updateCounter() {
    if (!counter || !question) return;
    counter.textContent = `${question.value.length} / ${question.maxLength}`;
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderInline(value) {
    return escapeHtml(value)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function appendParagraph(container, lines) {
    const text = lines.join(" ").trim();
    if (!text) return;
    const paragraph = document.createElement("p");
    paragraph.innerHTML = renderInline(text);
    container.appendChild(paragraph);
  }

  function renderAnswer(container, text) {
    const lines = String(text || "").split(/\r?\n/);
    let paragraphLines = [];
    let list = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      const bullet = trimmed.match(/^[-*]\s+(.+)$/);
      if (!trimmed) {
        appendParagraph(container, paragraphLines);
        paragraphLines = [];
        list = null;
        return;
      }
      if (bullet) {
        appendParagraph(container, paragraphLines);
        paragraphLines = [];
        if (!list) {
          list = document.createElement("ul");
          container.appendChild(list);
        }
        const item = document.createElement("li");
        item.innerHTML = renderInline(bullet[1]);
        list.appendChild(item);
        return;
      }
      list = null;
      paragraphLines.push(trimmed);
    });
    appendParagraph(container, paragraphLines);
  }

  function addMessage(role, text) {
    const article = document.createElement("article");
    article.className = `ask-message ask-message-${role}`;

    renderAnswer(article, text);

    thread.appendChild(article);
    thread.scrollTop = thread.scrollHeight;
  }

  async function fetchJson(path, options) {
    let lastError;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${endpoint}${path}`, options);
        activeEndpoint = endpoint;
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  async function checkGateway() {
    try {
      await fetchJson("/health", { method: "GET" });
      setStatus(`Gateway online: ${new URL(activeEndpoint).host}`, "online");
    } catch (error) {
      setStatus("Gateway unavailable", "offline");
    }
  }

  async function ask(event) {
    event.preventDefault();
    const text = question.value.trim();
    if (!text) return;

    addMessage("user", text);
    question.value = "";
    updateCounter();
    const pending = document.createElement("article");
    pending.className = "ask-message ask-message-assistant is-pending";
    pending.innerHTML = "<p>Checking IO evidence...</p>";
    thread.appendChild(pending);
    thread.scrollTop = thread.scrollHeight;

    try {
      const payload = await fetchJson("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });
      pending.remove();
      addMessage("assistant", payload.answer || "No answer returned.");
      setStatus(`Gateway online: ${new URL(activeEndpoint).host}`, "online");
    } catch (error) {
      pending.remove();
      addMessage("assistant", "The IO gateway did not return a response. Please try again shortly.");
      setStatus("Gateway unavailable", "offline");
    }
  }

  if (question) {
    question.addEventListener("input", updateCounter);
    question.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      event.preventDefault();
      if (form.requestSubmit) {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
    updateCounter();
  }
  if (form) form.addEventListener("submit", ask);
  checkGateway();
})();

(function () {
  const endpoints = [
    "https://ask.fifeapp.io",
    "https://ask.fifeapp.com"
  ];

  const form = document.querySelector("[data-ask-form]");
  const question = document.querySelector("#ask-question");
  const thread = document.querySelector("[data-ask-thread]");
  const counter = document.querySelector("[data-ask-counter]");
  const statusText = document.querySelector("[data-ask-status]");
  const statusDot = document.querySelector("[data-ask-status-dot]");
  const submit = form.querySelector('[type="submit"]');
  const cancel = document.querySelector("[data-ask-cancel]");
  const retry = document.querySelector("[data-ask-retry]");
  const reset = document.querySelector("[data-ask-reset]");
  const starters = [...document.querySelectorAll("[data-ask-starter]")];
  const welcome = thread.innerHTML;

  let activeEndpoint = endpoints[0];
  let conversation = [];
  let controller = null;
  let busy = false;
  let hasAsked = false;

  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    reset.disabled = value;
    retry.disabled = value;
    starters.forEach(button => { button.disabled = value; });
    question.readOnly = value;
    cancel.hidden = !value;
    form.setAttribute("aria-busy", String(value));
  }

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
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noreferrer" target="_blank">$1</a>')
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

  function appendSources(container, sources) {
    if (!Array.isArray(sources) || !sources.length) return;
    const valid = sources.filter((source) => {
      if (!source || typeof source.title !== "string" || typeof source.url !== "string") return false;
      try {
        return new URL(source.url).protocol === "https:";
      } catch (error) {
        return false;
      }
    }).slice(0, 5);
    if (!valid.length) return;

    const sourceLine = document.createElement("p");
    sourceLine.className = "ask-answer-sources";
    const label = document.createElement("span");
    label.textContent = "Sources: ";
    sourceLine.appendChild(label);
    valid.forEach((source, index) => {
      if (index) sourceLine.appendChild(document.createTextNode(" · "));
      const link = document.createElement("a");
      link.href = source.url;
      link.textContent = source.title;
      link.target = "_blank";
      link.rel = "noreferrer";
      sourceLine.appendChild(link);
    });
    container.appendChild(sourceLine);
  }

  function addMessage(role, text, sources, details) {
    const article = document.createElement("article");
    article.className = `ask-message ask-message-${role}`;

    renderAnswer(article, text);
    if (role === "assistant" && details) {
      const disclosure = document.createElement("details");
      disclosure.className = "ask-answer-detail";
      const label = document.createElement("summary");
      label.textContent = "More detail";
      disclosure.appendChild(label);
      const body = document.createElement("div");
      renderAnswer(body, details);
      disclosure.appendChild(body);
      article.appendChild(disclosure);
    }
    if (role === "assistant") appendSources(article, sources);

    thread.appendChild(article);
    thread.scrollTop = thread.scrollHeight;
  }

  async function fetchJson(path, options) {
    let lastError;
    for (const endpoint of endpoints) {
      const healthController = new AbortController();
      const timeout = setTimeout(() => healthController.abort(), 4000);
      try {
        const response = await fetch(`${endpoint}${path}`, { ...options, signal: healthController.signal });
        activeEndpoint = endpoint;
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `HTTP ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
    }
    throw lastError;
  }

  async function checkGateway() {
    try {
      const payload = await fetchJson("/health", { method: "GET" });
      if (payload.ok !== true) throw new Error("unhealthy");
      if (!busy && !hasAsked) setStatus("Ready for your question", "online");
    } catch (error) {
      if (!busy && !hasAsked) setStatus("Connection unavailable — you can retry", "offline");
    }
  }

  async function readAnswer(response, onProgress) {
    if (!response.ok) {
      const error = new Error(response.status === 429 ? "rate_limit" : "http_failure");
      throw error;
    }
    if (!response.headers.get("content-type")?.includes("text/event-stream")) {
      return await response.json();
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const data = block.split("\n").filter(line => line.startsWith("data: ")).map(line => line.slice(6)).join("\n");
          if (!data) continue;
          const event = JSON.parse(data);
          if (event.type === "progress" && typeof event.stage === "string") onProgress(event.stage);
          if (event.type === "result") return event.payload;
        }
        if (buffer.length > 1000000) throw new Error("oversized_response");
        if (done) throw new Error("incomplete_response");
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }

  async function ask(event) {
    event.preventDefault();
    if (busy) return;
    const text = question.value.trim();
    if (!text) return;
    hasAsked = true;
    setBusy(true);
    retry.hidden = true;
    controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 310000);
    addMessage("user", text);
    const pending = document.createElement("article");
    pending.className = "ask-message ask-message-assistant is-pending";
    const progress = document.createElement("p");
    progress.textContent = "Understanding your question…";
    pending.appendChild(progress);
    setStatus("Working on your question", "working");
    thread.appendChild(pending);
    thread.scrollTop = thread.scrollHeight;

    try {
      // Do not replay a paid POST automatically after a connection failure.
      const response = await fetch(`${activeEndpoint}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ question: text, conversation: conversation.slice(-4), stream: true })
      });
      const payload = await readAnswer(response, stage => {
        progress.textContent = `${stage}…`;
        setStatus(stage, "working");
      });
      if (!payload || typeof payload.answer !== "string" || /unavailable/.test(payload.diagnostic || "")) {
        throw new Error("answer_unavailable");
      }
      pending.remove();
      addMessage("assistant", payload.summary || payload.answer, payload.sources, payload.details);
      conversation.push({role: "user", content: text}, {role: "assistant", content: payload.answer.slice(0, 4000)});
      conversation = conversation.slice(-4);
      question.value = "";
      updateCounter();
      setStatus("Ready — you can ask a follow-up", "online");
    } catch (error) {
      pending.remove();
      const cancelled = controller.signal.aborted && controller.signal.reason !== "timeout";
      const message = cancelled ? "Cancelled. Your question is still in the box." :
        error.message === "rate_limit" ? "Too many requests just now. Your question is preserved; please wait a minute and retry." :
        "I couldn’t finish this answer. Your question is preserved; please retry. This is a service problem, not a scientific finding.";
      addMessage("assistant", message);
      retry.hidden = false;
      setStatus(cancelled ? "Cancelled — ready when you are" : "Answer unavailable — retry", cancelled ? "online" : "offline");
    } finally {
      clearTimeout(timeout);
      controller = null;
      setBusy(false);
    }
  }

  cancel.addEventListener("click", () => controller?.abort());
  retry.addEventListener("click", () => form.requestSubmit());
  reset.addEventListener("click", () => {
    if (busy) return;
    conversation = [];
    thread.innerHTML = welcome;
    question.value = "";
    retry.hidden = true;
    updateCounter();
    question.focus({ preventScroll: true });
    setStatus("New chat — ready for your question", "online");
  });
  starters.forEach(button => button.addEventListener("click", () => {
    if (busy) return;
    question.value = button.dataset.askStarter;
    updateCounter();
    form.requestSubmit();
  }));

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

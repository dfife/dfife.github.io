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

  let activeEndpoint = endpoints[0];

  function setStatus(text, state) {
    if (statusText) statusText.textContent = text;
    if (statusDot) statusDot.dataset.state = state;
  }

  function updateCounter() {
    if (!counter || !question) return;
    counter.textContent = `${question.value.length} / ${question.maxLength}`;
  }

  function addMessage(role, text, evidence) {
    const article = document.createElement("article");
    article.className = `ask-message ask-message-${role}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.appendChild(paragraph);

    if (evidence) {
      const details = document.createElement("details");
      details.className = "ask-evidence";
      const summary = document.createElement("summary");
      summary.textContent = "Evidence packet";
      const pre = document.createElement("pre");
      pre.textContent = JSON.stringify(compactEvidence(evidence), null, 2);
      details.append(summary, pre);
      article.appendChild(details);
    }

    thread.appendChild(article);
    thread.scrollTop = thread.scrollHeight;
  }

  function compactEvidence(evidence) {
    if (!evidence || typeof evidence !== "object") return evidence;
    const compact = {
      source: evidence.source,
      query: evidence.query
    };
    if (evidence.status) compact.status = evidence.status;
    if (Array.isArray(evidence.items)) compact.items = evidence.items.slice(0, 3);
    if (evidence.claim_lookup) compact.claim_lookup = evidence.claim_lookup;
    if (evidence.truncated) compact.truncated = evidence.truncated;
    return compact;
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
      addMessage("assistant", payload.answer || "No answer returned.", payload.evidence);
      setStatus(`Gateway online: ${new URL(activeEndpoint).host}`, "online");
    } catch (error) {
      pending.remove();
      addMessage("assistant", "The IO gateway did not return a response. Please try again shortly.");
      setStatus("Gateway unavailable", "offline");
    }
  }

  if (question) {
    question.addEventListener("input", updateCounter);
    updateCounter();
  }
  if (form) form.addEventListener("submit", ask);
  checkGateway();
})();

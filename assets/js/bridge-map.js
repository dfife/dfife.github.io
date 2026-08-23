const CHANNEL_META = {
  static: { label: "Geometry connections", className: "static", summary: "Links built from geometry, gauge structure, or algebra." },
  dynamic: { label: "Thermal and time-dependent connections", className: "dynamic", summary: "Links that also require a chosen state, clock, horizon, or thermal condition." },
  mixed: { label: "Sources and transport", className: "mixed", summary: "Links involving matter sources, transport, formation history, or several stages." },
  fermionic: { label: "Matter near extreme density", className: "fermionic", summary: "Links involving spinor matter or torsion near the deepest-density regime." },
  quantum: { label: "Quantum foundations", className: "dynamic", summary: "Links centered on quantum states, information, or measurement structure." },
  quantum_gauge: { label: "Quantum gauge structure", className: "static", summary: "Links centered on gauge-invariant quantum fields and their allowed readouts." },
  quantum_gravity: { label: "Quantum-gravity structure", className: "fermionic", summary: "Links that directly compare quantum and gravitational structures." },
  outside: { label: "Outside the tested domain", className: "outside", summary: "Negative results or cases outside the scope of the proposed connection." }
};
const CHANNEL_ORDER = ["static", "dynamic", "mixed", "fermionic", "quantum", "quantum_gauge", "quantum_gravity", "outside"];
const state = { crossings: [], channel: "all", status: "all", search: "", selected: "" };

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function statusMeta(status) {
  const upper = String(status).toUpperCase();
  if (upper.includes("NO-GO")) return { key: "no-go", label: "Route ruled out in scope", technical: "NO-GO" };
  if (upper.includes("THEOREM")) return { key: "theorem", label: "Mathematically proved in scope", technical: "THEOREM" };
  if (upper.includes("DERIVED") && upper.includes("SCOPED")) return { key: "derived-scoped", label: "Derived in a limited scope", technical: "DERIVED/SCOPED" };
  if (upper.includes("CONDITIONAL")) return { key: "conditional", label: "Conditional result", technical: "CONDITIONAL" };
  if (upper.includes("CONTEXT") || upper.includes("DIAGNOSTIC")) return { key: "conditional", label: "Context only; not a current finding", technical: upper };
  if (upper.includes("OPEN")) return { key: "conditional", label: "Open problem", technical: upper };
  if (upper.includes("REPORT_ONLY")) return { key: "conditional", label: "Report only; not a banked result", technical: upper };
  if (upper.includes("QUARANTINED")) return { key: "conditional", label: "Historical projection; not current", technical: upper };
  if (upper.includes("DERIVED")) return { key: "derived", label: "Calculated in the historical model", technical: "DERIVED" };
  return { key: "derived", label: "Historical result with stated limits", technical: upper };
}

function normalizeStatus(status) {
  const key = statusMeta(status).key;
  if (key === "no-go") return "no-go";
  if (key === "conditional") return "conditional";
  return "derived";
}

function plainFinding(item) {
  const status = statusMeta(item.status);
  if (status.key === "no-go") return `For ${item.name}, the archived analysis rules out the proposed connection within the assumptions it tested.`;
  if (status.key === "theorem") return `For ${item.name}, the historical work proves a structural gravity–quantum connection inside its declared mathematical model.`;
  if (status.label.startsWith("Calculated")) return `For ${item.name}, the historical calculation derives a gravity–quantum connection inside its original model.`;
  if (status.label.startsWith("Context")) return `For ${item.name}, the archive preserves a comparison that is useful context but not a current finding.`;
  if (status.label === "Open problem") return `For ${item.name}, the proposed gravity–quantum connection remains open.`;
  return `For ${item.name}, the archive records a possible gravity–quantum connection with conditions that must remain attached.`;
}

function limitationFor(item) {
  const status = statusMeta(item.status);
  if (status.key === "no-go") return "The negative conclusion is limited to the route and assumptions tested in the original work.";
  if (status.key === "conditional") return "At least one premise remains conditional. The original status must travel with any quotation.";
  if (status.key === "theorem") return "The proof is structural and scoped; it is not automatically an observation or a test of the three universe models.";
  return "The calculation belongs to the historical IO Framework model and does not automatically transfer to the current three-branch comparison.";
}

function matchesFilters(item) {
  if (state.channel !== "all" && item.channel !== state.channel) return false;
  if (state.status !== "all" && normalizeStatus(item.status) !== state.status) return false;
  if (!state.search) return true;
  return [item.name, item.quantum_input, item.classical_output, item.constants.join(" "), item.summary, item.status, item.prediction, item.formula || "", item.formula_class || "", item.observation, item.papers.join(" ")].join(" ").toLowerCase().includes(state.search.toLowerCase());
}

function selectedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  state.selected = hashParams.get("crossing") || params.get("crossing") || state.selected;
  state.search = hashParams.get("search") || params.get("search") || state.search;
}

function syncUrl() {
  const params = new URLSearchParams();
  if (state.selected) params.set("crossing", state.selected);
  if (state.search) params.set("search", state.search);
  const fragment = params.toString();
  window.history.replaceState({}, "", fragment ? `${window.location.pathname}#${fragment}` : window.location.pathname);
}

function renderDetail(item) {
  const panel = document.getElementById("detail-panel");
  if (!item) {
    panel.innerHTML = `<div class="detail-header"><span class="badge outside">No results</span><h2 class="detail-title">No connection matches the filters</h2><p class="detail-summary">Try clearing the search or choosing a different category.</p></div>`;
    return;
  }
  const meta = CHANNEL_META[item.channel] || CHANNEL_META.outside;
  const status = statusMeta(item.status);
  const papers = item.papers.map((paper) => `Paper ${paper}`).join(", ");
  const zenodo = item.zenodo ? `<a class="button button-small button-outline" href="${escapeHtml(item.zenodo)}" target="_blank" rel="noreferrer">Open the public Zenodo record</a>` : "";
  panel.innerHTML = `<div class="detail-header"><span class="badge ${meta.className}">${escapeHtml(meta.label)}</span><p class="reader-question">What connection is this entry testing?</p><h2 class="detail-title">${escapeHtml(item.name)}</h2><p class="detail-summary">${escapeHtml(plainFinding(item))}</p></div>
    <div class="reader-result-grid bridge-reader-result"><section><h3>Plain status</h3><p>${escapeHtml(status.label)}</p></section><section><h3>Assumptions and limit</h3><p>${escapeHtml(limitationFor(item))}</p></section><section><h3>Why it matters</h3><p>It records one gravity–quantum hand-off in the historical framework. It is not a bound-versus-unbound vote or a model selector.</p></section></div>
    <div class="detail-actions">${zenodo}<a class="button button-small button-outline" href="papers.html">Browse the paper archive</a></div>
    <details class="technical-details bridge-technical"><summary>Technical details: inputs, outputs, formula, comparison, and original label</summary>
      <div class="detail-block"><div class="detail-label">Quantum input</div><div class="detail-value">${escapeHtml(item.quantum_input)}</div></div>
      <div class="detail-block"><div class="detail-label">Original archive summary</div><div class="detail-value">${escapeHtml(item.summary)}</div></div>
      <div class="detail-block"><div class="detail-label">Classical output</div><div class="detail-value">${escapeHtml(item.classical_output)}</div></div>
      <div class="detail-block"><div class="detail-label">Constants</div><div class="detail-value">${escapeHtml(item.constants.length ? item.constants.join(", ") : "none")}</div></div>
      ${item.formula ? `<div class="detail-block"><div class="detail-label">Formula</div><div class="detail-value"><code>${escapeHtml(item.formula)}</code></div><div class="detail-note">Formula class: <code>${escapeHtml(item.formula_class || "not declared")}</code></div></div>` : ""}
      <div class="detail-block"><div class="detail-label">Historical prediction</div><div class="detail-value">${escapeHtml(item.prediction)}</div></div>
      <div class="detail-block"><div class="detail-label">Historical comparison</div><div class="detail-value">${escapeHtml(item.observation)}</div><div class="detail-note">Residual: ${escapeHtml(item.residual)}</div></div>
      <div class="detail-block"><div class="detail-label">Original archive status</div><div class="detail-value"><code>${escapeHtml(item.status)}</code></div></div>
      <div class="detail-block"><div class="detail-label">Source papers</div><div class="detail-value">${escapeHtml(papers)}</div></div>
    </details>`;
}

function renderBoard() {
  const board = document.getElementById("bridge-board");
  const filtered = state.crossings.filter(matchesFilters);
  if (!new Set(filtered.map((item) => item.name)).has(state.selected)) state.selected = filtered[0]?.name || "";
  renderDetail(filtered.find((item) => item.name === state.selected) || null);
  syncUrl();
  if (!filtered.length) { board.innerHTML = `<div class="empty-state">No connections match this filter combination.</div>`; return; }
  board.innerHTML = "";
  CHANNEL_ORDER.forEach((channel) => {
    if (state.channel !== "all" && state.channel !== channel) return;
    const items = filtered.filter((item) => item.channel === channel);
    if (!items.length) return;
    const meta = CHANNEL_META[channel];
    const lane = document.createElement("section");
    lane.className = "lane-card";
    lane.innerHTML = `<div class="lane-head"><div class="lane-title-wrap"><p class="lane-kicker">Connection family</p><h2 class="lane-title">${escapeHtml(meta.label)}</h2><p class="lane-summary">${escapeHtml(meta.summary)}</p></div><div class="lane-count">${items.length} entr${items.length === 1 ? "y" : "ies"}</div></div>`;
    const grid = document.createElement("div"); grid.className = "node-grid";
    items.slice().sort((a, b) => a.papers[0] - b.papers[0]).forEach((item) => {
      const status = statusMeta(item.status);
      const button = document.createElement("button");
      button.type = "button"; button.className = `node ${meta.className}${item.name === state.selected ? " active" : ""}`; button.setAttribute("aria-pressed", item.name === state.selected ? "true" : "false");
      button.innerHTML = `<div class="node-top"><h3 class="node-name">${escapeHtml(item.name)}</h3><span class="badge status-badge status-${status.key}">${escapeHtml(status.label)}</span></div><p class="node-summary">${escapeHtml(plainFinding(item))}</p><p class="node-reader-hint">Select for assumptions, limits, and public sources.</p>`;
      button.addEventListener("click", () => { state.selected = item.name; renderBoard(); }); grid.appendChild(button);
    });
    lane.appendChild(grid); board.appendChild(lane);
  });
}

function setActiveButton(groupId, attr, value) {
  document.getElementById(groupId)?.querySelectorAll(".filter-button").forEach((button) => button.classList.toggle("active", button.dataset[attr] === value));
}

function wireFilters() {
  document.querySelectorAll("#channel-filters .filter-button").forEach((button) => button.addEventListener("click", () => { state.channel = button.dataset.channel; setActiveButton("channel-filters", "channel", state.channel); renderBoard(); }));
  document.querySelectorAll("#status-filters .filter-button").forEach((button) => button.addEventListener("click", () => { state.status = button.dataset.status; setActiveButton("status-filters", "status", state.status); renderBoard(); }));
  const search = document.getElementById("bridge-search");
  if (search) { search.value = state.search; search.addEventListener("input", () => { state.search = search.value.trim(); renderBoard(); }); }
}

async function init() {
  selectedFromUrl(); wireFilters();
  try {
    const response = await fetch("data/crossings.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.crossings = await response.json(); renderBoard();
  } catch (error) {
    document.getElementById("bridge-board").innerHTML = `<div class="empty-state">The historical crossing data could not be loaded. No result is inferred.</div>`;
  }
}
init();

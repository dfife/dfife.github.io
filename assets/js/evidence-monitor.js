const BRANCH_META = [
  ["schwarzschild", "S", "Schwarzschild bound"],
  ["kerr", "K", "Kerr bound"],
  ["unbounded_universe", "I", "Infinite / unbound"]
];

const monitorState = { records: [], search: "", direction: "all" };

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function branchClass(value) {
  if (value === "UNTESTED") return "debt";
  if (value === "INVALID" || value === "DOES_NOT_APPLY") return "incompatible";
  if (value.includes("PROVEN")) return "applies";
  return "conditional";
}

function branchLabel(value) {
  if (value === "UNTESTED") return "UNTESTED · check debt";
  if (value === "INVALID") return "INVALID · does not apply";
  return value.replaceAll("_", " ");
}

function recordMatches(record) {
  if (monitorState.direction !== "all" && record.evidential_assessment.direction !== monitorState.direction) {
    return false;
  }
  if (!monitorState.search) return true;
  const branchText = Object.values(record.per_branch_validity)
    .map((entry) => `${entry.value} ${entry.scope} ${entry.named_obstruction || ""}`)
    .join(" ");
  const text = [
    record.canonical_id,
    record.title,
    record.current_label,
    branchText,
    record.evidential_assessment.basis,
    record.evidential_assessment.data_lineage,
    record.qm_gr_map_triage.classification,
    record.qm_gr_map_triage.directionality || "",
    record.qm_gr_map_triage.scope || ""
  ].join(" ").toLowerCase();
  return text.includes(monitorState.search);
}

function renderBranch(branchKey, shortLabel, displayLabel, branch) {
  const debt = branch.value === "UNTESTED"
    ? `<p class="monitor-debt-route"><strong>Resolution route:</strong> ${escapeHtml(branch.resolution_route || "No route recorded.")}</p>`
    : "";
  const obstruction = branch.named_obstruction
    ? `<p class="monitor-debt-route"><strong>Named obstruction:</strong> ${escapeHtml(branch.named_obstruction)}</p>`
    : "";
  return `
    <section class="monitor-branch ${branchClass(branch.value)}" aria-label="${escapeHtml(displayLabel)} compatibility">
      <div class="monitor-branch-head"><span aria-hidden="true" class="monitor-branch-letter">${shortLabel}</span><strong>${escapeHtml(displayLabel)}</strong></div>
      <span class="monitor-pill ${branchClass(branch.value)}">${escapeHtml(branchLabel(branch.value))}</span>
      <p>${escapeHtml(branch.scope)}</p>
      ${obstruction}${debt}
    </section>`;
}

function renderRecord(record) {
  const evidence = record.evidential_assessment;
  const triage = record.qm_gr_map_triage;
  const branchHtml = BRANCH_META
    .map(([key, shortLabel, label]) => renderBranch(key, shortLabel, label, record.per_branch_validity[key]))
    .join("");
  return `
    <details class="monitor-record">
      <summary>
        <span class="monitor-record-title-wrap">
          <span class="monitor-record-title">${escapeHtml(record.title)}</span>
          <span class="monitor-record-id">${escapeHtml(record.canonical_id)}</span>
        </span>
        <span class="monitor-summary-pills">
          <span class="monitor-pill evidence-${escapeHtml(evidence.direction)}">${escapeHtml(evidence.direction)}</span>
          <span class="monitor-pill grqm">GR–QM: ${escapeHtml(triage.classification)}</span>
          <span class="monitor-pill selector">${escapeHtml(evidence.selector_status)}</span>
        </span>
      </summary>
      <div class="monitor-record-body">
        <div class="monitor-record-meta"><span>${escapeHtml(record.current_label)}</span><span>ACTIVE_LOAD_BEARING</span></div>
        <div class="monitor-branch-grid">${branchHtml}</div>
        <div class="monitor-axis-grid">
          <section class="monitor-axis-card">
            <p class="section-kicker">Evidential assessment</p>
            <h3>${escapeHtml(evidence.direction)} · ${escapeHtml(evidence.strength)} strength</h3>
            <p>${escapeHtml(evidence.basis)}</p>
            <dl><dt>Data lineage</dt><dd>${escapeHtml(evidence.data_lineage)}</dd><dt>Independence group</dt><dd><code>${escapeHtml(evidence.independence_group)}</code></dd></dl>
          </section>
          <section class="monitor-axis-card">
            <p class="section-kicker">Always-running GR–QM cross-check</p>
            <h3>${escapeHtml(triage.classification)}</h3>
            <p>${escapeHtml(triage.scope || "No public scope note supplied.")}</p>
            <dl><dt>Directionality</dt><dd>${escapeHtml(triage.directionality || "not specified")}</dd><dt>Selector</dt><dd>${escapeHtml(evidence.selector_status)}</dd></dl>
          </section>
        </div>
        <p class="monitor-sha"><strong>Current source SHA256:</strong> <code>${escapeHtml(record.source_sha256)}</code></p>
      </div>
    </details>`;
}

function renderRecords() {
  const host = document.getElementById("monitor-records");
  const filtered = monitorState.records.filter(recordMatches);
  host.innerHTML = filtered.length
    ? filtered.map(renderRecord).join("")
    : `<div class="empty-state">No current record matches these filters.</div>`;
}

function renderSummary(data) {
  const summary = document.getElementById("monitor-summary");
  summary.innerHTML = `
    <article class="monitor-summary-card"><span>Current records</span><strong>${data.summary.current_consumer_facing_records}</strong></article>
    <article class="monitor-summary-card"><span>Compatibility debt cells</span><strong>${data.summary.compatibility_debt_cells}</strong></article>
    <article class="monitor-summary-card"><span>Governed aggregate</span><strong>${escapeHtml(data.overall.display)}</strong></article>`;

  const overall = document.getElementById("monitor-overall");
  overall.innerHTML = `<span class="monitor-overall-label">Overall program assessment</span><strong>${escapeHtml(data.overall.display)}</strong><span>${escapeHtml(data.overall.reason || "See the governed aggregate record.")}</span>`;

  const authorities = document.getElementById("monitor-authorities");
  const items = Object.entries(data.authorities)
    .map(([name, authority]) => `<li><strong>${escapeHtml(name.replaceAll("_", " "))}</strong>: <code>${escapeHtml(authority.record_id)}</code><br/><span>SHA256 ${escapeHtml(authority.sha256)}</span></li>`)
    .join("");
  authorities.innerHTML = `
    <p>Projection schema <code>${escapeHtml(data.schema_version)}</code>; records current through ${escapeHtml(data.generated_from_authoritative_records_through || "unspecified")}.</p>
    <ul>${items}</ul>
    <p><a class="section-link" href="data/evidence-monitor.json">Open the machine-readable monitor →</a></p>`;
}

async function initializeMonitor() {
  try {
    const response = await fetch("data/evidence-monitor.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    monitorState.records = data.records;
    renderSummary(data);
    renderRecords();
  } catch (error) {
    document.getElementById("monitor-overall").innerHTML = `<span class="monitor-overall-label">Overall program assessment</span><strong>Unavailable</strong><span>The authoritative projection could not be loaded. No assessment is inferred.</span>`;
    document.getElementById("monitor-records").innerHTML = `<div class="empty-state">Evidence Monitor unavailable: ${escapeHtml(error.message)}. This fail-closed state does not imply a lean or incompatibility.</div>`;
  }
}

document.getElementById("monitor-search")?.addEventListener("input", (event) => {
  monitorState.search = event.target.value.trim().toLowerCase();
  renderRecords();
});

document.getElementById("monitor-direction")?.addEventListener("change", (event) => {
  monitorState.direction = event.target.value;
  renderRecords();
});

initializeMonitor();

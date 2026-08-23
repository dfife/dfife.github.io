const BRANCH_META = [
  ["schwarzschild", "S", "Schwarzschild", "bound, nonrotating model"],
  ["kerr", "K", "Kerr", "bound, rotating model"],
  ["unbounded_universe", "I", "Infinite", "unbounded model"]
];

const RECORD_COPY = {
  IO_EMPIRICAL_MATTER_AND_GRAVITATING_RESIDUAL_EXISTENCE_DISPOSITION_CC037_JOB1_2026_08_18: {
    question: "What does observation require every viable universe model to contain?",
    finding: "Visible matter and an additional gravitating residual are treated as observed phenomena that every branch must accommodate.",
    assumptions: "The import establishes existence at the observed domain; it does not identify what the residual is or how it formed.",
    unresolved: "The local map from the observed gravitational effect to a specific stress–energy source remains open.",
    why: "It prevents any branch from explaining away observed matter, while giving no branch a directional advantage."
  },
  IO_EXACT_KERR_COLLAR_FINITE_SPIN_BINARY_CURVATURE_CARRIER_2026_07_24: {
    question: "Would rotation leave an exact geometric marker in the local Kerr model?",
    finding: "Yes. On the accepted local Kerr region, signed rotation produces a nonzero curvature response.",
    assumptions: "This is a local Kerr calculation with its stated smoothness and finite-spin conditions.",
    unresolved: "No complete map yet carries that local marker to a measured sky signal or establishes a global Kerr universe.",
    why: "It identifies something rotation could imprint, but it does not measure cosmic rotation or favor Kerr by itself."
  },
  IO_LOCAL_DIRECTION_ODD_SACHS_MAGNETIC_WEYL_SKY_MAP_2026_07_24: {
    question: "Can local light propagation distinguish the direction of Kerr rotation?",
    finding: "Within the accepted local region, an orientation-sensitive light-propagation signal can be written and inverted.",
    assumptions: "The calculation uses the local Kerr collar and a specified Sachs optical readout.",
    unresolved: "The local construction has not been transported through a complete global spacetime to an actual observer’s sky.",
    why: "It supplies a possible readout channel, not an observation or a branch selector."
  },
  IO_MODEL_INDEPENDENT_COMPACT_CAUCHY_LCQFT_THERMODYNAMIC_INFORMATION_BASIS_2026_08_02: {
    question: "Can quantum fields and information be described consistently on a finite spatial universe?",
    finding: "A mathematical information framework is available for quantum fields on compact spatial slices.",
    assumptions: "The spacetime has compact Cauchy slices and satisfies the stated locally covariant quantum-field conditions.",
    unresolved: "The framework does not choose the universe’s topology, quantum state, or observer readout.",
    why: "It shows that finite spatial geometry is not automatically incompatible with the quantum description used here."
  },
  IO_MODEL_INDEPENDENT_COMPACT_CAUCHY_MAXWELL_CHARGE_CLOSURE_AND_U1_FLUX_SECTOR_FRONTIER_2026_08_03: {
    question: "What charge constraints follow from a compact universe with no outer boundary?",
    finding: "The global Maxwell equations impose a total-charge closure condition while leaving distinct flux sectors possible.",
    assumptions: "The result concerns compact Cauchy slices and the stated Maxwell gauge structure.",
    unresolved: "Global charge closure alone does not determine local matter couplings, the realized flux sector, or an observable signature.",
    why: "It is a consistency constraint for compact models, not evidence that the universe is compact."
  },
  IO_MODEL_INDEPENDENT_COMPACT_TOPOLOGY_GLOBAL_GR_BASIS_2026_08_02: {
    question: "Which general-relativistic constraints come specifically from compact spatial topology?",
    finding: "A common mathematical basis separates global compact-topology constraints from assumptions tied to a named metric.",
    assumptions: "Compact spatial topology is supplied; no particular curvature sign or black-hole geometry is selected.",
    unresolved: "Observation has not selected which, if any, compact topology describes our universe.",
    why: "It keeps several finite-universe possibilities open without mistaking a broad consistency result for support."
  },
  IO_MODEL_INDEPENDENT_GAUGE_INVARIANT_MAXWELL_COHERENCY_PLANCK_MEAN_RESPONSE_BRIDGE_AND_QUANTUM_LIFT_NONUNIQUENESS_2026_08_02: {
    question: "Can an electromagnetic quantum state be connected to a classical thermal readout without gauge ambiguity?",
    finding: "A gauge-invariant mean-response bridge can be defined, but the underlying quantum state is not uniquely recoverable from it.",
    assumptions: "The stated Maxwell coherence class and Planck mean-response measurement model are used.",
    unresolved: "Additional information would be needed to select a unique quantum realization.",
    why: "It identifies both a valid GR–QM connection and a hard limit on what the readout can prove."
  },
  IO_MODEL_INDEPENDENT_HORIZON_INTERIOR_CLASSIFICATION_NONCATEGORICITY_2026_07_30: {
    question: "Do the retained horizon observations uniquely determine the hidden interior?",
    finding: "No. Inside the theorem’s stated class, the retained data do not uniquely determine one interior development.",
    assumptions: "The conclusion is restricted to the theorem’s marked horizon/interior class and complete retained-data map.",
    unresolved: "One required zero-spin Schwarzschild witness has not yet been constructed, so that branch cell remains untested.",
    why: "It warns that a horizon appearance alone may not identify a unique universe model."
  },
  IO_MODEL_INDEPENDENT_LOCAL_SCALAR_GAUSSIAN_MEASUREMENT_CHANNEL_AND_SELECTOR_FRONTIER_2026_08_02: {
    question: "Can a local noisy measurement channel select one global universe model?",
    finding: "The measurement channel can be constructed, but it does not automatically become a unique global selector.",
    assumptions: "The result uses a local scalar Gaussian measurement class with its stated noise and readout rules.",
    unresolved: "A genuine selector would require additional injective information that has not been established.",
    why: "It formalizes why local measurements can be informative without deciding the global bound-or-unbound question."
  },
  IO_MODEL_INDEPENDENT_OBSERVATION_CHANNEL_IDENTIFIABILITY_AND_FINITE_DATA_FOUNDATION_2026_08_02: {
    question: "When can finite observations identify the underlying universe model?",
    finding: "Identification requires an observation map that remains one-to-one after physical and measurement degeneracies are removed.",
    assumptions: "The candidate class, observation channel, and retained data must all be declared.",
    unresolved: "No complete one-to-one map has been proved for the three universe branches.",
    why: "It provides the test any future claim of model selection would have to pass."
  },
  IO_MODEL_INDEPENDENT_PLANCK_HFI_STOKES_RESPONSE_QUOTIENT_AND_MAXWELL_STATE_NONIDENTIFIABILITY_2026_08_02: {
    question: "Can Planck polarization readouts recover a unique electromagnetic quantum state?",
    finding: "No. The instrument response preserves only a quotient of the state information, leaving multiple states observationally equivalent.",
    assumptions: "The conclusion uses the stated Planck HFI Stokes-response model and Maxwell state class.",
    unresolved: "A richer, independently justified readout would be needed to break the remaining degeneracy.",
    why: "It prevents overclaiming what existing polarization measurements can identify."
  },
  IO_MODEL_INDEPENDENT_QUANTUM_TO_CLASSICAL_RELATIVE_ENTROPY_OBSERVATION_BRIDGE_2026_08_02: {
    question: "How much quantum-state distinguishability survives into a classical observation?",
    finding: "A relative-entropy inequality bounds the information that can survive the measurement channel.",
    assumptions: "The quantum states and classical observation channel satisfy the theorem’s information-theoretic conditions.",
    unresolved: "The inequality does not by itself supply a cosmological state, detector, or branch-specific prediction.",
    why: "It gives the GR–QM program a rigorous information-loss bound without turning it into cosmological evidence."
  },
  Q243_PAPER1_KERR_HORIZON_LOCAL_SPECTRAL_THEOREM_SCHEMA_V6_WRAPPER_2026_07_09: {
    question: "Does a local Kerr horizon support the stated thermal spectral readout?",
    finding: "Yes, conditionally, for the declared stationary future-horizon field theory and positive-frequency sector.",
    assumptions: "The result is local to a Kerr horizon and depends on the stated state, generator, regularity, and readout choices.",
    unresolved: "Standalone Schwarzschild and governed Infinite-host derivations are still missing.",
    why: "It is a concrete gravity–quantum connection in one branch, not proof that the universe is Kerr."
  }
};

const monitorState = { records: [], search: "", direction: "all" };

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function humanDirection(value, strength = "") {
  const labels = { bound: "leans bound", unbound: "leans unbound", neutral: "no directional lean", indeterminate: "direction not established", "mixed/indeterminate": "mixed or unresolved" };
  const base = labels[value] || String(value).replaceAll("_", " ");
  if (!strength || strength === "none") return base;
  const strengths = {
    "very low structural economy": "very low; model simplicity only",
    "very low structural/model-conditioned consistency": "very low; model-conditioned",
    "very low end of slight": "very low",
    "very low context": "very low; context only"
  };
  return `${base} · ${strengths[strength] || String(strength).replaceAll("_", " ")} confidence`;
}

function humanScientificStatus(label) {
  const value = String(label);
  if (value === "IMPORTED/EMPIRICAL") return "Observed input, with interpretation limits";
  if (value.includes("THEOREM")) return "Mathematically proved under stated assumptions";
  if (value.includes("CONDITIONAL_VERIFIED")) return "Mathematically derived under stated assumptions";
  if (value.includes("CONTEXT_DIAGNOSTIC_COMPARISON")) return "Useful comparison, not evidence for a particular branch";
  if (value.includes("NO-GO")) return "A proposed route is ruled out within its stated scope";
  return "Current result with stated conditions";
}

function humanBranch(value) {
  if (value === "UNTESTED") return "Applicability to this branch remains unresolved";
  if (value === "INVALID" || value === "DOES_NOT_APPLY") return "Does not apply";
  if (value.includes("PROVEN")) return "Applies under the stated assumptions";
  if (value.includes("ADDITION") || value.includes("PARTIAL")) return "May apply with named additional work";
  return "Conditional or limited applicability";
}

function branchClass(value) {
  if (value === "UNTESTED") return "debt";
  if (value === "INVALID" || value === "DOES_NOT_APPLY") return "incompatible";
  if (value.includes("PROVEN")) return "applies";
  return "conditional";
}

function humanGrqm(classification) {
  const labels = { core: "central GR–QM connection", supporting: "supports the continuing GR–QM check", candidate: "possible connection still being tested", blocked: "connection locally blocked by a named gap", not_relevant: "no GR–QM connection needed for this result", untested: "GR–QM connection not yet tested" };
  return labels[classification] || String(classification).replaceAll("_", " ");
}

function humanSelector(value) {
  return value === "selector" ? "Claims a model-selection result" : "Does not determine whether the universe is bound or unbound";
}

function humanTreatment(value) {
  const text = String(value);
  if (text.startsWith("INCLUDED_EMPIRICAL")) return "Included as one empirical evidence group";
  if (text.startsWith("INCLUDED_STRUCTURAL")) return "Included only in the separate structural-simplicity ledger";
  if (text.includes("DEPENDENT_CHILD")) return "Shown for context, but not counted independently";
  if (text.includes("PENDING") || text.includes("OPEN")) return "Pending: required work remains open";
  if (text.includes("EXCLUDED")) return "Not included in the directional assessment";
  return "Displayed with its stated limits";
}

function plainCodeText(value) {
  return String(value)
    .replaceAll("PLANCK_CMB_GEOMETRY/Q423", "the adverse Kerr acoustic-scale comparison")
    .replaceAll("S0=P1_BOUND_COSMOLOGICAL_CHASSIS", "the shared bound-model premise family")
    .replaceAll("Q39", "the dependent mass–radius consistency item")
    .replaceAll("Q423", "the adverse Kerr acoustic-scale comparison")
    .replaceAll("S0", "the shared bound-model premise family")
    .replaceAll("CMB/BAO", "cosmic-background and galaxy-distance")
    .replaceAll("DESI/BAO", "galaxy-distance");
}

function plainInventoryCandidate(row) {
  const replacements = {
    "INV-04": "the approximate universe-scale mass/radius alignment",
    "INV-06": "the proposed boundary effect on primordial nuclear reaction rates",
    "INV-07": "the Kerr acoustic angular-scale comparison",
    "INV-09": "new galaxy-distance and dark-energy context",
    "INV-10": "the Hubble tension between local and early-universe expansion estimates",
    "INV-11": "the structure-growth tension",
    "INV-12": "the primordial lithium-abundance discrepancy",
    "INV-13": "the cosmic-background lensing-amplitude anomaly",
    "INV-16": "the largest-angle cosmic-background anomalies",
    "INV-18": "the cosmological neutrino-mass tension",
    "INV-20": "the possible rotation of cosmic-background polarization",
    "INV-27": "the continuing gravity–quantum cross-check",
    "INV-28": "the current model-compatibility register"
  };
  return replacements[row.evidence_id] || row.candidate;
}

function plainInventoryFinding(row) {
  if (row.evidence_id === "INV-07") return "The tested rotating bound model misses the reference acoustic angular scale by about 4.4%, and the allowed source-phase completion cannot remove that miss.";
  return String(row.discriminating_rationale)
    .replaceAll("bound chassis", "bound-model assumptions")
    .replaceAll("bound premise stack", "bound-model assumptions")
    .replaceAll("hostile unbounded transplant", "unbound model")
    .replaceAll("hostile transplants", "unbound models")
    .replaceAll("unbounded control", "unbound model")
    .replaceAll("C_l", "cosmic-background angular spectrum")
    .replaceAll("low-l", "largest-angle")
    .replaceAll("TB/EB", "polarization-rotation")
    .replaceAll("a_star and direction n_spin", "and direction")
    .replaceAll("w0/wa", "dark-energy evolution");
}

function recordMatches(record) {
  if (monitorState.direction !== "all" && record.evidential_assessment.direction !== monitorState.direction) return false;
  if (!monitorState.search) return true;
  const copy = RECORD_COPY[record.canonical_id] || {};
  const branchText = Object.values(record.per_branch_validity).map((entry) => `${entry.value} ${entry.scope} ${entry.named_obstruction || ""}`).join(" ");
  return [record.canonical_id, record.title, record.current_label, branchText, record.evidential_assessment.basis, record.evidential_assessment.data_lineage, record.qm_gr_map_triage.classification, ...Object.values(copy)].join(" ").toLowerCase().includes(monitorState.search);
}

function renderBranch(key, shortLabel, label, description, branch) {
  return `<section class="monitor-branch ${branchClass(branch.value)}" aria-label="${escapeHtml(label)} compatibility">
    <div class="monitor-branch-head"><span aria-hidden="true" class="monitor-branch-letter">${shortLabel}</span><strong>${escapeHtml(label)}</strong><span class="branch-description">${escapeHtml(description)}</span></div>
    <span class="monitor-pill ${branchClass(branch.value)}">${escapeHtml(humanBranch(branch.value))}</span>
    <p>${escapeHtml(branch.scope)}</p>
    ${branch.value === "UNTESTED" ? `<p><strong>What would resolve it:</strong> ${escapeHtml(branch.resolution_route || "No route is recorded.")}</p>` : ""}
    ${branch.named_obstruction ? `<p><strong>Current obstacle:</strong> ${escapeHtml(branch.named_obstruction)}</p>` : ""}
    <details class="technical-details"><summary>Technical branch label</summary><p><code>${escapeHtml(branch.value)}</code></p></details>
  </section>`;
}

function renderRecord(record) {
  const copy = RECORD_COPY[record.canonical_id] || { question: `What does “${record.title}” establish?`, finding: record.evidential_assessment.basis, assumptions: "See the exact model scopes below.", unresolved: "See the limitations and named branch debts below.", why: "It contributes to the current compatibility map under its stated scope." };
  const evidence = record.evidential_assessment;
  const triage = record.qm_gr_map_triage;
  const branches = BRANCH_META.map(([key, short, label, description]) => renderBranch(key, short, label, description, record.per_branch_validity[key])).join("");
  const publicProof = record.canonical_id.startsWith("Q243_")
    ? `<a class="section-link" href="papers/paper-01.html">Related public paper archive →</a>`
    : `<span>No separate public proof document is linked in this projection. <a class="section-link" href="data/evidence-monitor.json">View the public data entry →</a></span>`;
  return `<article class="monitor-record reader-record">
    <div class="reader-result-heading"><p class="reader-question">${escapeHtml(copy.question)}</p><h3>${escapeHtml(copy.finding)}</h3></div>
    <div class="reader-status-row"><span class="plain-status">${escapeHtml(humanScientificStatus(record.current_label))}</span><span class="plain-status">Used in the current research program</span><span class="plain-status">${escapeHtml(humanDirection(evidence.direction, evidence.strength))}</span><span class="plain-status">${escapeHtml(humanSelector(evidence.selector_status))}</span></div>
    <div class="reader-result-grid"><section><h4>Assumptions</h4><p>${escapeHtml(copy.assumptions)}</p></section><section><h4>Still unresolved</h4><p>${escapeHtml(copy.unresolved)}</p></section><section><h4>Why it matters</h4><p>${escapeHtml(copy.why)}</p></section></div>
    <p class="public-evidence-path"><strong>Public evidence path:</strong> ${publicProof}</p>
    <details class="reader-branch-details"><summary>Compare this result across the three models</summary><div class="monitor-branch-grid">${branches}</div></details>
    <details class="technical-details"><summary>Technical details: exact record, evidence, GR–QM, and source fields</summary>
      <div class="monitor-axis-grid"><section class="monitor-axis-card"><h4>Exact evidential assessment</h4><p>${escapeHtml(evidence.basis)}</p><dl><dt>Label</dt><dd><code>${escapeHtml(record.current_label)}</code></dd><dt>Direction / strength</dt><dd><code>${escapeHtml(evidence.direction)} / ${escapeHtml(evidence.strength)}</code></dd><dt>Data lineage</dt><dd>${escapeHtml(evidence.data_lineage)}</dd><dt>Independence group</dt><dd><code>${escapeHtml(evidence.independence_group)}</code></dd><dt>Selector status</dt><dd><code>${escapeHtml(evidence.selector_status)}</code></dd></dl></section>
      <section class="monitor-axis-card"><h4>Exact GR–QM triage</h4><p><strong>${escapeHtml(humanGrqm(triage.classification))}.</strong> ${escapeHtml(triage.scope || "No scope note supplied.")}</p><dl><dt>Classification</dt><dd><code>${escapeHtml(triage.classification)}</code></dd><dt>Directionality</dt><dd><code>${escapeHtml(triage.directionality || "not specified")}</code></dd><dt>Consumer surface</dt><dd><code>${escapeHtml(record.consumer_surface)}</code></dd></dl></section></div>
      <p class="monitor-sha"><strong>Canonical record ID:</strong> <code>${escapeHtml(record.canonical_id)}</code><br/><strong>Current source SHA256:</strong> <code>${escapeHtml(record.source_sha256)}</code></p>
    </details>
  </article>`;
}

function renderRecords() {
  const host = document.getElementById("monitor-records");
  const filtered = monitorState.records.filter(recordMatches);
  host.innerHTML = filtered.length ? filtered.map(renderRecord).join("") : `<div class="empty-state">No current result matches these filters.</div>`;
}

function inventoryClass(treatment) {
  if (String(treatment).startsWith("INCLUDED")) return "included";
  if (String(treatment).includes("PENDING") || String(treatment).includes("OPEN")) return "pending";
  return "excluded";
}

function renderAssessment(data) {
  const assessment = data.directional_assessment;
  const empirical = assessment.empirical;
  const structural = assessment.structural_economy;
  const sensitivity = assessment.sensitivity_audit.map((row) => `<tr><th scope="row">${escapeHtml(plainCodeText(row.perturbation))}</th><td>${escapeHtml(plainCodeText(row.empirical_posture))}</td><td>${escapeHtml(plainCodeText(row.structural_posture))}</td><td>${escapeHtml(plainCodeText(row.interpretation))}</td></tr>`).join("");
  document.getElementById("monitor-assessment").innerHTML = `
    <article class="monitor-assessment-lead"><p class="section-kicker">Current empirical reading</p><h2>Mixed evidence, with a fragile, very slight unbound-facing tilt</h2><p class="monitor-assessment-summary">One comparison puts pressure on one specific Kerr model. It does not test Schwarzschild numerically and does not show that an Infinite model fits. Removing this one comparison leaves no empirical lean.</p><p><strong>Plain confidence:</strong> very low. This is a direction worth tracking, not a winner.</p></article>
    <div class="monitor-axis-grid"><section class="monitor-axis-card"><h3>What drives the empirical tilt?</h3><p>${escapeHtml(plainCodeText(empirical.interpretation))}</p><p><strong>Counterweight:</strong> ${escapeHtml(empirical.countervailing_or_mixed_groups.map(plainCodeText).join("; "))}.</p></section><section class="monitor-axis-card"><h3>A separate structural result</h3><p>The bound-model premise family produces several related constructions with fewer added premises. That is a very-low-strength simplicity observation, not measured evidence, and it is never added arithmetically to the empirical tilt.</p></section></div>
    <div class="monitor-table-wrap"><table class="monitor-sensitivity-table"><caption>Does the conclusion change when an evidence group is removed?</caption><thead><tr><th>Check</th><th>Empirical result</th><th>Structural result</th><th>Meaning</th></tr></thead><tbody>${sensitivity}</tbody></table></div>
    <details class="technical-details"><summary>Technical assessment details</summary><dl><dt>Exact empirical display</dt><dd><code>${escapeHtml(empirical.display)}</code></dd><dt>Exact driver</dt><dd><code>${escapeHtml(empirical.driver)}</code></dd><dt>Exact structural root</dt><dd><code>${escapeHtml(structural.driver)}</code></dd><dt>Assessment source SHA256</dt><dd><code>${escapeHtml(assessment.assessment_source_sha256)}</code></dd></dl></details>`;
}

function renderInventory(data) {
  const root = data.dependency_hierarchy.structural_parent;
  const rows = data.full_evidential_inventory.map((row) => {
    const cssClass = inventoryClass(row.aggregate_treatment);
    const defaultWhy = row.direction === "bound" ? "It could modestly favor a bound model only if its rationale is independent and observational." : row.direction === "unbound" ? "It could put pressure on a bound model, but only within the tested model and dependencies." : "It currently supplies context or a research obligation rather than a direction.";
    const branches = BRANCH_META.map(([key, short, label]) => `<div class="inventory-branch"><strong>${short} · ${escapeHtml(label)}</strong><span>${escapeHtml(row.branch_compatibility[key])}</span></div>`).join("");
    return `<details class="monitor-record inventory-record reader-inventory ${cssClass}"><summary><span class="monitor-record-title-wrap"><span class="reader-question">Question: Does ${escapeHtml(plainInventoryCandidate(row).toLowerCase())} change the relative evidence?</span><span class="monitor-record-title">Finding: ${escapeHtml(plainInventoryFinding(row))}</span></span><span class="plain-status">${escapeHtml(humanTreatment(row.aggregate_treatment))}</span></summary>
      <div class="monitor-record-body"><div class="reader-result-grid"><section><h4>Confidence / status</h4><p>${escapeHtml(humanDirection(row.direction, row.qualitative_strength))}.</p></section><section><h4>Assumptions and limits</h4><p>${escapeHtml(row.limitations)}</p></section><section><h4>Why it matters</h4><p>${escapeHtml(defaultWhy)}</p></section></div>
      <details class="reader-branch-details"><summary>Compare this item across the three models</summary><div class="inventory-branch-grid">${branches}</div></details>
      <details class="technical-details"><summary>Technical inventory details</summary><dl><dt>Evidence ID</dt><dd><code>${escapeHtml(row.evidence_id)}</code></dd><dt>Object class</dt><dd><code>${escapeHtml(row.object_class)}</code></dd><dt>Project lifecycle</dt><dd>${escapeHtml(row.project_lifecycle)}</dd><dt>Scientific-result lifecycle</dt><dd>${escapeHtml(row.scientific_result_lifecycle)}</dd><dt>Aggregate treatment</dt><dd><code>${escapeHtml(row.aggregate_treatment)}</code></dd><dt>Dependency group</dt><dd><code>${escapeHtml(row.dependency_group)}</code></dd></dl></details></div>
    </details>`;
  }).join("");
  document.getElementById("monitor-inventory").innerHTML = `<article class="monitor-dependency-root reader-dependency"><p class="section-kicker">Avoiding double-counting</p><h3>Several bound-facing results share one parent assumption</h3><p>They remain separate display items so readers can inspect them, but they count as one related structural family—not several independent confirmations. The dependent mass–radius comparison belongs to that same family.</p><details class="technical-details"><summary>Technical dependency hierarchy</summary><p><code>${escapeHtml(root.dependency_group)}</code></p><p>${escapeHtml(root.role)} ${escapeHtml(root.removal_rule)}</p><p><strong>Subgroups:</strong> ${root.subgroups.map((item) => `<code>${escapeHtml(item)}</code>`).join(" · ")}</p></details></article><p class="monitor-inventory-key"><strong>${escapeHtml(data.summary.full_inventory_rows)} candidates reviewed.</strong> Included, excluded, and pending items stay visible; exclusion from the directional assessment is not deletion.</p><div class="monitor-record-list">${rows}</div>`;
}

function renderCompatibilityChecks(data) {
  const names = ["Can the zero-spin model supply the required pair of genuinely different interiors with identical retained data?", "Can the Kerr thermal-horizon argument be rederived from start to finish for Schwarzschild?", "Can the same thermal-horizon argument be placed in a clearly defined Infinite host without confusing a local black-hole horizon with the universe’s boundary?"];
  document.getElementById("monitor-compatibility-checks").innerHTML = data.compatibility_checks.map((row, index) => `<article class="monitor-record reader-record compatibility-debt-card"><div class="reader-result-heading"><p class="reader-question">${escapeHtml(names[index] || "Can this result be carried into the named model?")}</p><h3>Not yet resolved</h3></div><p><strong>What the completed check found:</strong> ${escapeHtml(row.result)}</p><p><strong>Smallest next step:</strong> ${escapeHtml(row.resolution_route)}</p><details class="technical-details"><summary>Technical proof obligation and source record</summary><p><strong>Cell:</strong> <code>${escapeHtml(row.cell_id)}</code></p><p><strong>Exact outcome:</strong> <code>${escapeHtml(row.outcome)}</code></p><p><strong>Proof obligation:</strong> ${escapeHtml(row.proof_obligation)}</p><p><strong>Source record:</strong> <code>${escapeHtml(row.source_record.artifact_id)}</code></p><p><strong>Source SHA256:</strong> <code>${escapeHtml(row.source_record.precheck_sha256)}</code></p></details></article>`).join("");
}

function renderSummary(data) {
  document.getElementById("monitor-summary").innerHTML = `<article class="monitor-summary-card"><span>Current compatibility results</span><strong>${data.summary.current_consumer_facing_records}</strong></article><article class="monitor-summary-card"><span>Evidence candidates reviewed</span><strong>${data.summary.full_inventory_rows}</strong></article><article class="monitor-summary-card"><span>Open compatibility questions</span><strong>${data.summary.compatibility_debt_cells}</strong></article><article class="monitor-summary-card"><span>Universe selector</span><strong>None</strong></article>`;
  document.getElementById("monitor-overall").innerHTML = `<span class="monitor-overall-label">Current answer</span><strong>No clear decision</strong><span>Mixed empirical evidence, with a fragile, very slight unbound-facing tilt. Separate bound-facing structural simplicity is not observational evidence.</span>`;
  const timestamps = data.authority_timestamps;
  const projection = data.projection_basis;
  const missing = timestamps.records_without_declared_updated_utc_ids.map((id) => `<li><code>${escapeHtml(id)}</code></li>`).join("");
  const authorities = Object.entries(data.authorities).map(([name, authority]) => `<li><strong>${escapeHtml(name.replaceAll("_", " "))}</strong>: <code>${escapeHtml(authority.record_id)}</code><br/><span>SHA256 ${escapeHtml(authority.sha256)}</span></li>`).join("");
  document.getElementById("monitor-authorities").innerHTML = `<p><strong>Projection schema:</strong> <code>${escapeHtml(data.schema_version)}</code></p><p><strong>Membership basis:</strong> <code>${escapeHtml(projection.membership_source)}</code> using <code>${escapeHtml(projection.membership_predicate)}</code>. ${escapeHtml(projection.coverage_semantics)}</p><p><strong>Program registry update:</strong> ${escapeHtml(timestamps.program_registry_updated_at || "not declared")} (${escapeHtml(timestamps.program_registry_updated_at_scope)})</p><p><strong>Latest declared per-record update:</strong> ${escapeHtml(timestamps.latest_declared_per_record_updated_utc || "none declared")} among ${escapeHtml(timestamps.records_with_declared_updated_utc)} of ${escapeHtml(data.summary.current_consumer_facing_records)} current records. Missing dates are left blank rather than invented.</p><details><summary>Current records without a declared update time (${escapeHtml(timestamps.records_without_declared_updated_utc)})</summary><ul>${missing}</ul></details><ul>${authorities}</ul><p><a class="section-link" href="data/evidence-monitor.json">Open the complete public JSON →</a></p>`;
}

async function initializeMonitor() {
  try {
    const response = await fetch("data/evidence-monitor.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    monitorState.records = data.records;
    renderSummary(data); renderAssessment(data); renderInventory(data); renderCompatibilityChecks(data); renderRecords();
  } catch (error) {
    document.getElementById("monitor-overall").innerHTML = `<span class="monitor-overall-label">Current answer</span><strong>Unavailable</strong><span>The public projection could not be loaded. No conclusion is inferred.</span>`;
    document.getElementById("monitor-records").innerHTML = `<div class="empty-state">Evidence Monitor unavailable: ${escapeHtml(error.message)}.</div>`;
  }
}

document.getElementById("monitor-search")?.addEventListener("input", (event) => { monitorState.search = event.target.value.trim().toLowerCase(); renderRecords(); });
document.getElementById("monitor-direction")?.addEventListener("change", (event) => { monitorState.direction = event.target.value; renderRecords(); });
initializeMonitor();

const bundlePath = "data/aio_calculator_bundle.json";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInline(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function formatNumber(value, digits = 6) {
  const fixed = Number(value).toFixed(digits);
  return fixed.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

function statusClass(status) {
  const lower = String(status).toLowerCase();
  if (lower.includes("conditional premise")) return "is-premise";
  if (lower.includes("derived / scoped")) return "is-derived";
  if (lower.includes("verified") && lower.includes("derived")) return "is-mixed";
  if (lower.includes("verified")) return "is-verified";
  if (lower.includes("theorem")) return "is-derived";
  if (lower.includes("conditional")) return "is-conditional";
  if (lower.includes("scaffold")) return "is-neutral";
  return "is-derived";
}

function compactStatus(status) {
  const lower = String(status).toLowerCase();
  if (lower.includes("conditional premise")) return "premise";
  if (lower.includes("derived / scoped")) return "derived / scoped";
  if (lower.includes("verified / scoped")) return "verified / scoped";
  if (lower.includes("conditional")) return "conditional";
  if (lower.includes("scaffold")) return "scaffold";
  return status;
}

function statusBadge(status, extraClass = "") {
  return `<span class="calc-badge ${statusClass(status)} ${extraClass}">${escapeHtml(compactStatus(status))}</span>`;
}

function neutralBadge(label) {
  return `<span class="calc-badge is-neutral">${escapeHtml(label)}</span>`;
}

function metricRow(label, value) {
  return `
    <div class="calc-row">
      <span class="calc-row-label">${escapeHtml(label)}</span>
      <span class="calc-row-value">${value}</span>
    </div>
  `;
}

function listMarkup(items) {
  if (!items || !items.length) return "";
  return `<ul class="calc-list">${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`;
}

function authorityChips(authorityPaths) {
  if (!authorityPaths || !authorityPaths.length) return "";
  const chips = authorityPaths
    .map((path) => path.split("/").filter(Boolean).pop())
    .map((label) => `<span class="calc-chip">${escapeHtml(label)}</span>`)
    .join("");
  return `<div class="calc-chip-row">${chips}</div>`;
}

function sectionList(label, items) {
  if (!items || !items.length) return "";
  return `
    <div class="calc-subsection">
      <p class="calc-section-label">${escapeHtml(label)}</p>
      ${listMarkup(items)}
    </div>
  `;
}

function theoremNodeDetail(node, options = {}) {
  const index = options.index;
  const showIndex = Number.isInteger(index);
  const kind = escapeHtml(node.kind || "theorem");
  const dependsOn = node.depends_on && node.depends_on.length
    ? `<p><strong>Depends on.</strong> ${node.depends_on.map((item) => `<code>${escapeHtml(item)}</code>`).join(", ")}</p>`
    : "";
  const notes = node.notes && node.notes.length
    ? node.notes.map((note) => `<p>${renderInline(note)}</p>`).join("")
    : "";
  const premises = sectionList("Premises", node.premises || []);
  const proofOutline = sectionList("Proof outline", node.proof_outline || []);
  const scopeBoundary = sectionList("Scope boundary", node.scope_boundary || []);
  const references = node.authority_paths && node.authority_paths.length
    ? `
      <div class="calc-subsection">
        <p class="calc-section-label">Supporting references</p>
        <p class="calc-node-caption">${renderInline(node.reference_note || "")}</p>
        ${authorityChips(node.authority_paths || [])}
      </div>
    `
    : "";
  return `
    <details class="calc-node"${options.open ? " open" : ""}>
      <summary class="calc-node-summary">
        <div class="calc-node-main">
          ${showIndex ? `<span class="calc-step">${index}.</span>` : `<span class="calc-kind">${kind}</span>`}
          <span>${escapeHtml(node.label)}</span>
        </div>
        <div class="calc-badge-row">
          ${statusBadge(node.claim_status)}
          <span class="calc-chevron" aria-hidden="true">›</span>
        </div>
      </summary>
      <div class="calc-node-body">
        <p class="calc-section-label">Statement</p>
        <p>${renderInline(node.statement)}</p>
        <p><strong>Node id.</strong> <code>${escapeHtml(node.node_id)}</code></p>
        <p><strong>Scope summary.</strong> ${renderInline(node.scope)}</p>
        ${dependsOn}
        ${premises}
        ${proofOutline}
        ${scopeBoundary}
        ${notes}
        ${references}
      </div>
    </details>
  `;
}

function resolveSpecOutputs(bundle, specId) {
  return Object.values(bundle.explained_outputs).filter((output) => (
    output.output_id === specId || output.output_id.startsWith(`${specId}_`)
  ));
}

function explainedOutputDetail(specId, spec, bundle) {
  const matchingOutputs = resolveSpecOutputs(bundle, specId);
  const liveRows = matchingOutputs.length
    ? `
      <div class="calc-subsection">
        <p class="calc-section-label">Live surface</p>
        <div class="calc-metrics">
          ${matchingOutputs.map((output) => metricRow(
            output.label,
            `<span>${formatNumber(output.primary_value, 12)} <span class="calc-inline-unit">${escapeHtml(output.units || "")}</span></span>`,
          )).join("")}
        </div>
      </div>
    `
    : "";
  const parameters = spec.parameters && Object.keys(spec.parameters).length
    ? `
      <div class="calc-subsection">
        <p class="calc-section-label">Parameters</p>
        <ul class="calc-list">
          ${Object.entries(spec.parameters).map(
            ([name, descriptor]) => `<li><code>${escapeHtml(name)}</code>: ${renderInline(descriptor.meaning)}</li>`,
          ).join("")}
        </ul>
      </div>
    `
    : "";
  return `
    <details class="calc-node">
      <summary class="calc-node-summary">
        <div class="calc-node-main">
          <span class="calc-kind">output</span>
          <span>${escapeHtml(spec.label)}</span>
        </div>
        <div class="calc-badge-row">
          ${statusBadge(spec.claim_status)}
          ${neutralBadge(spec.provenance_status)}
          <span class="calc-chevron" aria-hidden="true">›</span>
        </div>
      </summary>
      <div class="calc-node-body">
        <p><strong>Output id.</strong> <code>${escapeHtml(specId)}</code></p>
        <p>${renderInline(spec.note)}</p>
        <p><strong>Conditional on.</strong> ${spec.conditional_on_premises.map((item) => `<code>${escapeHtml(item)}</code>`).join(", ")}</p>
        ${liveRows}
        ${parameters}
      </div>
    </details>
  `;
}

function thetaCard(theta, graph) {
  const comparison = theta.direct_observable_comparison;
  const supportingNodes = theta.provenance.supporting_node_ids || [];
  const chainMarkup = theta.provenance.chain_ids
    .map((nodeId, index) => theoremNodeDetail(graph[nodeId], { index: index + 1 }))
    .join("");
  const supportingMarkup = supportingNodes.length
    ? `
      <section class="calc-section">
        <p class="calc-section-label">Supporting node</p>
        <div class="calc-nested-stack">
          ${supportingNodes.map((nodeId) => theoremNodeDetail(graph[nodeId])).join("")}
        </div>
      </section>
    `
    : "";
  return `
    <details class="calc-card" id="theta-output-card">
      <summary class="calc-card-summary">
        <div class="calc-card-heading">
          <div class="calc-card-title-row">
            <span class="calc-card-name">100theta_*</span>
            ${statusBadge(theta.claim_status)}
          </div>
          <p class="calc-card-subtitle">${escapeHtml(theta.label)}</p>
        </div>
        <div class="calc-card-value-block">
          <div class="calc-card-value">${formatNumber(theta.theta_star_100, 12)}</div>
          <div class="calc-card-unit">${escapeHtml(theta.units)}</div>
          <span class="calc-chevron" aria-hidden="true">›</span>
        </div>
      </summary>
      <div class="calc-card-body">
        <section class="calc-section">
          <p class="calc-section-label">Published result</p>
          <div class="calc-metrics">
            ${metricRow("Claim status", renderInline(theta.claim_status))}
            ${metricRow("Provenance status", neutralBadge(theta.provenance_status))}
            ${metricRow("Zero fitted parameters", theta.zero_fitted_parameters ? "yes" : "no")}
            ${metricRow("Conditional on", theta.conditional_on_premises.map((item) => `<code>${escapeHtml(item)}</code>`).join(", "))}
            ${metricRow("Selector leaf", `<span>${formatNumber(theta.selector_leaf_z, 12)} <span class="calc-inline-unit">z</span></span>`)}
            ${metricRow("Observer-side angle", `<span>${formatNumber(theta.theta_obs_deg, 12)} <span class="calc-inline-unit">deg</span></span>`)}
          </div>
          ${listMarkup(theta.notes)}
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Why this differs from Planck</p>
          <div class="calc-note">
            <p><strong>Calculator statement.</strong> This number differs from Planck's reported value because Planck assumes flat space. The IO framework derives closed space. The direct observable — the first peak position — agrees.</p>
            <p>${renderInline(theta.geometry_explanation)}</p>
            <p>${renderInline(theta.comparison_context.statement)}</p>
          </div>
          <div class="calc-metrics">
            ${metricRow("Planck flat reference", formatNumber(theta.comparison_context.planck_flat_reference_theta_mc_100, 5))}
            ${metricRow("Planck closed refit", formatNumber(theta.comparison_context.planck_closed_reference_theta_mc_100, 5))}
            ${metricRow("Closed refit Omega_k", formatNumber(theta.comparison_context.planck_closed_reference_omegak, 3))}
          </div>
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Direct observable</p>
          <div class="calc-metrics">
            ${metricRow("Predicted first peak", `<span>${formatNumber(comparison.predicted_value, 6)} <span class="calc-inline-unit">${escapeHtml(comparison.units)}</span></span>`)}
            ${metricRow("Observed first peak", `<span>${formatNumber(comparison.observed_reference, 3)} <span class="calc-inline-unit">${escapeHtml(comparison.units)}</span></span>`)}
            ${metricRow("Delta", `<span>${formatNumber(comparison.delta, 6)} <span class="calc-inline-unit">${escapeHtml(comparison.units)}</span></span>`)}
          </div>
          <div class="calc-note">
            <p>${renderInline(comparison.note)}</p>
          </div>
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Derivation chain</p>
          <div class="calc-nested-stack">
            ${chainMarkup}
          </div>
        </section>

        ${supportingMarkup}

        <section class="calc-section">
          <p class="calc-section-label">Scope boundary</p>
          ${listMarkup(theta.scope_boundary)}
          <p class="calc-section-label calc-section-label-secondary">Non-claims</p>
          ${listMarkup(theta.non_claims)}
        </section>
      </div>
    </details>
  `;
}

function provenanceCard(bundle) {
  const specMarkup = Object.entries(bundle.explained_output_specs)
    .map(([specId, spec]) => explainedOutputDetail(specId, spec, bundle))
    .join("");
  const dictionaryMarkup = Object.values(bundle.provenance_graph)
    .map((node) => theoremNodeDetail(node))
    .join("");
  return `
    <details class="calc-card" id="provenance-catalog-card">
      <summary class="calc-card-summary">
        <div class="calc-card-heading">
          <div class="calc-card-title-row">
            <span class="calc-card-name">Provenance catalog</span>
            ${neutralBadge("bundle-driven")}
          </div>
          <p class="calc-card-subtitle">Explained outputs and the live theorem dictionary</p>
        </div>
        <div class="calc-card-value-block is-meta">
          <div class="calc-card-meta">${Object.keys(bundle.explained_output_specs).length} outputs</div>
          <div class="calc-card-meta">${Object.keys(bundle.provenance_graph).length} nodes</div>
          <span class="calc-chevron" aria-hidden="true">›</span>
        </div>
      </summary>
      <div class="calc-card-body">
        <section class="calc-section">
          <p class="calc-section-label">Explained outputs</p>
          <div class="calc-nested-stack">
            ${specMarkup}
          </div>
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Theorem dictionary</p>
          <div class="calc-note">
            <p>Every node below is the live public theorem graph the calculator can cite directly.</p>
          </div>
          <div class="calc-nested-stack">
            ${dictionaryMarkup}
          </div>
        </section>
      </div>
    </details>
  `;
}

async function main() {
  const response = await fetch(bundlePath);
  if (!response.ok) {
    throw new Error(`bundle request failed with status ${response.status}`);
  }
  const bundle = await response.json();
  const theta = bundle.explained_outputs.theta_star_theorem;
  if (!theta) {
    throw new Error("missing theta_star_theorem explained output");
  }
  const graph = theta.provenance && theta.provenance.nodes
    ? theta.provenance.nodes
    : bundle.provenance_graph;

  document.getElementById("calculator-card-stack").innerHTML = [
    thetaCard(theta, graph),
    provenanceCard(bundle),
  ].join("");
}

main().catch((error) => {
  console.error(error);
  document.getElementById("calculator-card-stack").innerHTML = `
    <div class="calc-error">Failed to load calculator bundle: ${escapeHtml(String(error))}</div>
  `;
});

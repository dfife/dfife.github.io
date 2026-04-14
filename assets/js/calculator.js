const bundlePath = "data/aio_calculator_bundle.json";

function formatFixed(value, digits = 6) {
  return Number(value).toFixed(digits);
}

function statusClass(status) {
  const lower = String(status).toLowerCase();
  if (lower.includes("conditional")) return "status-conditional";
  if (lower.includes("no-go")) return "status-no-go";
  if (lower.includes("derived / scoped") || lower.includes("verified")) return "status-derived-scoped";
  if (lower.includes("theorem")) return "status-theorem";
  return "status-derived";
}

function chip(label, value) {
  return `
    <div class="calculator-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function codeList(items) {
  if (!items || !items.length) return "";
  return `
    <div class="calculator-chip-row">
      ${items.map((item) => `<span class="calculator-chip">${item}</span>`).join("")}
    </div>
  `;
}

function theoremNodeDetails(node, index, open = false) {
  const authorityLabels = (node.authority_paths || []).map((path) => path.split("/").filter(Boolean).pop());
  return `
    <details class="calculator-detail" ${open ? "open" : ""}>
      <summary class="calculator-summary">
        <div class="calculator-summary-main">
          <span class="calculator-step">${index}.</span>
          <span>${node.label}</span>
        </div>
        <span class="badge status-badge ${statusClass(node.claim_status)}">${node.claim_status}</span>
      </summary>
      <div class="calculator-detail-body">
        <p>${node.statement}</p>
        <p><strong>Scope.</strong> ${node.scope}</p>
        ${node.depends_on && node.depends_on.length ? `<p><strong>Depends on.</strong> ${node.depends_on.join(", ")}</p>` : ""}
        ${node.notes && node.notes.length ? node.notes.map((note) => `<p>${note}</p>`).join("") : ""}
        ${codeList(authorityLabels)}
      </div>
    </details>
  `;
}

function explainedSpecCard([outputId, spec]) {
  const parameters = spec.parameters && Object.keys(spec.parameters).length
    ? Object.entries(spec.parameters).map(([name, descriptor]) => `<li><code>${name}</code>: ${descriptor.meaning}</li>`).join("")
    : "";
  return `
    <article class="calculator-card calculator-catalog-card">
      <div class="calculator-card-topline">
        <p class="calculator-kicker">${outputId}</p>
        <div class="calculator-badge-row">
          <span class="badge status-badge ${statusClass(spec.claim_status)}">${spec.claim_status}</span>
          <span class="badge calculator-neutral-badge">${spec.provenance_status}</span>
        </div>
      </div>
      <h3 class="calculator-card-title">${spec.label}</h3>
      <p>${spec.note}</p>
      ${parameters ? `<ul class="calculator-list">${parameters}</ul>` : ""}
    </article>
  `;
}

async function main() {
  const response = await fetch(bundlePath);
  const bundle = await response.json();

  const theta = bundle.explained_outputs.theta_star_theorem;
  const comparison = theta.direct_observable_comparison;
  const nodes = theta.provenance.nodes;

  document.getElementById("theta-primary-value").textContent = formatFixed(theta.theta_star_100, 12);
  document.getElementById("theta-primary-rows").innerHTML = [
    chip("Claim status", `<span class="badge status-badge ${statusClass(theta.claim_status)}">${theta.claim_status}</span>`),
    chip("Zero fitted parameters", theta.zero_fitted_parameters ? "yes" : "no"),
    chip("Conditional on", theta.conditional_on_premises.join(", ")),
    chip("Selector leaf", formatFixed(theta.selector_leaf_z, 12)),
    chip("Observer-side angle", `${formatFixed(theta.theta_obs_deg, 12)} deg`),
    chip("Peak position", formatFixed(theta.ell_peak, 6)),
  ].join("");

  document.getElementById("theta-explanation-copy").innerHTML = `
    <p><strong>Calculator statement.</strong> This number differs from Planck's reported value because Planck assumes flat space. The IO framework derives closed space. The direct observable — the first peak position — agrees.</p>
    <p>${theta.geometry_explanation}</p>
    <p>${theta.comparison_context.statement}</p>
    <div class="calculator-row-list calculator-row-list-tight">
      ${chip("Planck flat reference", formatFixed(theta.comparison_context.planck_flat_reference_theta_mc_100, 5))}
      ${chip("Planck closed refit", formatFixed(theta.comparison_context.planck_closed_reference_theta_mc_100, 5))}
      ${chip("Closed refit Omega_k", formatFixed(theta.comparison_context.planck_closed_reference_omegak, 3))}
    </div>
  `;

  document.getElementById("theta-comparison-rows").innerHTML = [
    chip("Predicted first peak", formatFixed(comparison.predicted_value, 6)),
    chip("Observed first peak", formatFixed(comparison.observed_reference, 3)),
    chip("Delta", formatFixed(comparison.delta, 6)),
  ].join("");
  document.getElementById("theta-comparison-copy").innerHTML = `
    <p>${comparison.note}</p>
    <p><strong>Scope boundary.</strong></p>
    ${theta.scope_boundary.map((item) => `<p>${item}</p>`).join("")}
    <p><strong>Non-claims.</strong></p>
    ${theta.non_claims.map((item) => `<p>${item}</p>`).join("")}
  `;

  document.getElementById("theta-chain").innerHTML = theta.provenance.chain_ids
    .map((nodeId, index) => theoremNodeDetails(nodes[nodeId], index + 1, index === 0))
    .join("");

  document.getElementById("explained-output-catalog").innerHTML = Object.entries(bundle.explained_output_specs)
    .map((entry) => explainedSpecCard(entry))
    .join("");

  document.getElementById("theorem-dictionary").innerHTML = Object.values(bundle.provenance_graph)
    .map((node, index) => theoremNodeDetails(node, index + 1, false))
    .join("");
}

main().catch((error) => {
  console.error(error);
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="calculator-error">Failed to load calculator bundle: ${String(error)}</div>`,
  );
});

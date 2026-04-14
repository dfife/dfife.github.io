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

function formatScalar(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return renderInline(value);
  }
  const abs = Math.abs(value);
  if ((abs !== 0 && abs < 1.0e-4) || abs >= 1.0e5) {
    return escapeHtml(value.toExponential(6));
  }
  if (abs >= 1000) return escapeHtml(formatNumber(value, 6));
  return escapeHtml(formatNumber(value, 12));
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

function outputCardName(output) {
  if (output.output_id === "theta_star_theorem") return "100theta_*";
  if (output.output_id === "branch_rd_mpc") return "r_d";
  if (output.output_id === "eta_io_late") return "eta_IO";
  if (output.output_id === "background_snapshot") return `D_M(z = ${formatNumber(output.z, 2)})`;
  if (output.output_id === "recombination_point") return `kappa'_loc(z = ${formatNumber(output.z, 0)})`;
  return output.primary_key;
}

function outputCardValue(output) {
  return formatScalar(output.primary_value);
}

function payloadKeyLabel(key) {
  const labels = {
    branch_label: "Branch",
    r_d_mpc: "r_d",
    eta_IO_late: "eta_IO,late",
    z: "z",
    H_km_s_mpc: "H(z)",
    DM_mpc: "D_M",
    DA_mpc: "D_A",
    DL_mpc: "D_L",
    DH_mpc: "D_H",
    DV_mpc: "D_V",
    lookback_gyr: "Lookback",
    age_gyr: "Age",
    DM_over_rd: "D_M / r_d",
    DH_over_rd: "D_H / r_d",
    DV_over_rd: "D_V / r_d",
    x_e: "x_e",
    u: "u",
    a_loc_m: "a_loc",
    H_loc_s_inv: "H_loc",
    T_r_loc_K: "T_R,loc",
    n_H_geom_m3: "n_H,geom",
    n_e_m3: "n_e",
    kappa_prime_loc: "kappa'_loc",
    d_tau_obs_dz: "d tau_obs / dz",
    Gamma_T_over_H_loc: "Gamma_T / H_loc",
    R_local_geom: "R_local,geom",
    c_s_local_m_s: "c_s,local",
    selector_leaf_z: "Selector leaf",
    theta_bare_deg: "theta_bare",
    theta_obs_deg: "theta_obs",
    theta_star_100: "100theta_*",
    selector_roundtrip_error: "Selector roundtrip",
    ell_peak: "ell_peak",
    observed_first_peak_ell_reference: "Observed peak",
    first_peak_delta: "Peak delta",
  };
  return labels[key] || key;
}

function payloadKeyUnit(key, outputUnits) {
  const units = {
    r_d_mpc: "Mpc",
    H_km_s_mpc: "km/s/Mpc",
    DM_mpc: "Mpc",
    DA_mpc: "Mpc",
    DL_mpc: "Mpc",
    DH_mpc: "Mpc",
    DV_mpc: "Mpc",
    lookback_gyr: "Gyr",
    age_gyr: "Gyr",
    a_loc_m: "m",
    H_loc_s_inv: "s^-1",
    T_r_loc_K: "K",
    n_H_geom_m3: "m^-3",
    n_e_m3: "m^-3",
    c_s_local_m_s: "m/s",
    theta_bare_deg: "deg",
    theta_obs_deg: "deg",
    theta_star_100: "100theta_*",
    ell_peak: "ell",
    observed_first_peak_ell_reference: "ell",
    first_peak_delta: "ell",
  };
  return units[key] || outputUnits || "";
}

function payloadRowKeys(output) {
  const preferred = {
    branch_rd_mpc: ["branch_label", "r_d_mpc"],
    eta_io_late: ["branch_label", "eta_IO_late"],
    background_snapshot: [
      "z",
      "H_km_s_mpc",
      "DM_mpc",
      "DH_mpc",
      "DV_mpc",
      "DM_over_rd",
      "DH_over_rd",
      "DV_over_rd",
      "lookback_gyr",
      "age_gyr",
      "eta_IO_late",
    ],
    recombination_point: [
      "z",
      "x_e",
      "H_loc_s_inv",
      "T_r_loc_K",
      "n_H_geom_m3",
      "n_e_m3",
      "kappa_prime_loc",
      "d_tau_obs_dz",
      "Gamma_T_over_H_loc",
      "R_local_geom",
      "c_s_local_m_s",
    ],
  };
  const keys = preferred[output.output_id];
  if (keys) return keys.filter((key) => key in output);
  return Object.keys(output);
}

function outputMetricRows(output) {
  const skip = new Set([
    "output_id",
    "label",
    "primary_key",
    "primary_value",
    "units",
    "claim_status",
    "provenance_status",
    "zero_fitted_parameters",
    "conditional_on_premises",
    "scope_boundary",
    "non_claims",
    "notes",
    "geometry_explanation",
    "comparison_context",
    "direct_observable_comparisons",
    "direct_observable_comparison",
    "provenance",
  ]);
  return payloadRowKeys(output)
    .filter((key) => !skip.has(key))
    .map((key) => {
      const unit = payloadKeyUnit(key, output.units);
      const value = `${formatScalar(output[key])}${unit ? ` <span class="calc-inline-unit">${escapeHtml(unit)}</span>` : ""}`;
      return metricRow(payloadKeyLabel(key), value);
    })
    .join("");
}

function theoremChainSection(output, graph) {
  const supportingNodes = output.provenance.supporting_node_ids || [];
  const chainMarkup = output.provenance.chain_ids
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
    <section class="calc-section">
      <p class="calc-section-label">Derivation chain</p>
      <div class="calc-nested-stack">
        ${chainMarkup}
      </div>
    </section>
    ${supportingMarkup}
  `;
}

function thetaCard(output, graph) {
  const comparison = output.direct_observable_comparison;
  return `
    <details class="calc-card" id="theta-output-card">
      <summary class="calc-card-summary">
        <div class="calc-card-heading">
          <div class="calc-card-title-row">
            <span class="calc-card-name">${escapeHtml(outputCardName(output))}</span>
            ${statusBadge(output.claim_status)}
          </div>
          <p class="calc-card-subtitle">${escapeHtml(output.label)}</p>
        </div>
        <div class="calc-card-value-block">
          <div class="calc-card-value">${outputCardValue(output)}</div>
          <div class="calc-card-unit">${escapeHtml(output.units)}</div>
          <span class="calc-chevron" aria-hidden="true">›</span>
        </div>
      </summary>
      <div class="calc-card-body">
        <section class="calc-section">
          <p class="calc-section-label">Published result</p>
          <div class="calc-metrics">
            ${metricRow("Claim status", renderInline(output.claim_status))}
            ${metricRow("Provenance status", neutralBadge(output.provenance_status))}
            ${metricRow("Zero fitted parameters", output.zero_fitted_parameters ? "yes" : "no")}
            ${metricRow("Conditional on", output.conditional_on_premises.map((item) => `<code>${escapeHtml(item)}</code>`).join(", "))}
            ${metricRow("Selector leaf", `${formatScalar(output.selector_leaf_z)} <span class="calc-inline-unit">z</span>`)}
            ${metricRow("Observer-side angle", `${formatScalar(output.theta_obs_deg)} <span class="calc-inline-unit">deg</span>`)}
          </div>
          ${listMarkup(output.notes)}
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Why this differs from Planck</p>
          <div class="calc-note">
            <p><strong>Calculator statement.</strong> This number differs from Planck's reported value because Planck assumes flat space. The IO framework derives closed space. The direct observable — the first peak position — agrees.</p>
            <p>${renderInline(output.geometry_explanation)}</p>
            <p>${renderInline(output.comparison_context.statement)}</p>
          </div>
          <div class="calc-metrics">
            ${metricRow("Planck flat reference", formatScalar(output.comparison_context.planck_flat_reference_theta_mc_100))}
            ${metricRow("Planck closed refit", formatScalar(output.comparison_context.planck_closed_reference_theta_mc_100))}
            ${metricRow("Closed refit Omega_k", formatScalar(output.comparison_context.planck_closed_reference_omegak))}
          </div>
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Direct observable</p>
          <div class="calc-metrics">
            ${metricRow("Predicted first peak", `${formatScalar(comparison.predicted_value)} <span class="calc-inline-unit">${escapeHtml(comparison.units)}</span>`)}
            ${metricRow("Observed first peak", `${formatScalar(comparison.observed_reference)} <span class="calc-inline-unit">${escapeHtml(comparison.units)}</span>`)}
            ${metricRow("Delta", `${formatScalar(comparison.delta)} <span class="calc-inline-unit">${escapeHtml(comparison.units)}</span>`)}
          </div>
          <div class="calc-note">
            <p>${renderInline(comparison.note)}</p>
          </div>
        </section>

        ${theoremChainSection(output, graph)}

        <section class="calc-section">
          <p class="calc-section-label">Scope boundary</p>
          ${listMarkup(output.scope_boundary)}
          <p class="calc-section-label calc-section-label-secondary">Non-claims</p>
          ${listMarkup(output.non_claims)}
        </section>
      </div>
    </details>
  `;
}

function genericOutputCard(output, graph) {
  return `
    <details class="calc-card" id="output-${escapeHtml(output.output_id)}">
      <summary class="calc-card-summary">
        <div class="calc-card-heading">
          <div class="calc-card-title-row">
            <span class="calc-card-name">${escapeHtml(outputCardName(output))}</span>
            ${statusBadge(output.claim_status)}
          </div>
          <p class="calc-card-subtitle">${escapeHtml(output.label)}</p>
        </div>
        <div class="calc-card-value-block">
          <div class="calc-card-value">${outputCardValue(output)}</div>
          <div class="calc-card-unit">${escapeHtml(output.units || output.primary_key)}</div>
          <span class="calc-chevron" aria-hidden="true">›</span>
        </div>
      </summary>
      <div class="calc-card-body">
        <section class="calc-section">
          <p class="calc-section-label">Published result</p>
          <div class="calc-metrics">
            ${metricRow("Claim status", renderInline(output.claim_status))}
            ${metricRow("Provenance status", neutralBadge(output.provenance_status))}
            ${metricRow("Zero fitted parameters", output.zero_fitted_parameters ? "yes" : "no")}
            ${metricRow("Conditional on", output.conditional_on_premises.map((item) => `<code>${escapeHtml(item)}</code>`).join(", "))}
          </div>
        </section>

        <section class="calc-section">
          <p class="calc-section-label">Computed values</p>
          <div class="calc-metrics">
            ${outputMetricRows(output)}
          </div>
          ${listMarkup(output.notes || [])}
        </section>

        ${theoremChainSection(output, graph)}

        <section class="calc-section">
          <p class="calc-section-label">Scope boundary</p>
          ${listMarkup(output.scope_boundary || [])}
          ${output.non_claims && output.non_claims.length ? `<p class="calc-section-label calc-section-label-secondary">Non-claims</p>${listMarkup(output.non_claims)}` : ""}
        </section>
      </div>
    </details>
  `;
}

function theoremDictionaryPage(bundle) {
  const dictionaryMarkup = Object.values(bundle.provenance_graph)
    .map((node) => theoremNodeDetail(node))
    .join("");
  return `
    <div class="calc-note">
      <p>The calculator page carries derivation chains inside each output card. This reference page is the standalone theorem dictionary for the live bundle.</p>
    </div>
    <div class="calc-card-stack">
      ${dictionaryMarkup}
    </div>
  `;
}

function renderCalculatorPage(bundle) {
  const mount = document.getElementById("calculator-card-stack");
  if (!mount) return;
  const graph = bundle.provenance_graph;
  const outputs = Object.values(bundle.explained_outputs);
  mount.innerHTML = outputs
    .map((output) => (output.output_id === "theta_star_theorem" ? thetaCard(output, graph) : genericOutputCard(output, graph)))
    .join("");
}

function renderTheoremDictionaryPage(bundle) {
  const mount = document.getElementById("theorem-dictionary-stack");
  if (!mount) return;
  mount.innerHTML = theoremDictionaryPage(bundle);
}

async function main() {
  const response = await fetch(bundlePath);
  if (!response.ok) {
    throw new Error(`bundle request failed with status ${response.status}`);
  }
  const bundle = await response.json();
  renderCalculatorPage(bundle);
  renderTheoremDictionaryPage(bundle);
}

main().catch((error) => {
  console.error(error);
  const mounts = [
    document.getElementById("calculator-card-stack"),
    document.getElementById("theorem-dictionary-stack"),
  ].filter(Boolean);
  mounts.forEach((mount) => {
    mount.innerHTML = `<div class="calc-error">Failed to load calculator bundle: ${escapeHtml(String(error))}</div>`;
  });
});

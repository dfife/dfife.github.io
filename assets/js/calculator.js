/*
 * Progressive enhancement for the public theorem surface.
 *
 * Two jobs live here:
 * 1. open hash-targeted <details> nodes on the prerendered calculator pages
 * 2. mirror the late-time background engine from `aio_calculator/model.py`
 *    so the redshift widget can compute H(z), D_M(z), D_A(z), D_L(z), and
 *    age(z) client-side without a server round-trip
 *
 * The widget deliberately mirrors the Python conventions:
 * - Simpson integration
 * - u = ln(1+z) line-of-sight integral
 * - closed-FRW S_k(chi)
 * - age integral starting from a_min = 1e-10
 */

const SPEED_OF_LIGHT_KM_S = 299792.458;
const MPC_IN_METERS = 3.0856775814913673e22;
const GYR_IN_SECONDS = 365.25 * 24 * 3600 * 1e9;
const INTEGRATION_STEPS = 4096;

function openAncestorDetails(node) {
  let current = node;
  while (current) {
    if (current.tagName === "DETAILS") {
      current.open = true;
    }
    current = current.parentElement;
  }
}

function revealHashTarget() {
  if (!window.location.hash) return;
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;
  openAncestorDetails(target);
  target.scrollIntoView({ block: "nearest" });
}

function markPrerenderedSurfaces() {
  document.documentElement.classList.add("calc-enhanced");
  document
    .querySelectorAll("[data-prerendered='true']")
    .forEach((node) => node.setAttribute("data-enhanced", "true"));
}

function simpson(fn, a, b, n) {
  let steps = n;
  if (steps <= 0) {
    throw new Error("Simpson integration requires a positive number of steps.");
  }
  if (a === b) return 0;
  if (steps % 2 === 1) steps += 1;
  const h = (b - a) / steps;
  let total = fn(a) + fn(b);
  for (let i = 1; i < steps; i += 1) {
    total += (i % 2 === 1 ? 4 : 2) * fn(a + i * h);
  }
  return total * h / 3;
}

function formatNumber(value, digits = 6) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  const absolute = Math.abs(numeric);
  if ((absolute !== 0 && absolute < 1e-4) || absolute >= 1e5) {
    return numeric.toExponential(6);
  }
  const fixed = numeric.toFixed(digits);
  return fixed.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

function computeBackgroundSnapshot(config, z) {
  const e = (redshift) => {
    const zp1 = 1 + redshift;
    return Math.sqrt(
      config.omegaR * zp1 ** 4 +
      config.omegaM * zp1 ** 3 +
      config.omegaK * zp1 ** 2 +
      config.omegaLambda
    );
  };

  const chi = simpson((u) => {
    const redshift = Math.exp(u) - 1;
    return Math.exp(u) / e(redshift);
  }, 0, Math.log1p(z), INTEGRATION_STEPS);

  const sK = (chiValue) => {
    if (Math.abs(config.omegaK) < 1e-15) return chiValue;
    if (config.omegaK > 0) {
      const root = Math.sqrt(config.omegaK);
      return Math.sinh(root * chiValue) / root;
    }
    const root = Math.sqrt(-config.omegaK);
    return Math.sin(root * chiValue) / root;
  };

  const dm = (SPEED_OF_LIGHT_KM_S / config.h0) * sK(chi);
  const da = dm / (1 + z);
  const dl = dm * (1 + z);
  const hubble = config.h0 * e(z);
  const hubbleGyrInv = (config.h0 * 1000 / MPC_IN_METERS) * GYR_IN_SECONDS;
  const age = simpson(
    (u) => 1 / e(Math.exp(-u) - 1),
    Math.log(1e-10),
    Math.log(1 / (1 + z)),
    INTEGRATION_STEPS
  ) / hubbleGyrInv;

  return {
    H: hubble,
    DM: dm,
    DA: da,
    DL: dl,
    age,
  };
}

function renderRedshiftRows(snapshot) {
  const theoremLink = "calculator-theorems.html#paper30.background_surface";
  const cardLink = "#output-background_snapshot_z_0_57";
  const rows = [
    ["H(z)", snapshot.H, "km/s/Mpc"],
    ["D_M(z)", snapshot.DM, "Mpc"],
    ["D_A(z)", snapshot.DA, "Mpc"],
    ["D_L(z)", snapshot.DL, "Mpc"],
    ["Age(z)", snapshot.age, "Gyr"],
  ];
  return rows.map(([label, value, unit]) => `
    <tr>
      <th scope="row"><a class="calc-inline-link" href="${cardLink}">${label}</a></th>
      <td>${formatNumber(value, 12)}</td>
      <td>${unit}</td>
      <td><a class="calc-inline-link" href="${theoremLink}">Paper 30 background surface</a></td>
    </tr>
  `).join("");
}

function initRedshiftWidget() {
  const widget = document.getElementById("redshift-widget");
  if (!widget) return;

  const input = document.getElementById("redshift-widget-input");
  const results = document.getElementById("redshift-widget-results");
  if (!(input instanceof HTMLInputElement) || !results) return;

  const config = {
    h0: Number(widget.dataset.h0),
    omegaM: Number(widget.dataset.omegaM),
    omegaR: Number(widget.dataset.omegaR),
    omegaK: Number(widget.dataset.omegaK),
    omegaLambda: Number(widget.dataset.omegaLambda),
  };
  const defaultZ = Number(widget.dataset.zDefault || "0.57");

  const update = () => {
    const requested = Number(input.value);
    const z = Number.isFinite(requested) && requested >= 0 ? requested : defaultZ;
    if (z !== requested) {
      input.value = String(defaultZ);
    }
    const snapshot = computeBackgroundSnapshot(config, z);
    results.innerHTML = renderRedshiftRows(snapshot);
  };

  input.addEventListener("input", update);
  input.addEventListener("change", update);
  update();
}

window.addEventListener("DOMContentLoaded", () => {
  markPrerenderedSurfaces();
  revealHashTarget();
  initRedshiftWidget();
});

window.addEventListener("hashchange", revealHashTarget);

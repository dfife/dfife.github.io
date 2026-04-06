const HIGHLIGHT_ORDER = [
  "CMB Temperature",
  "Deuterium Abundance (D/H)",
  "Helium-4 Abundance (Y_p)",
  "Lithium-7 Abundance",
  "Spectral Index (n_s)",
  "Scalar Amplitude (A_s)",
  "Gravitational Slip (Σ_IO)",
  "Hubble Constant (H₀)",
  "Baryon Fraction",
  "Acoustic Scale (θ_s)"
];

const channelClass = (channel) => {
  if (channel === "static") return "static";
  if (channel === "dynamic") return "dynamic";
  if (channel === "mixed") return "mixed";
  return "outside";
};

async function loadHighlights() {
  const root = document.getElementById("highlights");
  if (!root) return;

  try {
    const response = await fetch("data/crossings.json");
    const crossings = await response.json();
    const lookup = new Map(crossings.map((item) => [item.name, item]));
    const selected = HIGHLIGHT_ORDER.map((name) => lookup.get(name)).filter(Boolean);

    root.innerHTML = "";

    for (const item of selected) {
      const card = document.createElement("article");
      card.className = `highlight-card ${channelClass(item.channel)}`;
      card.innerHTML = `
        <div class="result-name">${item.name}</div>
        <div class="result-row">
          <div class="result-label">IO prediction</div>
          <div class="result-value">${item.prediction}</div>
        </div>
        <div class="result-row">
          <div class="result-label">Observation</div>
          <div class="result-value">${item.observation}</div>
        </div>
        <div class="result-row">
          <div class="result-label">Residual</div>
          <div class="result-value">${item.residual}</div>
        </div>
      `;
      root.appendChild(card);
    }
  } catch (error) {
    root.innerHTML = `
      <article class="highlight-card outside">
        <div class="result-name">Could not load key results</div>
        <p class="card-note">Check that <span class="code">data/crossings.json</span> is available.</p>
      </article>
    `;
    console.error(error);
  }
}

loadHighlights();

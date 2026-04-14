const ERA_ORDER = [
  "Foundation",
  "The Rosetta Stone",
  "Operator Closure",
  "The BBN Breakthrough",
  "CMB Confrontation",
  "Observational Validation",
  "Framework Closure",
  "The Bridge"
];

const ERA_LABELS = {
  "Foundation": "Papers 1-7",
  "The Rosetta Stone": "Papers 8-15",
  "Operator Closure": "Papers 16-22",
  "The BBN Breakthrough": "Papers 23-25",
  "CMB Confrontation": "Papers 26-28",
  "Observational Validation": "Papers 29-30",
  "Framework Closure": "Papers 31-32",
  "The Bridge": "The Bridge (Papers 33-35)"
};

function crossingHref(name) {
  return `bridge-map.html?crossing=${encodeURIComponent(name)}`;
}

function renderPaperCard(paper) {
  const wrapper = document.createElement("article");
  wrapper.className = "paper-card";

  const bridgeLinks = paper.bridges
    .map((name) => `<a class="bridge-chip" href="${crossingHref(name)}">${name}</a>`)
    .join("");

  const numberBadge = paper.coming_soon
    ? `<span class="paper-number">${paper.paper}</span>`
    : `<a class="paper-number paper-number-link" href="${paper.zenodo}" target="_blank" rel="noreferrer" aria-label="Open Paper ${paper.paper} on Zenodo">${paper.paper}</a>`;

  const action = paper.coming_soon
    ? `<span class="button button-small button-disabled">Coming Soon</span>`
    : `<a class="button button-small button-outline" href="${paper.zenodo}" target="_blank" rel="noreferrer">Zenodo Record</a>`;

  wrapper.innerHTML = `
    <div class="paper-top">
      ${numberBadge}
      <div class="paper-header">
        <div class="paper-meta">${paper.era}</div>
        <h3 class="paper-title">${paper.short_title}</h3>
      </div>
    </div>
    <p class="paper-summary">${paper.summary}</p>
    <div class="paper-bridges">${bridgeLinks}</div>
    <div class="paper-actions">
      ${action}
    </div>
  `;

  return wrapper;
}

async function loadPapers() {
  const root = document.getElementById("papers-root");
  if (!root) return;

  try {
    const response = await fetch("data/papers.json");
    const papers = await response.json();
    const byEra = new Map();
    for (const era of ERA_ORDER) byEra.set(era, []);
    for (const paper of papers) {
      if (!byEra.has(paper.era)) byEra.set(paper.era, []);
      byEra.get(paper.era).push(paper);
    }

    root.innerHTML = "";

    for (const era of ERA_ORDER) {
      const entries = byEra.get(era);
      if (!entries || !entries.length) continue;

      entries.sort((a, b) => a.paper - b.paper);

      const section = document.createElement("section");
      section.className = "era-section";

      const header = document.createElement("div");
      header.className = "era-header";
      header.innerHTML = `
        <h2 class="era-title">${era}</h2>
        <div class="era-range">${ERA_LABELS[era] || ""}</div>
      `;

      const grid = document.createElement("div");
      grid.className = "paper-grid";
      for (const paper of entries) {
        grid.appendChild(renderPaperCard(paper));
      }

      section.appendChild(header);
      section.appendChild(grid);
      root.appendChild(section);
    }
  } catch (error) {
    root.innerHTML = `
      <div class="empty-state">
        Could not load the paper index. Check that <span class="code">data/papers.json</span> is available.
      </div>
    `;
    console.error(error);
  }
}

loadPapers();

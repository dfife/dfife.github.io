const CHANNEL_META = {
  static: {
    label: "Static Geometric",
    className: "static",
    summary: "Always-on geometric or gauge projection laws that do not require KMS gating."
  },
  dynamic: {
    label: "Dynamic Thermal",
    className: "dynamic",
    summary: "State-gated Hawking, KMS, and thermal-covariance crossings."
  },
  mixed: {
    label: "Mixed/Source",
    className: "mixed",
    summary: "Source, transport, and history layers that do not reduce to a single static or thermal rule."
  },
  outside: {
    label: "Outside Domain",
    className: "outside",
    summary: "Negative or out-of-domain cases that sharpen where the bridge does not currently export a correction."
  }
};

const CHANNEL_ORDER = ["static", "dynamic", "mixed", "outside"];

const state = {
  crossings: [],
  channel: "all",
  status: "all",
  search: "",
  selected: ""
};

function normalizeStatus(status) {
  const key = statusMeta(status).key;
  if (key === "no-go") return "no-go";
  if (key === "conditional") return "conditional";
  return "derived";
}

function statusMeta(status) {
  const upper = status.toUpperCase();
  if (upper.includes("NO-GO")) {
    return { key: "no-go", label: "NO-GO" };
  }
  if (upper.includes("THEOREM")) {
    return { key: "theorem", label: "THEOREM" };
  }
  if (upper.includes("DERIVED") && upper.includes("SCOPED")) {
    return { key: "derived-scoped", label: "DERIVED/SCOPED" };
  }
  if (upper.includes("CONDITIONAL")) {
    return { key: "conditional", label: "CONDITIONAL" };
  }
  if (upper.includes("DERIVED")) {
    return { key: "derived", label: "DERIVED" };
  }
  return { key: "derived", label: upper };
}

function matchesFilters(item) {
  if (state.channel !== "all" && item.channel !== state.channel) {
    return false;
  }

  if (state.status !== "all" && normalizeStatus(item.status) !== state.status) {
    return false;
  }

  if (!state.search) return true;

  const haystack = [
    item.name,
    item.quantum_input,
    item.classical_output,
    item.constants.join(" "),
    item.summary,
    item.status,
    item.prediction,
    item.observation,
    item.papers.join(" ")
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(state.search.toLowerCase());
}

function selectedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const crossing = params.get("crossing");
  const search = params.get("search");
  if (crossing) state.selected = crossing;
  if (search) state.search = search;
}

function syncUrl() {
  const params = new URLSearchParams();
  if (state.selected) params.set("crossing", state.selected);
  if (state.search) params.set("search", state.search);
  const query = params.toString();
  const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, "", next);
}

function renderDetail(item) {
  const panel = document.getElementById("detail-panel");
  if (!panel) return;

  if (!item) {
    panel.innerHTML = `
      <div class="detail-header">
        <span class="badge outside">No results</span>
        <h2 class="detail-title">No crossing matches the current filters</h2>
        <p class="detail-summary">Try clearing the search box or switching the channel and status filters.</p>
      </div>
    `;
    return;
  }

  const badgeClass = CHANNEL_META[item.channel]?.className || "outside";
  const badgeLabel = CHANNEL_META[item.channel]?.label || "Outside Domain";
  const status = statusMeta(item.status);
  const statusDetail = status.label === item.status.toUpperCase()
    ? ""
    : `<div class="detail-note">${item.status}</div>`;
  const papers = item.papers.map((paper) => `Paper ${paper}`).join(", ");
  const constants = item.constants.length ? item.constants.join(", ") : "none";
  const zenodoAction = item.zenodo
    ? `<a class="button button-small button-outline" href="${item.zenodo}" target="_blank" rel="noreferrer">Open Zenodo Record</a>`
    : "";

  panel.innerHTML = `
    <div class="detail-header">
      <span class="badge ${badgeClass}">${badgeLabel}</span>
      <h2 class="detail-title">${item.name}</h2>
      <p class="detail-summary">${item.summary}</p>
    </div>
    <div class="detail-block">
      <div class="detail-label">Quantum input</div>
      <div class="detail-value">${item.quantum_input}</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">Classical output</div>
      <div class="detail-value">${item.classical_output}</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">IO constants</div>
      <div class="detail-value">${constants}</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">IO prediction</div>
      <div class="detail-value">${item.prediction}</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">Observation</div>
      <div class="detail-value">${item.observation}</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">Residual</div>
      <div class="detail-value">${item.residual}</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">Status</div>
      <div class="detail-value">
        <span class="badge status-badge status-${status.key}">${status.label}</span>
        ${statusDetail}
      </div>
    </div>
    <div class="detail-block">
      <div class="detail-label">Source papers</div>
      <div class="detail-value">${papers}</div>
    </div>
    <div class="detail-actions">
      ${zenodoAction}
      <a class="button button-small button-outline" href="papers.html">Browse paper cards</a>
    </div>
  `;
}

function renderBoard() {
  const board = document.getElementById("bridge-board");
  if (!board) return;

  const filtered = state.crossings.filter(matchesFilters);
  const availableNames = new Set(filtered.map((item) => item.name));

  if (!availableNames.has(state.selected)) {
    state.selected = filtered[0]?.name || "";
  }

  const selectedItem = filtered.find((item) => item.name === state.selected) || null;
  renderDetail(selectedItem);
  syncUrl();

  if (!filtered.length) {
    board.innerHTML = `
      <div class="empty-state">
        No crossings match the current filter combination.
      </div>
    `;
    return;
  }

  board.innerHTML = "";

  for (const channel of CHANNEL_ORDER) {
    if (state.channel !== "all" && state.channel !== channel) continue;

    const items = filtered.filter((item) => item.channel === channel);
    if (!items.length) continue;

    const lane = document.createElement("section");
    lane.className = "lane-card";

    const meta = CHANNEL_META[channel];
    lane.innerHTML = `
      <div class="lane-head">
        <div class="lane-title-wrap">
          <p class="lane-kicker">${meta.label}</p>
          <h2 class="lane-title">${meta.label}</h2>
          <p class="lane-summary">${meta.summary}</p>
        </div>
        <div class="lane-count">${items.length} crossing${items.length === 1 ? "" : "s"}</div>
      </div>
    `;

    const grid = document.createElement("div");
    grid.className = "node-grid";

    items
      .slice()
      .sort((a, b) => a.papers[0] - b.papers[0])
      .forEach((item) => {
        const status = statusMeta(item.status);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `node ${meta.className}${item.name === state.selected ? " active" : ""}`;
        button.setAttribute("aria-pressed", item.name === state.selected ? "true" : "false");
        button.innerHTML = `
          <div class="node-top">
            <h3 class="node-name">${item.name}</h3>
            <span class="badge status-badge status-${status.key}">${status.label}</span>
          </div>
          <div class="node-meta">
            <span class="meta-chip">Paper ${item.papers.join(", ")}</span>
            <span class="meta-chip">${item.constants.length ? item.constants.join(", ") : "no constants"}</span>
          </div>
          <p class="node-summary">${item.summary}</p>
        `;
        button.addEventListener("click", () => {
          state.selected = item.name;
          renderBoard();
        });
        grid.appendChild(button);
      });

    lane.appendChild(grid);
    board.appendChild(lane);
  }
}

function setActiveButton(groupId, attr, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset[attr] === value);
  });
}

function wireFilters() {
  document.querySelectorAll("#channel-filters .filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.channel = button.dataset.channel;
      setActiveButton("channel-filters", "channel", state.channel);
      renderBoard();
    });
  });

  document.querySelectorAll("#status-filters .filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.status = button.dataset.status;
      setActiveButton("status-filters", "status", state.status);
      renderBoard();
    });
  });

  const searchInput = document.getElementById("bridge-search");
  if (searchInput) {
    searchInput.value = state.search;
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value.trim();
      renderBoard();
    });
  }
}

async function init() {
  selectedFromUrl();
  wireFilters();

  try {
    const response = await fetch("data/crossings.json");
    state.crossings = await response.json();
    renderBoard();
  } catch (error) {
    const board = document.getElementById("bridge-board");
    if (board) {
      board.innerHTML = `
        <div class="empty-state">
          Could not load the crossing dataset. Check that <span class="code">data/crossings.json</span> is available.
        </div>
      `;
    }
    console.error(error);
  }
}

init();

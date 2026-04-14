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

window.addEventListener("DOMContentLoaded", () => {
  markPrerenderedSurfaces();
  revealHashTarget();
});

window.addEventListener("hashchange", revealHashTarget);

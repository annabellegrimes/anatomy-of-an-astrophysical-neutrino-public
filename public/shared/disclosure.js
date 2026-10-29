// Shared: collapsible notes sections.
// Collapsible notes. Each button toggles its own panel in place (no overlay); collapsed panels are inert so keyboard
// and screen-reader users skip them. Space and Enter work because these are real buttons.
document.querySelectorAll(".disc-btn").forEach(btn => {
  const panel = document.getElementById(btn.getAttribute("aria-controls")), state = btn.querySelector(".disc-state");
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    state.textContent = open ? "Hide" : "Show";
    if (open) panel.inert = false;
    panel.classList.toggle("open", open);
    if (!open) {   // stay reachable while it animates shut, then take it out of the tab order
      const done = () => { if (btn.getAttribute("aria-expanded") === "false") panel.inert = true; };
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) done();
      else panel.addEventListener("transitionend", function te(e) { if (e.target === panel && e.propertyName === "grid-template-rows") { panel.removeEventListener("transitionend", te); done(); } });
    }
  });
});

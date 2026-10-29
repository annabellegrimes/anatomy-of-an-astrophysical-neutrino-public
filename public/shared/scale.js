// Shared: the scale bar under the card (window.SCALE). Load it after the #scale-ind markup.
// Scale bar under the card, like a map's: its length follows the zoom so that its label is always a round distance
// (1, 2 or 5 of a sensible unit). Scenes report with SCALE.set({ mpp, where }) or SCALE.set({ nts: "reason" }).
window.SCALE = (function () {
  const el = document.getElementById("scale-ind"), val = el.querySelector(".si-val"), note = el.querySelector(".si-note"), unit = el.querySelector(".si-unit"), bar = el.querySelector(".si-bar");
  const LY = 9.4607e15, AU = 1.496e11;
  const UNITS = [[1e-15, "fm"], [1e-12, "pm"], [1e-9, "nm"], [1e-6, "µm"], [1e-3, "mm"], [1, "m"], [1e3, "km"], [AU, "AU"], [LY, "light-years"], [1e6 * LY, "million light-years"], [1e9 * LY, "billion light-years"]];
  // the longest round distance that fits in maxPx
  // units: an optional list of [metres, singular, plural] for scenes better measured in their own units (light-hours)
  function pick(mpp, maxPx, units) {
    const span = mpp * maxPx, list = units || UNITS;
    let u = list[0]; for (const x of list) if (x[0] <= span) u = x;
    if (!units && u[1] === "AU" && span >= 0.05 * LY) u = UNITS[8];   // past ~3,000 AU, light-years read better
    const v = span / u[0], p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = [5, 2, 1].map(m => m * p).find(x => x <= v) || p;
    return { px: n * u[0] / mpp, txt: n.toLocaleString("en-US") + " " + (n === 1 && u[2] ? u[1] : (u[2] || u[1])) };
  }
  let cur = null, key = "";
  function set(info) { cur = info; place(); }
  function place() {
    let step = null;
    for (const c of document.querySelectorAll(".step.active, .pstep.active")) if (getComputedStyle(c).visibility === "visible") step = c;
    const card = step && step.firstElementChild, r = card && card.getBoundingClientRect();
    if (!cur || !r || r.bottom < 0 || r.top > innerHeight) { el.hidden = true; return; }
    el.hidden = false;
    const phone = innerWidth <= 820, maxPx = phone ? 100 : 180;
    if (phone) { el.style.left = "auto"; el.style.right = "12px"; el.style.width = "136px"; el.style.top = "120px"; }   /* clear of the flavour and level switches */
    else { el.style.right = "auto"; el.style.left = r.left + "px"; el.style.width = r.width + "px"; el.style.top = r.bottom + 10 + "px"; }
    const nts = !cur.mpp, s = nts ? { px: maxPx * 0.7, txt: "Not to scale" } : pick(cur.mpp, maxPx, cur.units);
    if (cur.approx && !nts) s.txt = "≈ " + s.txt;
    bar.style.width = s.px.toFixed(1) + "px";
    const n = phone ? "" : nts ? cur.nts : cur.where;
    // Beginner: what the units on the bar and in its note mean
    const u = document.documentElement.dataset.level === "1" && !nts ? unitNotes(s.txt + " " + n).join(". ") + "." : "";
    if (s.txt + n + u !== key) {
      key = s.txt + n + u; el.classList.toggle("nts", nts); val.textContent = s.txt; note.textContent = n; note.hidden = !n;
      unit.textContent = u; unit.hidden = !u || u === ".";
      el.setAttribute("aria-label", nts ? "Scale: not to scale. " + n : "Scale bar: " + s.txt + " in the scene. " + n);
    }
  }
  let q = false;
  const req = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; place(); }); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); document.addEventListener("levelchange", req);
  return { set, LY };
})();

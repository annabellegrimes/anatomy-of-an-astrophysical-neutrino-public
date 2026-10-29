// Shared: the explanation level (Beginner / Standard / Expert) and its glossaries (unitNotes, greekNotes, hudUnits).
// Load it right after the #level-ctl markup, so the level is set before the cards are parsed.
// Explanation level, set before the cards are parsed so they never show at the wrong level. Remembered per browser;
// ?level=1, 2 or 3 in the address overrides it (handy for sharing a link). Scenes listen for "levelchange" to refit cards.
(function () {
  const ctl = document.getElementById("level-ctl"), input = document.getElementById("level");
  const NAMES = { 1: "Beginner: minimal science background needed", 2: "Standard", 3: "Expert: extra technical detail" };
  // the line under the slider: what this level gives you
  const DESC = window.LEVEL_DESC || {   // a page may give its own lines (set before this script)
    1: "<b>Beginner</b> · minimal science; a few steps are skipped",
    2: "<b>Standard</b> · the whole story, with some school science",
    3: "<b>Expert</b> · adds equations, sources and flavour change"
  };
  const desc = document.getElementById("lv-desc");
  function set(v, save) {
    v = Math.min(3, Math.max(1, Math.round(+v) || 2));
    document.documentElement.dataset.level = v;
    input.value = v; input.setAttribute("aria-valuetext", NAMES[v]);
    input.style.setProperty("--fill", (v - 1) * 50 + "%");
    desc.innerHTML = DESC[v];
    for (let i = 1; i <= 3; i++) input.style.setProperty("--d" + i, i <= v ? "var(--cher)" : "var(--dot-off)");   // stops reached are filled
    ctl.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.v === v));
    if (save) { try { localStorage.setItem("nu-level", v); } catch (e) {} }
    document.querySelectorAll(".card").forEach(c => { c.scrollTop = 0; });
    document.dispatchEvent(new CustomEvent("levelchange", { detail: v }));
  }
  let start = 2;
  try { start = localStorage.getItem("nu-level") || 2; } catch (e) {}
  const q = new URLSearchParams(location.search).get("level");
  set(q || start, false);
  input.addEventListener("input", () => set(input.value, true));
  ctl.querySelectorAll("button").forEach(b => b.addEventListener("click", () => set(b.dataset.v, true)));
  window.setLevel = v => set(v, true);
})();
// At Beginner, the readouts and the scale bar explain each unit they show. unitNotes(text) gives the plain-English
// meaning of every unit found in a piece of readout text (HTML and TeX allowed), once each, in this order.
window.unitNotes = (function () {
  const G = [
    [/\blight-years?\b|\bly\b/, "ly (light-year): how far light travels in a year, about 9.5 trillion km"],
    [/\blight-days?\b/, "light-day: how far light travels in a day, about 26 billion km"],
    [/\blight-hours?\b/, "light-hour: how far light travels in an hour, about 1 billion km"],
    [/\blight-minutes?\b/, "light-minute: how far light travels in a minute, about 18 million km"],
    [/\bAU\b/, "AU: the distance from the Earth to the Sun, about 150 million km"],
    [/\bkm\b|kilometres?/, "km (kilometre): 1,000 metres"],
    [/\d\s?m\b|\bmetres?\b/, "m (metre): about one long step"],
    [/\bcm\b/, "cm (centimetre): a hundredth of a metre"],
    [/\bmm\b/, "mm (millimetre): a thousandth of a metre"],
    [/µm\b/, "µm (micrometre): a millionth of a metre"],
    [/\bnm\b|nanometres?/, "nm (nanometre): a billionth of a metre"],
    [/\bpm\b|picometres?/, "pm (picometre): a trillionth of a metre; an atom is about 100 pm across"],
    [/\bfm\b|femtometres?/, "fm (femtometre): a millionth of a billionth of a metre, about the size of a proton"],
    [/\b[kMGTP]?eV\b/, "eV (electronvolt): a tiny amount of energy, used for particles. MeV = a million eV, GeV = a billion, TeV = a trillion, PeV = a thousand trillion"],
    [/(\d|\\\))\s?K\b|\bkelvin\b/,"K (kelvin): degrees, counted up from absolute zero (−273 °C)"],
    [/\bms\b/, "ms: a thousandth of a second"],
    [/µs\b/, "µs: a millionth of a second"],
    [/\bns\b/, "ns: a billionth of a second"],
    [/\bps\b/, "ps: a trillionth of a second"],
    [/\byr\b|\bGyr\b/, "yr: years"],
    [/10\^|10<sup>|×\s?10\b/, "powers of ten: 10 with a small 9 beside it means a 1 with 9 zeros after it, a billion"]
  ];
  return text => { const t = String(text).replace(/<[^>]+>/g, " "); return G.filter(([re]) => re.test(t)).map(([, s]) => s); };
})();
// What the Greek letters (and the Sun and Earth signs) in a piece of maths mean, read from its TeX: one line each,
// for the hover tips on the page's maths and on the drawings' labels. Context decides between meanings: π with a
// charge is a pion, otherwise the number; γ next to a number or β is the time-stretch factor, otherwise a gamma ray.
window.greekNotes = function (tex) {
  const t = String(tex), out = [], add = s => { if (!out.includes(s)) out.push(s); };
  const nuMu = /\\nu_\{?\\mu/.test(t), nuE = /\\nu_\{?e\b/.test(t), nuTau = /\\nu_\{?\\tau/.test(t), bar = /\\bar\s*\{?\\nu/.test(t);
  if (bar) add("ν̄ (nu-bar): an antineutrino, the antimatter twin of a neutrino");
  if (nuMu) add("ν_μ (nu-mu): a muon neutrino");
  if (nuE) add("ν_e (nu-e): an electron neutrino");
  if (nuTau) add("ν_τ (nu-tau): a tau neutrino");
  if (/\\nu(?![a-z])/.test(t) && !nuMu && !nuE && !nuTau && !bar) add("ν (nu): a neutrino");
  if (/\\mu(?![a-z])(?!\\mathrm\{m\})/.test(t.replace(/\\nu_\{?\\mu/g, ""))) add("μ (mu): a muon, a heavier cousin of the electron (μ⁻), or its antimatter twin (μ⁺)");
  if (/\\mu\\mathrm\{m\}/.test(t)) add("μ (mu) in μm: micro, a millionth");
  const tau = t.replace(/\\nu_\{?\\tau/g, "");
  if (/c\s*\\tau/.test(tau)) add("τ (tau) after c: the particle's lifetime (cτ is how far light goes in that time)");
  else if (/\\tau(?![a-z])/.test(tau)) add("τ (tau): the tau, the heaviest cousin of the electron");
  if (/\\pi\s*\^/.test(t)) add("π (pi): a pion, a short-lived particle made in collisions (π⁺, π⁻ or π⁰ by its charge)");
  else if (/\\pi(?![a-z])/.test(t)) add("π (pi): the number 3.14159…");
  if (/\\gamma\s*(\\approx|>|=|\\beta|c\b)|\\gamma\\beta/.test(t)) add("γ (gamma): the Lorentz factor, how much a fast particle's clock slows down");
  else if (/\\gamma(?![a-z])/.test(t)) add("γ (gamma): a gamma ray, very high-energy light");
  if (/\\Delta\s*(\^|\()/.test(t)) add("Δ (Delta): the Delta resonance, a proton briefly excited by a collision");
  else if (/\\Delta(?![a-z])/.test(t)) add("Δ (delta): 'the change in' or 'the difference in'");
  if (/\\theta(?![a-z])/.test(t)) add(/\\theta_C/.test(t) ? "θ_C (theta-C): the Cherenkov angle, at which the light leaves the particle's path" : "θ (theta): an angle");
  if (/\\beta(?![a-z])/.test(t) && !/\\alpha\s*\\beta|_\{?\\beta/.test(t)) add("β (beta): speed as a fraction of the speed of light");   // not the flavour label in P_αβ
  if (/\\lambda(?![a-z])/.test(t)) add("λ (lambda): a wavelength, or a length such as the distance between interactions");
  if (/\\alpha(?![a-z])/.test(t)) add(/_\{?\\alpha/.test(t) ? "α, β as small labels: stand for any of the three flavours" : "α (alpha): the fine-structure constant, about 1/137, which sets the strength of electric forces");
  if (/\\sigma(?![a-z])/.test(t)) add("σ (sigma): the cross-section, how likely an interaction is");
  if (/\\rho\s*\^/.test(t)) add("ρ (rho): the rho meson, a short-lived particle");
  else if (/\\rho(?![a-z])/.test(t)) add("ρ (rho): density");
  if (/\\(var)?epsilon/.test(t)) add("ε (epsilon): a photon's energy");
  if (/\\Omega/.test(t)) add("Ω_m (Omega-m): the share of the universe's energy that is matter");
  if (/\\ell(?![a-z])/.test(t)) add("ℓ (ell): a charged lepton, that is an electron, muon or tau");
  if (/\\odot/.test(t)) add("⊙: the Sun (M⊙ is the Sun's mass)");
  if (/\\oplus/.test(t)) add("⊕: the Earth (R⊕ is its radius)");
  return out;
};
// the readouts' footnote of units (Beginner only)
window.hudUnits = html => {
  if (document.documentElement.dataset.level !== "1") return "";
  const n = unitNotes(html);
  return n.length ? `<div class="hud-units">${n.map(t => `<div>${t}</div>`).join("")}</div>` : "";
};

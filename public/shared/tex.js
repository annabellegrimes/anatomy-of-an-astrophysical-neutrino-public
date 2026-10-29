// Shared: maths typesetting (TEX for canvas labels, KaTeX for page text) and the Greek-letter tips on page maths.
// Shared maths typesetting, one notation for the whole page (\nu_\mu, \mu^-, \pi^0, ...).
// Page text uses \( ... \): KaTeX renders it once the page has loaded (and TEX.html for text set later, like the
// readouts). Canvas labels can't take KaTeX's HTML, so $...$ inside a label is laid out here with KaTeX's own fonts:
// a TeX subset (Greek letters, sub- and superscripts, \bar, \mathrm and \text, arrows, relations), drawn as native
// text so it stays sharp at every zoom.
window.TEX = (function () {
  const CMD = { nu: "ν", mu: "μ", tau: "τ", pi: "π", gamma: "γ", theta: "θ", delta: "δ", beta: "β", rho: "ρ", ell: "ℓ",
    Delta: "Δ", to: "→", rightarrow: "→", approx: "≈", cdot: "⋅", times: "×", sim: "∼", leq: "≤", geq: "≥", ldots: "…", lt: "<", gt: ">", circ: "∘", Omega: "Ω", lambda: "λ" };
  const BIN = new Set(["+", "−", "=", "→", "≈", "×", "⋅", "∼", "≤", "≥", "<", ">"]);
  function parse(s) {
    let i = 0;
    const group = () => { i++; const g = seq(); i++; return { k: "grp", items: g }; };
    function atom() { while (s[i] === " ") i++; return s[i] === "{" ? group() : token(); }
    function token() {
      const c = s[i];
      if (c === "\\") {
        let j = i + 1; while (j < s.length && /[A-Za-z]/.test(s[j])) j++;
        if (j === i + 1) { const sp = s[j]; i = j + 1; return { k: "sp", em: { ",": 0.17, ";": 0.28, " ": 0.25, "!": -0.17 }[sp] || 0 }; }
        const name = s.slice(i + 1, j); i = j;
        if (name === "bar") return { k: "bar", item: atom() };
        if (name === "mathrm") {   // maths set upright: H_2O, ^{16}O
          const up = n => { if (!n) return; if (n.k === "g") n.up = true; (n.items || []).forEach(up); up(n.item); up(n.base); up(n.sup); up(n.sub); };
          const g = atom(); up(g); return g;
        }
        if (name === "text") {
          while (s[i] === " ") i++;
          let d = 1, k = i + 1; while (k < s.length && d) { if (s[k] === "{") d++; else if (s[k] === "}") d--; k++; }
          const txt = s.slice(i + 1, k - 1); i = k; return { k: "txt", s: txt };
        }
        const ch = CMD[name] || name;
        return { k: "g", ch, up: !/^[α-ω]$/.test(ch) };   // lowercase Greek is italic, as in TeX; Δ and symbols upright
      }
      i++;
      if (c === "-") return { k: "g", ch: "−", up: true };
      return { k: "g", ch: c, up: !/[A-Za-z]/.test(c) };
    }
    function seq() {
      const out = [];
      while (i < s.length && s[i] !== "}") {
        const c = s[i];
        if (c === " ") { i++; continue; }
        if (c === "^" || c === "_") {
          i++;
          let last = out[out.length - 1];
          if (!last || last.k !== "scr") { last = { k: "scr", base: out.pop() || null }; out.push(last); }
          last[c === "^" ? "sup" : "sub"] = atom();
          continue;
        }
        out.push(c === "{" ? group() : token());
      }
      return out;
    }
    return seq();
  }
  const mctx = document.createElement("canvas").getContext("2d");
  const fontOf = (up, px, bold) => up ? `${bold ? "bold " : ""}${px}px KaTeX_Main` : `${bold ? "bold " : ""}italic ${px}px KaTeX_Math`;
  // lay out one $...$ run at size px; positions are relative to (start x, middle of the line)
  function layoutMath(src, px, bold) {
    const ops = [], bars = [];
    const glyph = (ch, up, sz, x, y) => { const f = fontOf(up, sz, bold); mctx.font = f; ops.push({ ch, f, x, y }); return x + mctx.measureText(ch).width; };
    function place(items, sz, x, y, top) { items.forEach((n, j) => { x = node(n, sz, x, y, top, j === 0); }); return x; }
    function node(n, sz, x, y, top, first) {
      if (n.k === "g") {
        const bin = top && !first && BIN.has(n.ch);
        if (bin) x += 0.24 * sz;
        x = glyph(n.ch, n.up, sz, x, y);
        return bin ? x + 0.24 * sz : x;
      }
      if (n.k === "sp") return x + n.em * sz;
      if (n.k === "txt") return glyph(n.s, true, sz, x, y);
      if (n.k === "grp") return place(n.items, sz, x, y, top);
      if (n.k === "bar") { const x0 = x; x = node(n.item, sz, x, y, top, true); bars.push({ x0: x0 + 0.1 * sz, x1: x - 0.02 * sz, y: y - 0.36 * sz, h: Math.max(1, sz * 0.045) }); return x; }
      if (n.k === "scr") {
        const base = n.base;
        x = base ? node(base, sz, x, y, top, first) : x;
        const ss = Math.round(sz * 0.7), ic = base && base.k === "g" && !base.up ? 0.06 * sz : 0;
        let xe = x;
        if (n.sup) xe = Math.max(xe, place([n.sup], ss, x + ic, y - (n.sub ? 0.32 : 0.29) * sz, false));
        if (n.sub) xe = Math.max(xe, place([n.sub], ss, x, y + (n.sup ? 0.3 : 0.26) * sz, false));
        return xe + 0.03 * sz;
      }
      return x;
    }
    const w = place(parse(src), px, 0, 0, true);
    return { w, ops, bars };
  }
  // a whole label: plain runs in the label font (with the old one-character _x / ^x scripts), $...$ runs as maths
  const cache = new Map();
  function line(str, size, weight, family) {
    const key = size + "|" + weight + "|" + family + "|" + str;
    let L = cache.get(key);
    if (L) return L;
    const ops = [], bars = []; let x = 0;
    str.split("$").forEach((part, idx) => {
      if (!part) return;
      if (idx % 2) {
        const m = layoutMath(part, Math.round(size * 1.18), weight >= 600);
        for (const o of m.ops) ops.push({ ...o, x: o.x + x });
        for (const b of m.bars) bars.push({ ...b, x0: b.x0 + x, x1: b.x1 + x });
        x += m.w + size * 0.12;
        return;
      }
      let i = 0;
      while (i < part.length) {
        const ch = part[i];
        if ((ch === "_" || ch === "^") && i + 1 < part.length) {
          const f = `${weight} ${Math.round(size * 0.72)}px ${family}`; mctx.font = f;
          ops.push({ ch: part[i + 1], f, x, y: ch === "_" ? size * 0.32 : -size * 0.36 }); x += mctx.measureText(part[i + 1]).width; i += 2;
        } else {
          let j = i; while (j < part.length && part[j] !== "_" && part[j] !== "^") j++;
          const t = part.slice(i, j), f = `${weight} ${size}px ${family}`; mctx.font = f;
          ops.push({ ch: t, f, x, y: 0 }); x += mctx.measureText(t).width; i = j;
        }
      }
    });
    L = { w: x, ops, bars };
    if (cache.size > 800) cache.clear();
    cache.set(key, L);
    return L;
  }
  function draw(ctx, L, x, y) {
    for (const o of L.ops) { ctx.font = o.f; ctx.fillText(o.ch, x + o.x, y + o.y); }
    for (const b of L.bars) ctx.fillRect(x + b.x0, y + b.y - b.h / 2, b.x1 - b.x0, b.h);
  }
  // HTML: \( ... \) or $ ... $ -> KaTeX markup (plain Unicode if KaTeX failed to load)
  function plain(s) { return s.replace(/\\([A-Za-z]+)/g, (m, n) => CMD[n] || "").replace(/[{}^_\\]/g, ""); }
  function html(str) {
    return String(str).replace(/\\\((.+?)\\\)|\$([^$]+)\$/g, (m, a, b) => {
      const src = a || b;
      try { return window.katex ? katex.renderToString(src, { throwOnError: false }) : plain(src); } catch (e) { return plain(src); }
    });
  }
  // canvas text needs the fonts loaded before it draws with them; scenes redraw on "texfonts"
  const ready = document.fonts && document.fonts.load
    ? Promise.all(["italic 20px KaTeX_Math", "bold italic 20px KaTeX_Math", "20px KaTeX_Main", "bold 20px KaTeX_Main"].map(f => document.fonts.load(f)))
        .then(() => { cache.clear(); window.dispatchEvent(new Event("texfonts")); }).catch(() => {})
    : Promise.resolve();
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.renderMathInElement) return;
    renderMathInElement(document.body, { delimiters: [{ left: "\\(", right: "\\)", display: false }], throwOnError: false, ignoredClasses: ["hud"] });
    // keep a formula and the punctuation right after it on one line ("ν₁, ν₂" must not break before the comma)
    document.querySelectorAll(".katex").forEach(k => {
      const n = k.nextSibling;
      if (!n || n.nodeType !== 3 || !/^[,.;:)]/.test(n.nodeValue)) return;
      const m = n.nodeValue.match(/^[,.;:)]+/)[0], w = document.createElement("span");
      w.style.whiteSpace = "nowrap"; k.replaceWith(w); w.append(k, m); n.nodeValue = n.nodeValue.slice(m.length);
    });
    // hovering over (or tapping) maths with Greek letters explains them (greekNotes): one floating tip for the page,
    // under the formula, or above it near the bottom of the window
    const tip = document.createElement("div"); tip.className = "gk-tip"; tip.hidden = true; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip);
    document.querySelectorAll(".katex").forEach(k => {
      const a = k.querySelector("annotation"), notes = a && window.greekNotes ? greekNotes(a.textContent) : [];
      if (notes.length) { k.classList.add("gk"); k.dataset.gk = notes.join("\n"); }
    });
    document.addEventListener("mouseover", e => {
      const k = e.target.closest && e.target.closest(".katex.gk");
      if (!k) { tip.hidden = true; return; }
      tip.textContent = k.dataset.gk; tip.hidden = false;
      const r = k.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.max(8, Math.min(r.left, innerWidth - tw - 8)) + "px";
      tip.style.top = (r.bottom + 6 + th > innerHeight - 8 ? r.top - th - 6 : r.bottom + 6) + "px";
    });
    addEventListener("scroll", () => { tip.hidden = true; }, { passive: true, capture: true });
  });
  return { line, draw, html, ready };
})();

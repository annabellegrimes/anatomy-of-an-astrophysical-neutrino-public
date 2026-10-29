# Third-party files

These files are copied into `public/vendor/` so the page works offline. They are unchanged from their published versions.

| File | Source | Licence |
| --- | --- | --- |
| `vendor/three/three.min.js` | three.js r128, cdnjs.cloudflare.com | MIT, © 2010–2021 three.js authors |
| `vendor/three/OrbitControls.js` | three.js 0.128.0 examples, cdn.jsdelivr.net | MIT, © 2010–2021 three.js authors |
| `vendor/echarts/world.js` | Apache ECharts 4.9.0 world map, cdn.jsdelivr.net | Apache License 2.0 |
| `vendor/fonts/*.woff2` | IBM Plex Mono, IBM Plex Sans and Newsreader, Google Fonts | SIL Open Font License 1.1 |
| `vendor/katex/` (`katex.min.js`, `katex.min.css`, `contrib/auto-render.min.js`, `fonts/*.woff2`) | KaTeX 0.16.11, cdnjs.cloudflare.com | MIT, © 2013–2020 Khan Academy and other contributors; fonts SIL Open Font License 1.1 |

Only KaTeX's `.woff2` fonts are included; the `.woff` and `.ttf` fallbacks its stylesheet also lists are left out, since every browser that runs this page loads `.woff2`.

`vendor/fonts/fonts.css` is the Google Fonts stylesheet for these families, with its font URLs rewritten to point to the local files.

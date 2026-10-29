# Anatomy of an Astrophysical Neutrino

A scroll-driven, single-page visualisation that follows one high-energy neutrino from its birth beside the supermassive black hole of an active galaxy, across 7.9 billion years and through the Earth, into the ocean at the proposed P-ONE neutrino telescope. It then zooms into the interaction itself (muon, electron or tau flavour) and ends with an interactive 3D model of the P-ONE array.

It runs entirely on your own computer at http://localhost:3000. Everything it needs, including the three.js 3D library, the world map and the fonts, is in this folder, so it works offline. The only links that go online are the source citations in the notes at the bottom of the page.

## Requirements

- Windows 10 or 11. The server uses Windows PowerShell, which is built in, so there is **nothing to install**.
- A modern browser (Edge, Chrome or Firefox) with WebGL turned on, which is the default.

## Start it

1. Open this folder in File Explorer.
2. Double-click **`start.bat`**.

A console window opens and your browser goes to http://localhost:3000. Leave the console window open while you use the page. To stop the server, close that window or press `Ctrl+C` in it.

That's all you need to do on later launches too. For a one-click start, right-click `start.bat`, choose **Show more options → Send to → Desktop (create shortcut)**, and use the shortcut on your desktop.

### Start it from a terminal instead

In PowerShell or Command Prompt, from this folder:

```bat
start.bat
```

Or call the server script directly:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Options:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 3001     # use another port
powershell -ExecutionPolicy Bypass -File .\server.ps1 -NoBrowser     # don't open the browser
```

`-ExecutionPolicy Bypass` applies only to that one command and doesn't change your system settings.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Could not start the server on port 3000" | Another program is using port 3000. Close it, or run `start.bat 3001` and open http://localhost:3001. |
| Windows SmartScreen warns about `start.bat` | Choose **More info → Run anyway**. It only starts `server.ps1` from this folder. |
| The 3D globe or P-ONE model shows a message instead | Your browser has WebGL off or unavailable. Check that hardware acceleration is on in the browser's settings. |
| The page didn't change after you edited it | Refresh the page with `Ctrl+F5`. |

## Project layout

```
anatomy-of-an-astrophysical-neutrino/
├─ public/                  everything the browser loads
│  ├─ index.html            the neutrino page: its text, its own styles and its scene scripts
│  ├─ shared/               what every page uses (see below)
│  │  ├─ base.css           colours, type, the scroll layout (stage, cards, rail), readouts, scale bar, notes, level slider
│  │  ├─ tex.js             maths in the text (KaTeX) and on the drawings (TEX), and the Greek-letter tips
│  │  ├─ levels.js          the Beginner / Standard / Expert slider, and the unit and Greek-letter glossaries
│  │  ├─ scale.js           the scale bar under the card (SCALE)
│  │  └─ disclosure.js      the collapsible notes sections
│  └─ vendor/               local copies of third-party files
│     ├─ three/             three.js r128 and OrbitControls
│     ├─ echarts/           Apache ECharts 4.9 world map (globe coastlines)
│     ├─ fonts/             IBM Plex Mono, IBM Plex Sans, Newsreader
│     └─ katex/             KaTeX 0.16 (LaTeX maths in the text, and its fonts for canvas labels)
├─ server.ps1               the local web server (PowerShell, port 3000)
├─ start.bat                double-click launcher
├─ THIRD-PARTY-NOTICES.md   licences for the files in public/vendor
└─ README.md
```

## Where things are in `index.html`

| Section | What it draws |
| --- | --- |
| `<style>` | This page's own styling. Shared styling, including the colour tokens on `:root`, is in `shared/base.css`. |
| Prologue script (`#pscene`) | Active galactic nucleus, galaxy, cosmic journey, oscillations, Solar System, 3D globe, descent to the seafloor |
| Story script (`#scene`) | Zoom in from the ocean, water molecule, nucleus, W exchange, Cherenkov light and rings, for all three flavours |
| P-ONE script (`#pone-canvas`) | 3D array geometry, light model and event generators (`EVENT_TYPES`) |

The notes section at the bottom of the page lists the physics assumptions and sources.

## Editing

Edit `public/index.html` in any text editor, save, and refresh the browser. There is no build step.

Anything used by more than one page lives in `public/shared/`, so a fix there reaches every page. A new page loads `shared/base.css` after KaTeX's stylesheet (so the shared maths sizes win), `shared/tex.js` in its head, and `shared/levels.js` and `shared/scale.js` right after the `#level-ctl` and `#scale-ind` markup they control (copy that markup from `index.html`).

The **Beginner – Expert** slider at the top left picks how much science background the text assumes. Each paragraph can carry a `data-lvl` attribute listing the levels it shows at: `1` beginner, `2` standard, `3` expert. For example, `data-lvl="2 3"` hides a paragraph at Beginner, and `data-lvl="3"` adds it only for experts. Paragraphs without the attribute show at every level. Expert detail goes in a `<div class="deep" data-lvl="3">` box: a takeaway line, short bullet steps, equations on their own line, then sources. To open the page at a given level, add `?level=1`, `2` or `3` to the address.

The level also changes the prologue itself. Beginner skips the accelerator, making-the-neutrino and flavour-change cards; Standard skips only the flavour change. The skipped stretches are set in `setSkips()` in the prologue script, which also renumbers the cards and hides their stages on the rail. Hover descriptions of the sea creatures follow the level too: in a tooltip string, a paragraph starting `1|` shows only at Beginner, `23|` at Standard and Expert, and `3|` only at Expert.

## Git

This is the public repository for the page. Anyone can view and download it; only the owner can push changes. To save a change:

```bat
git add -A
git commit -m "Describe the change"
git push
```

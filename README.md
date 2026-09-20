# Hanna Yi — Portfolio

Static portfolio site. No build step, no dependencies — plain HTML, CSS and JavaScript.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Deploy to GitHub Pages

1. Push this folder to a repository.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. The site is served at `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so Jekyll does not process the files.

## Structure

```
index.html                  Homepage
about.html                  About
<project>.html              Nine project pages
assets/
  css/styles.css            All styles, including responsive rules
  js/site.js                Scroll, nav and interaction behavior
  js/gate.js                Theme / entry handling
  img/                      Optimized project imagery (JPEG, q90)
  fonts/                    Self-hosted webfonts + OFL licenses
  hanna-yi-resume-2026.pdf
```

## Notes

- Fonts are bundled locally; the site works fully offline.
- Images are pre-resized and re-encoded (~4.4 MB total).
- Responsive breakpoints at 860px and 480px.

## Fonts

Instrument Serif, Inter Tight and JetBrains Mono, used under the SIL Open Font License. License texts are in `assets/fonts/`.

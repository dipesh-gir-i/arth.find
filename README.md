# Arth.Find landing page

Static site (plain HTML, CSS, JS). No build step, no dependencies, no analytics.

Files: `index.html`, `styles.css`, `themes.css` (tokens copied from `extension/themes.css`), `app.js`, `config.js` (all external URLs), `team.html` + `team.js` (3D team sphere), `assets/` (team photos in `assets/team/`).

Preview locally: `cd website && python3 -m http.server 8765`, then open http://localhost:8765/

Before deploying
- The live site at https://arthfind.tech/ is a hash-routed app whose source is not in this repository. Its privacy policy (`#/privacy`) and team page (`#/team`) live there. This page links to those routes by absolute URL.
- Do not overwrite the live `index.html` with this one until the live privacy policy and team content have been merged into the same deployment. Otherwise `#/privacy` and `#/team` will stop working.
- Add a real product screenshot at `assets/promo.png` and replace the example block in the hero (see the comment in `index.html`).

Team sphere
- Members and LinkedIn links are listed in `team.js`. Add a photo as `assets/team/<photo>.jpg` (square, about 400px) and reference it in the `photo` field.
- The sphere is laid out for exactly 12 members (icosahedron vertices). Adding or removing members means changing the vertex list in `team.js`.

# sairajKhilariArch.github.io

Portfolio site for Sairaj Khilari — a builder exploring Rust, systems
programming, Linux, game-engine concepts, and operating-system development.

- **Live site:** https://sairajKhilariArch.github.io/
- **Main commit:** `7451bb5` (portfolio + 3D art) — then `fba3a3b` (multi-page restructure).

The portfolio is now split across multiple pages, with every project given its own page:

- **Home page:** `index.html` — hero, about, stack, Linux workspace, contact.
- **Project gallery:** `projects.html` — all ~27 projects in a filterable grid, each linking to that project's own page.
- **Project pages:** `projects/<name>.html` — one page per project, with description, tags,
  tech spec, and two CTAs (**Visit site** / **GitHub profile**) linking straight to code and
  demos.

The homepage loads the Three.js 3D art scene via an importmap (no build step, no npm install).


# acdn

Personal toolkit. Three things in one place.

| Directory | What it is |
|-----------|-----------|
| [`design/`](./design/) | Design system — tokens, fonts, philosophy |
| [`src/scss/`](./src/scss/) | SCSS implementation of the design system (npm: `@asong56/nepenthe`) |
| [`lib/`](./lib/) | Stroma.js — lightweight SEO meta tag generator |
| [`userscript/`](./userscript/) | Browser userscripts |
| [`assets/`](./assets/) | Shared icons, images, license texts |
| [`templates/`](./templates/) | Jinja2 macros for the site |

---

## Design System (`src/scss/`)

A minimalist 8-point grid UI architecture. Vanilla SCSS, zero JS, semantic HTML first.

Philosophy: **Innei Yohaku · Apple HIG · Tidal Design Language**

```bash
npm install @asong56/nepenthe
```

```scss
@use '@asong56/nepenthe/scss/main';
// or pick partials:
@use '@asong56/nepenthe/scss/variables';
@use '@asong56/nepenthe/scss/interactions';
```

See [`design/DESIGN.md`](./design/DESIGN.md) for the full design rationale and token reference.

---

## Stroma.js (`lib/`)

Lightweight SEO meta tag generator. No dependencies, < 2KB gzipped, SPA & SSR ready.

```js
import Stroma from './lib/stroma.js';

Stroma.init({
  title: 'My Page',
  description: 'About my page',
  schema: 'article',
});
```

See [`lib/`](./lib/) for the full API and TypeScript types.

---

## Userscripts (`userscript/`)

| Script | What it does |
|--------|-------------|
| `bewlias.user.js` | Clean, private Bilibili homepage redesign |
| `github-enhancer.user.js` | GitHub UI improvements |
| `playback-speed.user.js` | Persistent playback speed control |

Install via [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).

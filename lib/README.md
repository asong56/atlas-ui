# Stroma.js

Lightweight, framework-agnostic SEO meta tag generator. < 2KB gzipped, no dependencies, SPA & SSR ready.

## Usage

**Client-side (SPA):**
```js
import Stroma from './stroma.js';

Stroma.init({
  title: 'My Article',
  description: 'A short description.',
  url: 'https://example.com/article',
  schema: 'article',
  author: 'Your Name',
  datePublished: '2025-01-01',
});

// Update on route change:
Stroma.update({ title: 'New Page' });
```

**Server-side (SSR):**
```js
const html = Stroma.renderToString({ title: '...', description: '...' });
// inject html into <head>
```

## API

| Method | Description |
|--------|-------------|
| `Stroma.init(options)` | Write all tags to DOM, replacing any previous Stroma tags |
| `Stroma.update(patch)` | Merge patch into current config and re-init |
| `Stroma.reset()` | Remove all Stroma-injected tags |
| `Stroma.renderToString(options)` | Return tag HTML string for SSR |
| `Stroma.breadcrumb(items)` | Inject a BreadcrumbList JSON-LD block |
| `Stroma.defaults(patch)` | Override module-level defaults |
| `Stroma.getConfig()` | Return current resolved config |

See `stroma.d.ts` for full TypeScript types.

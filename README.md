# NovaBrowser

**The Browser of the Nova Ecosystem** — browser first, ecosystem second.

See [`docs/DESIGN_PHILOSOPHY.md`](docs/DESIGN_PHILOSOPHY.md) (absolute priority).

## Identity

Professional web browser. Not a desktop dashboard. Web content owns ~95% of the window.

## Architecture

```
Sidebar (icons) │ Tab bar
                │ Toolbar (nav + address)
                │────────────────────────
                │ WebView  (~95%)
                │   nova://… → internal tab pages
                │   http(s)  → guest content (future)
```

## Scripts

```bash
npm install
npm run electron:dev
npm run build
npm run lint
npm run typecheck
```

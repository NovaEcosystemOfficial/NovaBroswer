# NovaBrowser

**The Browser of the Nova Ecosystem** — browser first, ecosystem second.

See [`docs/DESIGN_PHILOSOPHY.md`](docs/DESIGN_PHILOSOPHY.md) (absolute priority).

## Sprint status

| Sprint | Focus                                           | Status      |
| ------ | ----------------------------------------------- | ----------- |
| 0      | Foundation + shell                              | Done        |
| 1      | Real Chromium WebView                           | Done        |
| 2      | Solid navigation + tabs                         | Done        |
| 3–4    | Internal `nova://` pages + thin chrome          | Done        |
| 5      | Local persistence (history, bookmarks, session) | Done        |
| 6      | Opera GX–inspired foundation (GX Control)       | In progress |

### Sprint 5

- Local persistence via `localStorage`
- Browsing history recorded and shown in `nova://history`
- Bookmarks (star in toolbar + `Ctrl+D`) in `nova://bookmarks`
- Open tabs restored on relaunch
- New Tab shortcuts/recents driven by real bookmarks/history

### Sprint 6 (Opera GX direction)

- `nova://gx` resource control tab (CPU / RAM / Network)
- Network throttle applied to Chromium guests via CDP
- Soft CPU/RAM policy: prune inactive `BrowserView`s
- Profile → `nova://settings`, Ryuk → `nova://ai`
- Thin GX accent on chrome — still browser-first, no fat panels

```bash
npm install
npm run electron:dev
```

## Architecture

```
Sidebar (icons) │ Tab bar
                │ Toolbar (nav + address)
                │────────────────────────
                │ WebView  (~95%)
                │   nova://… → internal React pages
                │   http(s)  → Electron BrowserView (Chromium)
```

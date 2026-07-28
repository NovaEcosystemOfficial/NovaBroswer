# NovaBrowser — Design Philosophy v1.0

**Absolute priority over all sprints.**

## Identity

NovaBrowser is **not** a desktop application.  
NovaBrowser is a **professional web browser**.

The user must not feel they are using a React dashboard.  
The user must feel they are using a modern, elegant, very fast browser.

**Browser first. Nova Ecosystem second.**

Same pattern as:

| Product | First | Second |
|---------|-------|--------|
| Chrome | Browser | Google |
| Edge | Browser | Microsoft |
| Brave | Browser | Brave Services |
| Arc | Browser | Workspace |
| **NovaBrowser** | **Browser** | **Nova Ecosystem** |

## Fundamental rule

The web page is always the protagonist.  
Browser UI should nearly disappear.  
Web content should occupy ~**95%** of the window.  
Every UI element needs a real navigation reason — otherwise remove it.

## Architecture hierarchy

1. Chromium / WebView  
2. Tabs  
3. Address Bar  
4. Navigation  
5. Browser Features  
6. Nova Features  

Never the reverse.

## Home

Home is **not** a dashboard. Home is a **New Tab** (Chrome / Edge / Brave / Arc).

Only:

- NovaBrowser logo  
- Search bar  
- Favorites  
- Recents  
- Workspace  
- Quick access to Nova services  

No large panels. No dashboard. No invasive widgets.

## Internal pages

All Nova features live as internal browser pages via `nova://`:

`newtab` · `home` · `history` · `downloads` · `settings` · `bookmarks` · `workspace` · `cloud` · `docs` · `ai`

They behave like normal tabs — never windows, never apps.

## Permanent layout

Tabs · Toolbar · Address Bar · Navigation Buttons · Collapsible sidebar · WebView area.  
Nothing more.

### Sidebar

Discrete, collapsible, icons only, expand on hover. Never the protagonist. Never wide.

### Toolbar

Back · Forward · Refresh · Address Bar · New Tab · Profile · Ryuk. Stop.

## Visual philosophy

The user should forget Electron and React and see a **native browser**: speed, elegance, fluidity, precision, simplicity.

## Ryuk

Ryuk is not the start page. It accompanies navigation and appears when needed. Part of the browser — does not replace it.

## Goal

Opening NovaBrowser should feel like: *“This looks like a professional browser.”*  
Never: *“This looks like an app with a browser inside.”*

# Safari Reels Blocker — Handoff

## Goal
Build a Safari Web Extension (macOS-first, iOS/iPadOS-compatible) that hides Reels on Instagram and Shorts on YouTube. No login interception, no data collection — pure CSS/JS injection into the existing Safari session.

## Chosen Approach
**Safari Web Extension** — injects CSS/JS into Instagram and YouTube pages loaded normally in Safari. Works with your existing logged-in session. Same codebase can be extended to iOS 15+ Safari with minimal changes.

## Project Scaffold

Create via Xcode:
```
File > New > Project > Safari Extension App
```
- Platform: macOS (add iOS target later)
- Language: Swift (wrapper) + JS (extension logic)
- Bundle ID: e.g. `com.yourname.reelsblocker`

### Key files you'll edit:
```
ReelsBlocker/
├── ReelsBlocker Extension/
│   ├── manifest.json          ← permissions + content script config
│   ├── content.js             ← main injection logic
│   ├── content.css            ← CSS hiding rules (faster than JS for static elements)
│   └── background.js          ← (optional) for future dynamic updates
└── ReelsBlocker/
    └── ViewController.swift   ← just shows "extension enabled" UI, mostly boilerplate
```

## manifest.json (MV3)

```json
{
  "manifest_version": 3,
  "name": "Reels Blocker",
  "version": "1.0",
  "content_scripts": [
    {
      "matches": ["*://*.instagram.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    },
    {
      "matches": ["*://*.youtube.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "permissions": ["activeTab"]
}
```

## Strategy: CSS first, MutationObserver second

Instagram and YouTube are SPAs — content loads dynamically after the initial page. Two-layer approach:

1. **CSS `content.css`** — hides known static selectors instantly, no flash
2. **`content.js` MutationObserver** — watches for dynamically injected elements and hides them as they appear

```js
// content.js skeleton
const SELECTORS = {
  instagram: [
    // Reels nav tab
    'a[href="/reels/"]',
    // Reels in feed — find via DevTools (see below)
    // '[class*="Reels"]',  // fragile, use aria or href patterns
  ],
  youtube: [
    'ytd-reel-shelf-renderer',         // Shorts shelf on homepage
    'ytd-rich-section-renderer',       // another Shorts container
    'a[href^="/shorts"]',              // Shorts links in sidebar/suggestions
    '#shortsLockupViewModelHostHomeFeature', // Shorts tab
  ]
};

function hideElements(selectors) {
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.display = 'none';
    });
  });
}

function getSelectors() {
  if (location.hostname.includes('instagram.com')) return SELECTORS.instagram;
  if (location.hostname.includes('youtube.com')) return SELECTORS.youtube;
  return [];
}

const selectors = getSelectors();

// Run once on load
hideElements(selectors);

// Watch for dynamic content
const observer = new MutationObserver(() => hideElements(selectors));
observer.observe(document.body, { childList: true, subtree: true });
```

## Selector Hunting (do this before writing extension)

### YouTube (easier — more stable selectors)
Open YouTube in Safari > Develop > Show Web Inspector > Elements tab. Known working selectors as of early 2026:
- `ytd-reel-shelf-renderer` — Shorts shelf on home feed
- `a[href^="/shorts"]` — any link to a Short
- `[title="Shorts"]` — sidebar nav item

### Instagram (harder — obfuscated class names)
Instagram uses hashed classnames that change frequently. Better strategies:
- Target by **aria labels**: `[aria-label="Reels"]`
- Target by **href**: `a[href="/reels/"]`
- Target by **SVG path** (the reels icon) — fragile but works
- In feed: look for the video reel container via role or data attributes

Inspect in Safari DevTools: open instagram.com > navigate to Reels tab > right-click element > Inspect. Note the `aria-label`, `role`, `href`, and any stable `data-*` attributes. Avoid `class` selectors with hashed names.

## What to Build First (suggested order)

1. [ ] Create Xcode project from Safari Extension template
2. [ ] Verify boilerplate builds and loads in Safari (enable in Safari > Settings > Extensions)
3. [ ] Add YouTube selectors to `content.css` — validate Shorts shelf disappears
4. [ ] Add MutationObserver in `content.js` for YouTube SPA navigation
5. [ ] Hunt Instagram selectors in DevTools, add + validate
6. [ ] Test navigation between pages (SPA routing breaks static injection)
7. [ ] (Later) Add iOS target in Xcode, test on device

## Known Challenges

| Challenge | Notes |
|---|---|
| Instagram DOM obfuscation | Use aria/href/role selectors, not classnames |
| SPA navigation | MutationObserver handles this, but may need `popstate` listener too |
| Selector rot | Instagram/YouTube update DOM periodically — expect occasional maintenance |
| Instagram login flags | Not an issue here — user logs in normally via Safari |

## iOS Extension (later)

Once macOS works:
- Xcode > Add Target > iOS App with Safari Extension
- Share the same `manifest.json`, `content.js`, `content.css`
- Enable in iOS Settings > Safari > Extensions
- No code changes needed for basic functionality

## References
- [Apple: Building a Safari Web Extension](https://developer.apple.com/documentation/safariservices/safari_web_extensions/building_a_safari_web_extension)
- [Converting existing extension to Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- MDN: MutationObserver, content scripts, MV3

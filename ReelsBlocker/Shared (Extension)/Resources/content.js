const SELECTORS = {
    youtube: [
        'ytd-reel-shelf-renderer',
        'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
        '#shortsLockupViewModelHostHomeFeature',
        'ytd-guide-entry-renderer:has(a[title="Shorts"])',
        'ytd-mini-guide-entry-renderer:has(a[title="Shorts"])',
        'a[href^="/shorts"]',
        'ytd-reel-item-renderer',
        'ytd-shorts',
    ],
    instagram: [
        'a[href="/reels/"]',
        '[aria-label="Reels"]',
    ],
};

const HOST = location.hostname;
const selectors =
    HOST.includes('youtube.com') ? SELECTORS.youtube :
    HOST.includes('instagram.com') ? SELECTORS.instagram : [];

if (!selectors.length) throw new Error('no-op');

let enabled = true; // optimistic default — updated from storage below

function hideElements() {
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        } catch (_) {}
    });
}

function showElements() {
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => {
                el.style.removeProperty('display');
            });
        } catch (_) {}
    });
}

function applyState() {
    enabled ? hideElements() : showElements();
}

// Load stored state then apply
browser.storage.local.get('enabled').then(result => {
    enabled = result.enabled !== false;
    applyState();
});

// Respond to popup toggle instantly
browser.storage.onChanged.addListener((changes) => {
    if ('enabled' in changes) {
        enabled = changes.enabled.newValue !== false;
        applyState();
    }
});

// Keep hiding as SPA loads new content
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        applyState();
    } else if (enabled) {
        hideElements();
    }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

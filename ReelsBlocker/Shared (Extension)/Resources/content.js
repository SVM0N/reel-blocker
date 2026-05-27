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

function getSelectors() {
    if (location.hostname.includes('youtube.com')) return SELECTORS.youtube;
    if (location.hostname.includes('instagram.com')) return SELECTORS.instagram;
    return [];
}

function hideElements(selectors) {
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        } catch (_) {}
    });
}

function showElements(selectors) {
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => {
                el.style.removeProperty('display');
            });
        } catch (_) {}
    });
}

const selectors = getSelectors();
if (selectors.length === 0) return;

// Run based on stored state (default: enabled)
browser.storage.local.get('enabled').then(result => {
    if (result.enabled !== false) hideElements(selectors);
});

// React to toggle changes without reloading the page
browser.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
        changes.enabled.newValue ? hideElements(selectors) : showElements(selectors);
    }
});

// Watch for dynamic content
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        browser.storage.local.get('enabled').then(result => {
            if (result.enabled !== false) hideElements(selectors);
        });
    } else {
        browser.storage.local.get('enabled').then(result => {
            if (result.enabled !== false) hideElements(selectors);
        });
    }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

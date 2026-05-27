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
        } catch (_) {
            // ignore invalid selectors at runtime (e.g. :has() on older engines)
        }
    });
}

const selectors = getSelectors();
if (selectors.length === 0) return;

hideElements(selectors);

// Re-run on SPA navigation (YouTube / Instagram both use pushState)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        hideElements(selectors);
    }
    hideElements(selectors);
});

observer.observe(document.documentElement, { childList: true, subtree: true });

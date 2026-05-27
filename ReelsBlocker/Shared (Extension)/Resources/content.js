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
    instagram_reels: [
        'a[href="/reels/"]',
        '[aria-label="Reels"]',
    ],
    instagram_explore: [
        'a[href="/explore/"]',
        '[aria-label="Explore"]',
    ],
};

const HOST = location.hostname;
const isYouTube = HOST.includes('youtube.com');
const isInstagram = HOST.includes('instagram.com');

if (!isYouTube && !isInstagram) throw new Error('no-op');

let state = { enabled: true, blockExplore: false };

function setVisible(selectors, visible) {
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => {
                visible
                    ? el.style.removeProperty('display')
                    : el.style.setProperty('display', 'none', 'important');
            });
        } catch (_) {}
    });
}

function applyState() {
    if (isYouTube) {
        setVisible(SELECTORS.youtube, !state.enabled);
    }
    if (isInstagram) {
        setVisible(SELECTORS.instagram_reels, !state.enabled);
        setVisible(SELECTORS.instagram_explore, !state.blockExplore);
    }
}

browser.storage.local.get(['enabled', 'blockExplore']).then(result => {
    state.enabled = result.enabled !== false;
    state.blockExplore = result.blockExplore === true;
    applyState();
});

browser.storage.onChanged.addListener((changes) => {
    if ('enabled' in changes) state.enabled = changes.enabled.newValue !== false;
    if ('blockExplore' in changes) state.blockExplore = changes.blockExplore.newValue === true;
    applyState();
});

let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        applyState();
    } else {
        applyState();
    }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

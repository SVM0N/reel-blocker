const HOST = location.hostname;
if (!HOST.includes('youtube.com') && !HOST.includes('instagram.com')) return;

const CLASS = 'reels-blocker-active';

function applyState(enabled) {
    if (enabled) {
        document.documentElement.classList.add(CLASS);
    } else {
        document.documentElement.classList.remove(CLASS);
    }
}

// Apply on load (default: enabled)
browser.storage.local.get('enabled').then(result => {
    applyState(result.enabled !== false);
});

// React to toggle instantly without page reload
browser.storage.onChanged.addListener((changes) => {
    if ('enabled' in changes) {
        applyState(changes.enabled.newValue !== false);
    }
});

const reelsToggle = document.getElementById('toggle-reels');
const exploreToggle = document.getElementById('toggle-explore');

browser.storage.local.get(['enabled', 'blockExplore']).then(result => {
    reelsToggle.checked = result.enabled !== false;
    exploreToggle.checked = result.blockExplore === true;
});

reelsToggle.addEventListener('change', () => {
    browser.storage.local.set({ enabled: reelsToggle.checked });
});

exploreToggle.addEventListener('change', () => {
    browser.storage.local.set({ blockExplore: exploreToggle.checked });
});

const toggle = document.getElementById('toggle');
const status = document.getElementById('status');

browser.storage.local.get('enabled').then(result => {
    const enabled = result.enabled !== false; // default on
    toggle.checked = enabled;
    updateStatus(enabled);
});

toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    browser.storage.local.set({ enabled });
    updateStatus(enabled);
});

function updateStatus(enabled) {
    status.textContent = enabled
        ? 'Active on Instagram & YouTube'
        : 'Paused';
}

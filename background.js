// Define default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  enableHighlighting: false,
  highlightColor: "yellow",
  websites: [],
  blacklist: [],
};

// Load settings from storage
function loadSettings() {
  return browser.storage.local.get(DEFAULT_SETTINGS);
}

// Save settings to storage
function saveSettings(settings) {
  return browser.storage.local.set(settings);
}

// When the extension is installed or updated, set default settings
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    saveSettings(DEFAULT_SETTINGS);
  }
});

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
  return chrome.storage.local.get(DEFAULT_SETTINGS);
}

// Save settings to storage
function saveSettings(settings) {
  return chrome.storage.local.set(settings);
}

// When the extension is installed or updated, set default settings
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    saveSettings(DEFAULT_SETTINGS);
  }
});

//When the extension starts up, load the settings and set up the popup
browser.runtime.onStartup.addListener(() => {
  chrome.browserAction.setIcon({ path: "/active.png" });
  loadSettings().then((settings) => {
    const includesWebsite = settings.websites.includes(url);
    //Get the host name
    const url = new URL(tab.url);
    const hostname = url.hostname;
    const includesPage = settings.websites.includes(hostname);
    const pageBlacklist = settings.blacklist.includes(hostname);

    chrome.browserAction.setIcon({ path: "/active.png" });
  });
});

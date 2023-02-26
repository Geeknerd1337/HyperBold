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
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    saveSettings(DEFAULT_SETTINGS);
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tab.active) {
    loadSettings().then((settings) => {
      if (!tab.url) {
        return;
      }
      console.log(tab);
      const url = new URL(tab.url);
      const includesWebsite = settings.websites.includes(url.href);
      const hostname = url.hostname;
      const includesPage = settings.websites.includes(hostname);
      const pageBlacklist = settings.blacklist.includes(hostname);
      const enabled = settings.enabled;

      console.log("Ham");
      console.log(settings);
      console.log(url);
      console.log(url.href);

      console.log(enabled, includesWebsite, pageBlacklist);

      if (enabled && includesWebsite && !pageBlacklist) {
        chrome.action.setIcon({ path: "/active.png" });
      } else {
        chrome.action.setIcon({ path: "/inactive.png" });
      }
    });
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tab.active) {
      loadSettings().then((settings) => {
        //Ensure the url is valid
        if (!tab.url) {
          return;
        }
        console.log(tab);
        const url = new URL(tab.url);
        const includesWebsite = settings.websites.includes(url.href);
        const hostname = url.hostname;
        const includesPage = settings.websites.includes(hostname);
        const pageBlacklist = settings.blacklist.includes(hostname);
        const enabled = settings.enabled;

        if (enabled && includesWebsite && !pageBlacklist) {
          chrome.action.setIcon({ path: "/active.png" });
        } else {
          chrome.action.setIcon({ path: "/inactive.png" });
        }
      });
    }
  });
});

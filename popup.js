const DEFAULT_SETTINGS = {
  enabled: true,
  enableHighlighting: false,
  highlightColor: "yellow",
  websites: [],
};

let mySettings = DEFAULT_SETTINGS;

window.onload = function () {
  loadSettings();
  const form = document.querySelector("#settings-form");
  const sitesControl = document.getElementById("site-switch");
  const siteLabel = document.getElementById("site-label");
  const pageControl = document.getElementById("page-switch");
  const pageLabel = document.getElementById("page-label");

  const enableHighlightingCheckbox = document.getElementById(
    "enable-highlighting"
  );
  const highlightColorSelect = document.getElementById("highlight-color");
  const enabled = document.getElementById("enabled");

  console.log("hmm");
  console.log(form);

  //When the site switched is changed, if it's true, add the current site to the list of websites, if it's false, remove it
  sitesControl.addEventListener("change", (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Extract the hostname from the URL of the tab
      var url = tabs[0].url;
      var hostname = new URL(url).hostname;

      if (event.target.checked) {
        mySettings.websites.push(hostname);
      } else {
        mySettings.websites = mySettings.websites.filter(
          (site) => site !== hostname
        );
      }
      saveSettings(mySettings);
    });
  });

  //When the page switched is changed, if it's true, enable the extension for the current page, if it's false, disable it
  pageControl.addEventListener("change", (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Extract the hostname from the URL of the tab
      var url = tabs[0].url;
      var hostname = new URL(url).hostname;

      if (event.target.checked) {
        mySettings.websites.push(url);
      } else {
        mySettings.websites = mySettings.websites.filter(
          (site) => site !== url
        );
      }
      saveSettings(mySettings);
    });
  });

  //When the settings form is submitted, save the settings
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveSettings({
      enabled: enabled.checked,
      enableHighlighting: enableHighlightingCheckbox.checked,
      highlightColor: highlightColorSelect.value,
    });
  });
};

//Handle the loading of settings from storage
function loadSettings() {
  return chrome.storage.local.get(DEFAULT_SETTINGS, function (settings) {
    //Set the checkbox to the correct value
    document.getElementById("enabled").checked = settings.enabled;
    document.getElementById("enable-highlighting").checked =
      settings.enableHighlighting;
    document.getElementById("highlight-color").value = settings.highlightColor;
    mySettings = settings;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Extract the hostname from the URL of the tab
      var url = tabs[0].url;
      var hostname = new URL(url).hostname;

      const isSiteEnabled = mySettings.websites.includes(hostname);
      const isPageEnabled = mySettings.websites.includes(url);

      document.getElementById("site-switch").checked = isSiteEnabled;
      document.getElementById("site-label").innerText = hostname;

      //Set the checkbox to the correct value
      document.getElementById("page-switch").checked = isPageEnabled;
      //Everything from the end of the host name to the end of the url
      document.getElementById("page-label").innerText = url
        .substring(url.indexOf(hostname) + hostname.length)
        .substring(0, 25)
        .concat("...");

      // Use the hostname in your extension popup
      console.log("Current hostname: " + hostname);
    });
    //Get whether the base url of this site is in the list of websites
  });
}

//Handle the saving of settings
function saveSettings(settings) {
  chrome.storage.local.set(settings, function () {
    console.log("Settings saved");
  });
}

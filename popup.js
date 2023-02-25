const DEFAULT_SETTINGS = {
  enabled: true,
  enableHighlighting: false,
  highlightColor: "yellow",
  websites: [],
  blacklist: [],
};

let mySettings = DEFAULT_SETTINGS;

window.onload = function () {
  loadSettings();
  const form = document.querySelector("#settings-form");
  const sitesControl = document.getElementById("site-switch");
  const siteLabel = document.getElementById("site-label");
  const pageControl = document.getElementById("page-switch");
  const pageLabel = document.getElementById("page-label");
  const enabledControl = document.getElementById("enabled");
  const submitButton = document.getElementById("submitButton");

  function toggleSubmitActive() {
    submitButton.classList.remove("disabled");
  }

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
        //remove it from the blacklist if it's there
        mySettings.blacklist = mySettings.blacklist.filter(
          (site) => site !== hostname
        );

        if (mySettings.websites.includes(url)) {
          pageControl.checked = true;
        }
      } else {
        mySettings.websites = mySettings.websites.filter(
          (site) => site !== hostname
        );
        //add it to the blacklist if it's not there
        if (!mySettings.blacklist.includes(hostname)) {
          mySettings.blacklist.push(hostname);
        }
        pageControl.checked = false;
      }
      toggleSubmitActive();
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
        //remove it from the blacklist if it's there
        mySettings.blacklist = mySettings.blacklist.filter(
          (site) => site !== url
        );
      } else {
        mySettings.websites = mySettings.websites.filter(
          (site) => site !== url
        );
        //add it to the blacklist if it's not there
        if (!mySettings.blacklist.includes(url)) {
          mySettings.blacklist.push(url);
        }
      }
      toggleSubmitActive();
      saveSettings(mySettings);
    });
  });

  //When the enabled checkbox is changed, if it's true, enable the extension, if it's false, disable it
  enabledControl.addEventListener("change", (event) => {
    if (event.target.checked) {
      mySettings.enabled = true;
    } else {
      mySettings.enabled = false;
    }
    toggleSubmitActive();
    saveSettings(mySettings);
  });

  //When the enable highlighting checkbox is changed, if it's true, enable highlighting, if it's false, disable it
  enableHighlightingCheckbox.addEventListener("change", (event) => {
    if (event.target.checked) {
      mySettings.enableHighlighting = true;
      if (
        enabledControl.checked &&
        sitesControl.checked &&
        pageControl.checked
      ) {
        submitButton.classList.remove("disabled");
      }
    } else {
      mySettings.enableHighlighting = false;
      submitButton.classList.add("disabled");
    }

    saveSettings(mySettings);
  });

  highlightColorSelect.addEventListener("change", (event) => {
    mySettings.highlightColor = event.target.value;
    toggleSubmitActive();
    saveSettings(mySettings);
  });

  //When the settings form is submitted, save the settings
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    //Refresh the page
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
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
    submitButton.classList.add("disabled");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Extract the hostname from the URL of the tab
      var url = tabs[0].url;
      var hostname = new URL(url).hostname;

      let isSiteEnabled = mySettings.websites.includes(hostname);
      let isPageEnabled =
        mySettings.websites.includes(url) &&
        !mySettings.blacklist.includes(hostname);

      //If the site doesn't exist in mySettings.websites and it doesn't exist in the blacklist, add it to the websites
      if (
        !isSiteEnabled &&
        !mySettings.blacklist.includes(hostname) &&
        !mySettings.websites.includes(hostname)
      ) {
        mySettings.websites.push(hostname);
        isSiteEnabled = true;
        saveSettings(mySettings);
      }

      //Do the same with the page
      if (
        !isPageEnabled &&
        !mySettings.blacklist.includes(url) &&
        !mySettings.websites.includes(url)
      ) {
        mySettings.websites.push(url);
        isPageEnabled = true;
        saveSettings(mySettings);
      }

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

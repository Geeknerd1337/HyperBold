const DEFAULT_SETTINGS = {
  enabled: true,
  enableHighlighting: false,
  highlightColor: "yellow",
};

window.onload = function () {
  loadSettings();
  const form = document.querySelector("#settings-form");
  const enableHighlightingCheckbox = document.getElementById(
    "enable-highlighting"
  );
  const highlightColorSelect = document.getElementById("highlight-color");
  const enabled = document.getElementById("enabled");

  console.log("hmm");
  console.log(form);

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
  });
}

//Handle the saving of settings
function saveSettings(settings) {
  chrome.storage.local.set(settings, function () {
    console.log("Settings saved");
  });
}

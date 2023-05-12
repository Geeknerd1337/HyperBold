const DEFAULT_SETTINGS = {
  enabled: true,
  enableHighlighting: false,
  highlightColor: "yellow",
  websites: [],
  blacklist: [],
};

let settings;

function loadSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(DEFAULT_SETTINGS, function (settings) {
      resolve(settings);
    });
  });
}

function saveSettings(settings) {
  return chrome.storage.local.set(settings);
}

async function runExtension() {
  try {
    settings = await loadSettings();

    function ableToHighlight() {
      // Extract the hostname from the URL of the tab
      var url = window.location.href;
      var hostname = new URL(url).hostname;
      //Log if settings is undefined
      let isSiteEnabled = settings.websites.includes(hostname);
      let isPageEnabled = settings.websites.includes(url);

      if (!settings.websites.includes(hostname) &&  !settings.blacklist.includes(hostname)) {
        isSiteEnabled = true;
        settings.websites.push(hostname);
        saveSettings(settings);
      }
      if (!settings.websites.includes(url) &&  !settings.blacklist.includes(url)) {
        settings.websites.push(url);
        isPageEnabled = true;
        saveSettings(settings);
      }

      return isSiteEnabled && isPageEnabled;
    }

    function boldFirstHalfOfWords(element) {
      const highlightTag = false ? "null" : "null";

      let ret = "";
      // Loop through all child nodes of the element
      for (let i = 0; i < element.childNodes.length; i++) {
        const childNode = element.childNodes[i];
        // If the node is a text node, process its content
        if (childNode.nodeType === Node.TEXT_NODE) {
          //If the element is just a space, skip it
          if (childNode.textContent === " ") {
            continue;
          }
          //If it's an empty string, skip it
          if (childNode.textContent === "") {
            continue;
          }

          if (childNode === undefined) {
            continue;
          }

          //If the text content is undefined, skip it
          if (childNode.textContent === undefined) {
            continue;
          }
          //Print the node

          const words = childNode.textContent.split(/(\s+)/);
          // Loop through all the words in the text node
          for (let j = 0; j < words.length; j++) {
            const word = words[j];
            // Check if the word is a link, image, svg or iframe element
            if (
              word.includes("<a") ||
              word.includes("<img") ||
              word.includes("<svg") ||
              word.includes("<iframe")
            ) {
              continue;
            }
            //If the word is just a space skip it
            if (word === " ") {
              continue;
            }

            const length = Math.ceil(word.length / 2);

            if (length === 0) {
              continue;
            }

            const firstHalf = word.slice(0, length);
            const secondHalf = word.slice(length);

            let color = settings.highlightColor;
            color = window
              .getComputedStyle(element, null)
              .getPropertyValue("color");
            color = color.replace("rgb(", "").replace(")", "");
            color = color.split(",");
            let text = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            color = settings.highlightColor;

            //If color === "Compliement", get the color of the text, and then get the compliment of that color
            if (color === "compliment") {
              color = window
                .getComputedStyle(element, null)
                .getPropertyValue("color");
              color = color.replace("rgb(", "").replace(")", "");
              color = color.split(",");

              //Darken the color
              const contrastingColorObj = [
                color[0] + 100,
                color[1] + 100,
                color[2] + 100,
              ];

              const complementaryColorObj = [
                255 - contrastingColorObj[0],
                255 - contrastingColorObj[1],
                255 - contrastingColorObj[2],
              ];

              // convert the color objects back to RGB values
              const complementaryColor = complementaryColorObj;
              const contrastingColor = contrastingColorObj;

              text = `rgb(${contrastingColor[0]}, ${contrastingColor[1]}, ${contrastingColor[2]})`;

              color = `rgb(${complementaryColor[0]}, ${complementaryColor[1]}, ${complementaryColor[2]})`;
            }

            ret = `<${highlightTag} data-modified="true" 
            ${
              settings.enableHighlighting
                ? `style="background-color:${color};color:${text};"`
                : `style="font-weight:700;"`
            } >${firstHalf}</${highlightTag}>${secondHalf}`;

            //If the length of the word is 3 then just bold the first letter
            if (word.length === 3) {
              ret = `<${highlightTag} data-modified="true" ${
                settings.enableHighlighting
                  ? `style="background-color:${color};color:${text};"`
                  : `style="font-weight:700;"`
              }>${word[0]}</${highlightTag}>${word.slice(1)}`;
            }

            // Replace the original word with the bolded word in the text content
            words[j] = ret;
          }
          // Join the modified words back into a single string
          const newTextNode = document.createElement(null);
          newTextNode.innerHTML = words.join("");

          newTextNode.setAttribute("data-modified", "true");
          element.setAttribute("data-modified", "true");

          // Replace the original text node with the new element
          element.replaceChild(newTextNode, childNode);
        } else if (childNode.nodeType === Node.ELEMENT_NODE) {
          // If the node is an element node, recursively process its children
          boldFirstHalfOfWords(childNode);
        }
      }
    }

    function highlightFirstSyllable() {
      // Select all <p> elements on the page
      const paragraphs = document.getElementsByTagName("p");
      //List elements
      const lists = document.getElementsByTagName("li");
      //Spans
      const spans = document.getElementsByTagName("span");

      if (!ableToHighlight()) {
        return;
      }

      if (!settings.enabled) {
        return;
      }

      //Add elements to alltext
      const allText = [...paragraphs, ...lists, ...spans]
        .filter((element) => {
          return element.offsetParent !== null;
        })
        .filter((element) => {
          //Remove all spans that have <i> as its only child
          if (element.tagName === "SPAN") {
            //If the current site is reddit, then don't do anything
            //THis is so hacky but reddit will not function with span tags for some reason
            const isReddit = currentURL.includes("reddit.com");
            if (isReddit) {
              return false;
            }
          }
          return true;
        });

      const s = settings;

      //Set the checkbox to the correct value

      settings.enabled = s.enabled;
      settings.enableHighlighting = s.enableHighlighting;
      settings.highlightColor = s.highlightColor;

      if (!settings.enabled) {
        return;
      }

      // Iterate over each <p> element
      for (const text of allText) {
        boldFirstHalfOfWords(text);
      }
    }

    const currentURL = window.location.href;

    // Select the node that will be observed for changes
    const targetNode = document.body;

    // Create an observer instance
    const observer = new MutationObserver((mutationsList) => {
      if (!ableToHighlight()) {
        return;
      }

      if (!settings.enabled) {
        return;
      }
      const currentURL = window.location.href;
      let processedNodes = new Set();

      //Get all the elements from the mutation list that don't have the 'data-mofified' attribute
      const elements = mutationsList
        .filter((mutation) => {
          return mutation.type === "childList";
        })
        .map((mutation) => {
          //Get any paragraph elements in the target
          const paragraphs = mutation.target.getElementsByTagName("p");
          const lists = mutation.target.getElementsByTagName("li");

          const spans = mutation.target.getElementsByTagName("span");

          const allText = [...paragraphs, ...lists, ...spans]
            .filter((element) => {
              return element.offsetParent !== null;
            })
            .filter((element) => {
              //Filter elements that have no innter text
              return element.innerText.length > 0;
            });

          return allText.flat();
        })
        .flat()
        .filter((element) => {
          //Remove all spans that have <i> as its only child
          if (element.tagName === "SPAN") {
            //If the current site is reddit, then don't do anything
            //THis is so hacky but reddit will not function with span tags for some reason
            const isReddit = currentURL.includes("reddit.com");
            if (isReddit) {
              return false;
            }
          }
          return true;
        })
        .filter((element) => {
          if (element !== undefined) {
            const isModified = element.getAttribute("data-modified") === "true";
            if (!isModified && !processedNodes.has(element)) {
              processedNodes.add(element);
              element.setAttribute("data-modified", "true");
              return true;
            }
            return false;
          }
        });

      //If there are no elements, then return
      if (elements.length === 0) {
        return;
      }

      // Iterate over each <p> element
      for (const element of elements) {
        boldFirstHalfOfWords(element);
      }
    });

    // Start observing the target node for configured mutations
    observer.observe(targetNode, { childList: true, subtree: true });

    document.body.addEventListener("load", () => {
      highlightFirstSyllable();
    });

    document.addEventListener("DOMContentLoaded", highlightFirstSyllable());
  } catch (e) {
    console.log(e);
  }
}

//Call run extensions
runExtension();

let popupDiv: HTMLDivElement | null = null;
let popupTimeout: number | undefined;

let popupWindowOn = false;
let wordLimit = 50; // Maximum length of text to be processed
let highlightMenuTimeOut = 7500; // Time in milliseconds to show the highlight menu

// function toggleOnShortcut(event: KeyboardEvent) {
//   // Control + B toggles popup-up window
//   if (event.ctrlKey && event.key === 'b') {
//     popupWindowOn = !popupWindowOn;

//   }
// }


chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log(`Changes detected in the "${namespace}" storage area.`);
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

    if (key === "highlightEnabled") {
      if (newValue === true) {
        popupWindowOn = true
      } else {
        popupWindowOn = false
      }
    }
  }
});






// Attach the listener
// window.addEventListener('keydown', toggleOnShortcut);


document.addEventListener('DOMContentLoaded', () => {
  console.log("hello");
});


function truncateText(input: string, wordLimit: number = 50): string {
  if (wordLimit <= 0) {
    wordLimit = 50; // Default to 50 if invalid limit is provided
  }

  const words = input.split(/\s+/);

  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  } else {
    return input;
  }
}

document.addEventListener("mouseup", (event: MouseEvent) => {
  let selectedText: string = window.getSelection()?.toString().trim() || "";

  if (popupDiv && event.target instanceof Node && popupDiv.contains(event.target)) {
    return;
  }

  // Clear previous popup and timeout
  if (popupDiv) {
    popupDiv.remove();
    popupDiv = null;
    if (popupTimeout) {
      clearTimeout(popupTimeout);
    }
  }

  if (selectedText.length > 0 && popupWindowOn) {
    selectedText = truncateText(selectedText, wordLimit);
    // Create popup using classes instead of inline styles
    popupDiv = document.createElement("div");
    popupDiv.className = "popup";
    popupDiv.style.top = `${event.pageY + 10}px`;
    popupDiv.style.left = `${event.pageX + 10}px`;

    // // Create text box
    // const textBox = document.createElement("div");
    // textBox.className = "text-box";
    // textBox.textContent = selectedText;
    // popupDiv.appendChild(textBox);

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    function createButton(label: string, onClick: () => void): HTMLButtonElement {
      const button = document.createElement("button");
      button.className = "action-button";
      button.textContent = label;

      button.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        if (popupTimeout) {
          clearTimeout(popupTimeout);
        }
        onClick();
      });

      return button;
    }

    
    // Create dropdown menu
    function createDropdown(options: string[], onSelect: (option: string) => void): HTMLDivElement {
      const dropdown = document.createElement("div");
      dropdown.className = "dropdown-menu";

      options.forEach(option => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = option;
        item.addEventListener("click", (e: MouseEvent) => {
          e.stopPropagation();
          onSelect(option);
          dropdown.remove(); // Close dropdown after selection
        });
        dropdown.appendChild(item);
      });

      return dropdown;
    }

    // Search button logic
    const searchButton = createButton("Search", () => {
      // Check if dropdown already exists and remove it
      const existingDropdown = document.querySelector(".dropdown-menu");
      if (existingDropdown) {
        existingDropdown.remove();
        return;
      }

      const dropdown = createDropdown(["GitHub", "StackOverflow"], (selection) => {
        if (selection === "GitHub") {
          window.open(`https://github.com/search?q="${selectedText}"&type=code`, "_blank");
        } else if (selection === "StackOverflow") {
          window.open(`https://stackoverflow.com/search?q=${selectedText}`, "_blank");
        }
      });

      // Position dropdown under the button
      searchButton.insertAdjacentElement('afterend', dropdown);
    });

    const translateButton = createButton("Translate", () => {
      const popupUrl = chrome.runtime.getURL('dist/popup.html');
      const popupWindow = window.open(popupUrl, "_blank");
    
      if (popupWindow) {
        // Wait for 2 seconds (adjust as needed) before sending the message
        setTimeout(() => {
          chrome.runtime.sendMessage({
            action: "translateSelectedText",
            data: selectedText
          });
        }, 100); // 2000ms = 2 seconds

      } else {
        alert("Popup blocked! Please allow popups for this site.");
      }
    });

    const explainButton = createButton("Explain", () => {
      const popupUrl = chrome.runtime.getURL('dist/popup.html');
      const popupWindow = window.open(popupUrl, "_blank");
    
      if (popupWindow) {
        // Wait for 2 seconds (adjust as needed) before sending the message
        setTimeout(() => {
          chrome.runtime.sendMessage({
            action: "explainSelectedText",
            data: selectedText
          });
        }, 100); // 2000ms = 2 seconds

      } else {
        alert("Popup blocked! Please allow popups for this site.");
      }
    });

    buttonContainer.appendChild(searchButton);
    buttonContainer.appendChild(translateButton);
    buttonContainer.appendChild(explainButton);

    popupDiv.appendChild(buttonContainer);
    document.body.appendChild(popupDiv);

    // Start auto-close timer
    function startAutoCloseTimer() {
      if (popupTimeout) {
        clearTimeout(popupTimeout);
      }
      popupTimeout = window.setTimeout(() => {
        if (popupDiv) {
          popupDiv.remove();
          popupDiv = null;
        }
      }, highlightMenuTimeOut);
    }

    startAutoCloseTimer();

    // Pause auto-close on mouseover, resume on mouseout
    popupDiv.addEventListener("mouseenter", () => {
      if (popupTimeout) {
        clearTimeout(popupTimeout);
      }
    });

    popupDiv.addEventListener("mouseleave", () => {
      startAutoCloseTimer();
    });
  }
});

// chrome.runtime.sendMessage({
//   type: "STORE_DATA",
//   payload: {
//     selectedText: popupWindowOn
//   }
// });



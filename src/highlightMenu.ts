let popupDiv: HTMLDivElement | null = null;
let popupTimeout: number | undefined;

let popupWindowOn = true;
let wordLimit = 50; // Maximum length of text to be processed
let highlightMenuTimeOut = 7500; // Time in milliseconds to show the highlight menu

function toggleOnShortcut(event: KeyboardEvent) {
  // Control + B toggles popup-up window
  if (event.ctrlKey && event.key === 'b') {
    popupWindowOn = !popupWindowOn;
    alert(`Popup window ${popupWindowOn ? "on" : "off"}`);
  }
}

// Attach the listener
window.addEventListener('keydown', toggleOnShortcut);

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

    const searchButton = createButton("Search", () => {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, "_blank");
    });

    const translateButton = createButton("Translate", () => {
      window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(selectedText)}&op=translate`, "_blank");
    });

    const explainButton = createButton("Explain", () => {
      alert(`Explain: ${selectedText}`);
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
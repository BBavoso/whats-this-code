let popupDiv: HTMLDivElement | null = null;
let popupTimeout: number | undefined;

let popupWindowOn = true;
let wordLimit = 50; // Maximum length of text to be processed

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
  // Split the input into words based on spaces
  const words = input.split(/\s+/);

  // Check if the input has more than the wordLimit
  if (words.length > wordLimit) {
      // If it does, take the first 'wordLimit' words and join them back together
      return words.slice(0, wordLimit).join(' ') + '...';
  } else {
      // If it's shorter than the wordLimit, just return the input as it is
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

    const isDarkMode: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;

    popupDiv = document.createElement("div");
    popupDiv.style.position = "absolute";
    popupDiv.style.top = `${event.pageY + 10}px`;
    popupDiv.style.left = `${event.pageX + 10}px`;
    popupDiv.style.background = "#222";
    popupDiv.style.color = "#000";
    popupDiv.style.border = "1px solid #888";
    popupDiv.style.padding = "10px";
    popupDiv.style.borderRadius = "8px";
    popupDiv.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.3)";
    popupDiv.style.zIndex = "9999";
    popupDiv.style.maxWidth = "20%";
    popupDiv.style.fontSize = "14px";
    popupDiv.style.cursor = "default";
    popupDiv.style.wordBreak = "break-word";

    const textBox = document.createElement("div");
    textBox.style.background = "#f0f0f0"; // Force white background
    textBox.style.color = "#000"; // Force black text for readability
    textBox.style.padding = "8px";
    textBox.style.marginBottom = "10px";
    textBox.style.borderRadius = "5px";
    textBox.style.border = "1px solid #ddd";
    textBox.style.boxShadow = "0px 1px 3px rgba(0,0,0,0.2)";
    textBox.style.fontSize = "12px";
    textBox.style.fontFamily = "Helvetica, sans-serif";
    textBox.textContent = selectedText; // Add the selected text here
    popupDiv.appendChild(textBox);

    const buttonContainer: HTMLDivElement = document.createElement("div");

    buttonContainer.style.display = "flex";
    buttonContainer.style.flexWrap = "wrap"; // Allow buttons to move if too tight
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.gap = "5px";


    function createButton(label: string, onClick: () => void): HTMLButtonElement {
      const button: HTMLButtonElement = document.createElement("button");
      button.textContent = label;
      // button.style.flex = "1";
      button.style.flex = "0 0 auto"; // Don't stretch/shrink, size to content
      button.style.flexGrow = "1"; // Make each button grow to fill space
      button.style.padding = "10px"; // Adjust padding for more comfortable click area
      button.style.whiteSpace = "nowrap"; // Prevent text wrapping inside button
      button.style.padding = "5px";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.style.fontSize = "12px";
      button.style.background = "#444";
      button.style.color = "#fff";
      button.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        if (popupTimeout) {
          clearTimeout(popupTimeout); // clear auto-close
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
      }, 5000);
    }

    startAutoCloseTimer();

    // Pause auto-close on mouseover, resume on mouseout
    popupDiv.addEventListener("mouseenter", () => {
      if (popupTimeout) {
        clearTimeout(popupTimeout); // pause timer
      }
    });

    popupDiv.addEventListener("mouseleave", () => {
      startAutoCloseTimer(); // resume timer
    });
  }
});

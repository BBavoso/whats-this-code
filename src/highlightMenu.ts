let popupDiv: HTMLDivElement | null = null;
let popupTimeout: number | undefined;

let popup_window_on = true;

function toggleOnShortcut(event: KeyboardEvent) {
  // Control + B toggles popup-up window
  if (event.ctrlKey && event.key === 'b') {
    popup_window_on = !popup_window_on;
    alert(`Popup window ${popup_window_on ? "on" : "off"}`);
  }
}

// Attach the listener
window.addEventListener('keydown', toggleOnShortcut);

// Optional: Remove the listener later if needed
// window.removeEventListener('keydown', toggleOnShortcut);

document.addEventListener("mouseup", (event: MouseEvent) => {
  const selectedText: string = window.getSelection()?.toString().trim() || "";

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

  if (selectedText.length > 0 && popup_window_on) {
    const isDarkMode: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;

    popupDiv = document.createElement("div");
    popupDiv.style.position = "absolute";
    popupDiv.style.top = `${event.pageY + 10}px`;
    popupDiv.style.left = `${event.pageX + 10}px`;
    popupDiv.style.background = isDarkMode ? "#222" : "#fff";
    popupDiv.style.color = isDarkMode ? "#fff" : "#000";
    popupDiv.style.border = "1px solid #888";
    popupDiv.style.padding = "10px";
    popupDiv.style.borderRadius = "8px";
    popupDiv.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.3)";
    popupDiv.style.zIndex = "9999";
    popupDiv.style.maxWidth = "260px";
    popupDiv.style.fontSize = "14px";
    popupDiv.style.cursor = "default";
    popupDiv.style.wordBreak = "break-word";

    const textDiv: HTMLDivElement = document.createElement("div");
    textDiv.textContent = selectedText;
    textDiv.style.marginBottom = "10px";
    popupDiv.appendChild(textDiv);

    const buttonContainer: HTMLDivElement = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.gap = "5px";

    function createButton(label: string, onClick: () => void): HTMLButtonElement {
      const button: HTMLButtonElement = document.createElement("button");
      button.textContent = label;
      button.style.flex = "1";
      button.style.padding = "5px";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.style.fontSize = "12px";
      button.style.background = isDarkMode ? "#444" : "#eee";
      button.style.color = isDarkMode ? "#fff" : "#000";
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

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id !== undefined) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // This runs inside the page
          return window.getSelection()?.toString() || "";
        }
      }, (injectionResults) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        const selectedText = injectionResults[0]?.result || "";
        const inputArea = document.getElementById("input-area") as HTMLTextAreaElement
        if (inputArea) {
          inputArea.value = selectedText;
        }
      });
    }
  });
});

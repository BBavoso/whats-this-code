
chrome.runtime.onMessage.addListener(
    (message: { action: string }, sender, sendResponse) => {
        if (message.action === "getSelectedText") {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString() : "";

            sendResponse({ selectedText });
        }

        // Needed because we send response asynchronously
        return true;
    }
);
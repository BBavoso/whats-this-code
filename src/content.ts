chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setText") {
        const input = document.getElementById("input_area") as HTMLTextAreaElement;
        if (input) {
            input.value = message.text;
        }
    }
});
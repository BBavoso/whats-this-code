chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.popupOpened) {
    console.log("This is from background.js!");

    // You can send data back
    sendResponse({ info: "Here's some info from background!" });
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.popupOpened) {
    console.log("This is from background.js!");

    // You can send data back
    sendResponse({ info: "Here's some info from background!" });
  }
});

const CONTEXT_MENUS = [
  {
    id: 'searchGithub',
    title: 'Search GitHub for "%s"',
    url: (query: string) => `https://github.com/search?q=${query}&type=code`,
  },
  {
    id: 'searchStackOverflow',
    title: 'Search StackOverflow for "%s"',
    url: (query: string) => `https://stackoverflow.com/search?q=${query}`,
  },
];


chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');

  CONTEXT_MENUS.forEach((menu) => {
    chrome.contextMenus.create({
      id: menu.id,
      title: menu.title,
      contexts: ["selection"]
    })
  });
  chrome.storage.local.set({ highlightEnabled: false }).then(() => { });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {

  const clickedMenu = CONTEXT_MENUS.find((menu) => menu.id === info.menuItemId);
  if (clickedMenu && info.selectionText) {
    const query = encodeURIComponent(info.selectionText);
    const url = clickedMenu.url(query);

    chrome.tabs.create({ url }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to open tab:', chrome.runtime.lastError.message);
      }
    });
  }
});

var cachedData = ""; // store whatever the content script sends

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "STORE_DATA") {
    cachedData = message.payload;
    console.log('Data stored in background:', cachedData);
  }

  if (message.type === "GET_DATA") {
    sendResponse(cachedData);
  }

  return true; // Needed if you want to send a response asynchronously
});
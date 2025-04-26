const CONTEXT_MENUS = [
  {
    id: 'searchGithub',
    title: 'Search GitHub for "%s"',
    url: (query: string) => `https://github.com/search?q=${query}&type=code`,
  },
  {
    id: 'searchStackOverflow',
    title: 'Search StackOverflow for "%s"',
    url: (query: string ) => `https://stackoverflow.com/search?q=${query}`,
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

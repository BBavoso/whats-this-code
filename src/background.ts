chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');

  chrome.contextMenus.create({
    id: 'searchGithub',
    title: 'Search GitHub for "%s"', // %s is replaced with highlighted text
    contexts: ['selection'], // Only show when user selects text
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchGithub' && info.selectionText) {
    const query = encodeURIComponent(info.selectionText); // URL encode the selection text
    const githubSearchUrl = `https://github.com/search?q=${query}&type=code`; // GitHub search with code filter
    chrome.tabs.create({ url: githubSearchUrl }); // Open GitHub search in a new tab
  }
});

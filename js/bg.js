
try {
  if (typeof browser === "undefined") browser = chrome;
} catch(e) { browser = chrome; }

browser.browserAction.onClicked.addListener(tab => {
  browser.tabs.executeScript(tab.Id, {file: 'js/snake.js'});
});

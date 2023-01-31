import { webRequestListener } from "./webRequest";

import "./hot"; // Hot Module Reloader

const networkLog: Record<number, string[]> = {};

chrome.runtime.onInstalled.addListener(function () {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "run-foo") {
      const response = await chrome.windows.create({
        url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
        width: 800,
        height: 600,
      });

      if (response.id) {
        ((id: number) => {
          setTimeout(async () => {
            const tabs = await await chrome.tabs.query({ active: true });
            if (tabs.length !== 0 && tabs[0].id) {
              const tabId = tabs[0].id;
              if (tabId in networkLog) {
                chrome.tabs.sendMessage(id, {
                  tabId,
                  urls: networkLog[tabId],
                });
              }
            }
          }, 1000);
        })(response.id);
      }
    }
  });

  webRequestListener((details) => {
    const tabId = details.tabId;
    const url = details.url;

    if (!(tabId in networkLog)) networkLog[tabId] = [];
    const length = networkLog[tabId].length + 1;
    networkLog[tabId] = networkLog[tabId]
      .concat([url])
      .slice(Math.min(0, length - 120), length); // 120s
  });
});

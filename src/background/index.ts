import { webRequestListener } from "./webRequest";

import "./hot"; // Hot Module Reloader

const networkLog: Record<number, string[]> = {};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

chrome.runtime.onInstalled.addListener(function () {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "run-foo") {
      const tabs = await await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (typeof tabs[0] !== "undefined" && typeof tabs[0].id !== "undefined") {
        const tabId = tabs[0].id;
        await chrome.windows.create({
          url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
          width: 800,
          height: 600,
        });

        await sleep(1000); // rendering

        if (tabId in networkLog) {
          await chrome.runtime.sendMessage({
            tabId,
            urls: networkLog[tabId],
          });
        }
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

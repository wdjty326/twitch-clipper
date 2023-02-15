import { webRequestListener } from "./webRequest";

import "./hot"; // Hot Module Reloader
import TwitchClipDatabase from "../common/database";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

chrome.runtime.onInstalled.addListener(function () {
  TwitchClipDatabase.clear(); // DB Clear

  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "run-foo") {
      const tabs = await await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (typeof tabs[0] !== "undefined" && typeof tabs[0].id !== "undefined") {
        const tabId = tabs[0].id;
        const channelId = tabs[0].url!.substring(
          tabs[0].url!.lastIndexOf("/") + 1,
          tabs[0].url!.lastIndexOf("?") === -1
            ? undefined
            : tabs[0].url!.lastIndexOf("?")
        );

        await chrome.windows.create({
          url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
          width: 800,
          height: 600,
          type: "popup",
        });

        await sleep(1000); // rendering

        await chrome.runtime.sendMessage({
          tabId,
          channelId,
          xProgramDateTime: new Date().toISOString(),
        });
      }
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    (async () => {
      const currentTab = await chrome.tabs.get(tabId);

      const currentURL = currentTab.url || "";
      const changeURL = changeInfo.url || "";

      if (currentURL && /^https?:\/\/www\.twitch\.tv\/(.+)$/.test(currentURL)) {
        if (currentURL !== changeURL) TwitchClipDatabase.delete(tabId); // reset
      }
    })();
  });

  webRequestListener((details, dump) => {});
});

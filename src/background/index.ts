import { webRequestListener } from "./webRequest";

import "./hot"; // Hot Module Reloader
import TwitchClipDatabase from "../common/database";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// 초기화 스케줄러
let openWindowIds: number[] = [];
const clearTwitchClipTemp = async () => {
  if (process.env.NODE_ENV === "development") console.log("clear");
  const windowIds: number[] = (await chrome.windows.getAll()).map(
    (window) => window.id!
  );

  openWindowIds
    .filter((windowId) => windowIds.indexOf(windowId) === -1)
    .forEach((windowId) => {
      TwitchClipDatabase.delete("TwitchClipTemp", windowId);
    });

  openWindowIds = windowIds;
};

let clearTwitchClipTempInterval: NodeJS.Timer;

chrome.runtime.onInstalled.addListener(function () {
  TwitchClipDatabase.clear(); // DB Clear
  TwitchClipDatabase.clear("TwitchClipTemp"); // DB Clear

  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "run-foo") {
      clearInterval(clearTwitchClipTempInterval);
      try {
        const tabs = await await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (
          typeof tabs[0] !== "undefined" &&
          typeof tabs[0].id !== "undefined"
        ) {
          const tabId = tabs[0].id;
          const channelId = tabs[0].url!.substring(
            tabs[0].url!.lastIndexOf("/") + 1,
            tabs[0].url!.lastIndexOf("?") === -1
              ? undefined
              : tabs[0].url!.lastIndexOf("?")
          );

          const window = await chrome.windows.create({
            url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
            width: 520,
            height: 492,
            type: "popup",
          });

          await sleep(1000); // rendering
          clearTwitchClipTemp();
          await chrome.runtime.sendMessage({
            windowId: window.id,
            tabId,
            channelId,
            xProgramDateTime: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error(e);
      }

      clearTwitchClipTempInterval = setInterval(clearTwitchClipTemp, 10000);
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    (async () => {
      const currentTab = await chrome.tabs.get(tabId);

      const currentURL = currentTab.url || "";
      const changeURL = changeInfo.url || "";

      if (currentURL && /^https?:\/\/www\.twitch\.tv\/(.+)$/.test(currentURL)) {
        if (currentURL !== changeURL)
          TwitchClipDatabase.delete("TwitchClip", tabId); // reset
      }
    })();
  });

  webRequestListener();
});

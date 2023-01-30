import "./hot";
//import "./rules";
import { webRequestListener } from "./webRequest";

chrome.runtime.onInstalled.addListener(function () {
  chrome.commands.onCommand.addListener((command) => {
    if (command === "run-foo") {
      //  chrome.tabs.create({
      //    pinned: true,
      //    url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
      //  });
      chrome.windows
        .create({
          url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
          width: 800,
          height: 600,
        })
        .then((result) => {
          if (result.id) webRequestListener(result.id);
        });
    }
  });
});

import TwitchClipDatabase from "./database";

export const webRequestListener = (
  callback?: (
    details: chrome.webRequest.WebRequestHeadersDetails,
    dump?: Uint8Array
  ) => void
) => {
  const listener = (details: chrome.webRequest.WebRequestHeadersDetails) => {
    if (details.initiator?.includes("chrome-extension://")) return;
    const requestId = details["requestId"];
    const temp: Record<string, any> = {};
    temp[requestId] = {
      ...details,
      requestTimeStamp: details["timeStamp"],
    };
    delete temp[requestId].timeStamp;

    if (/^https:\/\/.+\.hls\.ttvnw\.net\/(.+)\.ts$/.test(details.url)) {
      fetch(details.url)
        .then((response) => response.arrayBuffer())
        .then(async (buffer) => {
          try {
            if (buffer.byteLength !== 0) {
              await TwitchClipDatabase.insert(
                "TwitchClip",
                details.tabId,
                details.url,
                new Uint8Array(buffer),
                new Date(details.timeStamp).toISOString()
              );
              if (callback) callback(details);
            }
          } catch (e) {
            console.error(e);
          }
        });
    }
  };
  chrome.webRequest.onBeforeSendHeaders.addListener(
    listener,
    { urls: ["<all_urls>"] },
    ["requestHeaders", "extraHeaders"]
  );

  return () => {
    chrome.webRequest.onBeforeSendHeaders.removeListener(listener);
  };
};
export const webRequestListener = (
  callback: (details: chrome.webRequest.WebRequestHeadersDetails) => void
) => {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      if (details.initiator?.includes("chrome-extension://")) return;
      const requestId = details["requestId"];
      const temp: Record<string, any> = {};
      temp[requestId] = {
        ...details,
        requestTimeStamp: details["timeStamp"],
      };
      delete temp[requestId].timeStamp;

      if (/^https:\/\/.+\.hls\.ttvnw\.net\/(.+)\.ts$/.test(details.url)) {
        callback(details);
      }
      console.log("onBeforeSendHeaders", temp);
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders", "extraHeaders"]
  );
};

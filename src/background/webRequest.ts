export const webRequestListener = (tabId: number) => {
  const callback = (details: chrome.webRequest.WebRequestHeadersDetails) => {
    if (details.initiator?.includes("chrome-extension://")) return;
    const requestId = details["requestId"];
    const temp: Record<string, any> = {};
    temp[requestId] = {
      ...details,
      requestTimeStamp: details["timeStamp"],
    };
    delete temp[requestId].timeStamp;

    if (
      /https:\/\/.+\.hls\.ttvnw\.net\/*/.test(
        (temp[requestId] as chrome.webRequest.WebResponseHeadersDetails).url
      )
    ) {
      (async () => {
        try {
          console.log(tabId);
          const response = await chrome.runtime.sendMessage({
            url: (
              temp[requestId] as chrome.webRequest.WebResponseHeadersDetails
            ).url,
          });
        } catch (e) {
          console.error(e);
        }
      })();
    }

    console.log("onBeforeSendHeaders", temp);
  };

  chrome.webRequest.onBeforeSendHeaders.addListener(
    callback,
    { urls: ["<all_urls>"] },
    ["requestHeaders", "extraHeaders"]
  );

  return () => {
    chrome.webRequest.onBeforeSendHeaders.removeListener(callback);
  };
};

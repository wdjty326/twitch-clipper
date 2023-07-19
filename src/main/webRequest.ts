import TwitchClipDatabase from "./database";

// 기존의 insert 내에 있던 url 체크로직과 분리함
const checkInsertData = async (url: string, id: number) => {
  const list = await TwitchClipDatabase.select(
    "TwitchClip",
    "index_by_url",
    url
  );
  return Array.isArray(list) && list.filter(({ tabId }) => tabId === id).length === 0;
};

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
      checkInsertData(details.url, details.tabId)
        .then((result) => {
          if (result) return fetch(details.url);
          return null;
        })
        .then((response) => {
          if (response) return response.arrayBuffer();
          return new ArrayBuffer(0);
        })
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
            }
          } catch (e) {
            console.error(e);
          }
        })
        .finally(() => {
          if (callback) callback(details);
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

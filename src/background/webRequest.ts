import * as storage from "./storage";

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
        fetch(details.url)
          .then((response) => response.arrayBuffer())
          .then(async (buffer) => {
            try {
              if (buffer.byteLength !== 0) callback(details);
              //  const dataUrl = await new Promise<string | undefined>(
              //    (resolve, reject) => {
              //      const reader = new FileReader();
              //      reader.onloadend = (ev) => {
              //        resolve(ev.target?.result?.toString());
              //      };
              //      reader.onerror = reject;
              //      reader.readAsDataURL(blob);
              //    }
              //  );
              //  if (dataUrl && dataUrl !== "data:")
              //    await storage.setter({
              //      tabId: details.tabId,
              //      dataUrl,
              //    });
            } catch (e) {
              console.error(e);
            }
            //finally {
            //  callback(details);
            //}
          });
      }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders", "extraHeaders"]
  );
};

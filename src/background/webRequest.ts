export const webRequestListener = (
	callback: (details: chrome.webRequest.WebRequestHeadersDetails, dump?: Uint8Array) => void
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
				fetch(details.url, {
					headers: {
						"Cache-Control": "max-age=604800"
					}
				})
					.then((response) => response.arrayBuffer())
					.then(async (buffer) => {
						try {
							if (buffer.byteLength !== 0) callback(details); // callback(details, new Uint8Array(buffer));
						} catch (e) {
							console.error(e);
						}
					});
			}
		},
		{ urls: ["<all_urls>"] },
		["requestHeaders", "extraHeaders"]
	);
};

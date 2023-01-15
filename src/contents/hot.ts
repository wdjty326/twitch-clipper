if (process.env.NODE_ENV === "development") {
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      try {
        if (typeof message === "string") {
          if (message === "#CONTENT-SCRIPTS") {
            const response = await chrome.runtime.sendMessage("#BACKGROUND");
            if (response?.farewell) {
              console.log("#OK");
              window.location.reload();
            }
            sendResponse({ farewell: "ok" });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  );
}

if (process.env.NODE_ENV === "development") {
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      try {
        if (typeof message === "string") {
          if (message === "#CONTENT-SCRIPTS") {
            console.log("#OK");
            window.location.reload();
          }
        }
      } catch (e) {
        console.error("HMR:", e);
      }
    }
  );
}

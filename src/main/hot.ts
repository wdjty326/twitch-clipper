if (process.env.NODE_ENV === "development") {
  if (module.hot) {
    let clearPing: VoidFunction;

    const websocket = new WebSocket("ws://localhost:9081/ws");
    websocket.onopen = () => {
      clearPing = (() => {
        const id = setInterval(() => {
          websocket.send("#PING");
        }, 5000);
        return () => clearInterval(id);
      })();
    };

    websocket.onmessage = async (ev) => {
      try {
        switch (ev.data) {
          case "#PONG":
            console.log("#PONG");
            break;
          case "#BACKGROUND": // Background reload
          case "#CONTENT-SCRIPTS": // Content-Scripts reload
            const [tab] = await await chrome.tabs.query({
              active: true,
              //  currentWindow: true,
            });
            if (tab?.id) {
              console.log("[contentscript] chrome.runtime.sendMessage()");
              await chrome.tabs.sendMessage(tab.id, "#CONTENT-SCRIPTS");
              chrome.runtime.reload();
            }
            break;
        }
      } catch (e) {
        console.error(e);
      }
    };
    websocket.onclose = () => {
      if (typeof clearPing !== "undefined") clearPing();
    };
  }
}

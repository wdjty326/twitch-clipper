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
            console.log("#OK");
            chrome.runtime.reload();
            break;
          case "#CONTENT-SCRIPTS": // Content-Scripts reload
            const [tab] = await await chrome.tabs.query({
              active: true,
              currentWindow: true,
            });
            if (tab?.id) {
              const response = await chrome.tabs.sendMessage(
                tab.id,
                "#CONTENT-SCRIPTS"
              );
              console.log(response);
              if (response?.farewell)
                console.log(
                  "[contentscript] chrome.runtime.sendMessage()",
                  response?.farewell
                );
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

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      if (message === "#BACKGROUND") {
        chrome.runtime.reload();
        setTimeout(() => {
          sendResponse({ farewell: "ok" });
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    }
  });
}

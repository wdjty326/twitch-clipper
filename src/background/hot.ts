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
    websocket.onmessage = (ev) => {
      try {
        switch (ev.data) {
          case "#PONG":
            console.log("#PONG");
            break;
          case "#BLOCK":
            console.log("#OK");
            chrome.runtime.reload();
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

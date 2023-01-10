if (process.env.NODE_ENV === "development") {
  if (module.hot) {
    const websocket = new WebSocket("ws://localhost:9081/ws");
    websocket.onmessage = (ev) => {
      try {
        const { type } = JSON.parse(ev.data);
        if (type === "static-changed") {
          chrome.runtime.reload();
          return;
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}

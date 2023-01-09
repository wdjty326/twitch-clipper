if (process.env.NODE_ENV === "development") {
  if (module.hot) {
    module.hot.accept((err) => {
      if (!err) chrome.runtime.restart();
    });
  }

  if (typeof window.EventSource !== "undefined") {
	const source = new EventSource("./");
	source.addEventListener("message", function(e) {
		console.log(e);
	});
  }
}

chrome.runtime.onInstalled.addListener(function () {
  console.log("테스트133223");
});

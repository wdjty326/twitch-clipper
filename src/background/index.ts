chrome.runtime.onInstalled.addListener(function () {
  chrome.runtime.setUninstallURL("http://localhost:9080/");
});

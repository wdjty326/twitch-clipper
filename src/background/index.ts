import "./hot";

chrome.runtime.onInstalled.addListener(function () {
  console.log("테스트 메세지", 1);
});
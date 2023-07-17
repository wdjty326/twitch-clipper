import "./hotkey";
import "./hot";

(function () {
  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let threadId: number = 0;

  const createClipDownloadButton = () => {
    const clipLayoutElement = document.createElement("div");
    const clipButton = document.createElement("button");
    clipButton.onclick = () => {
      chrome.runtime.sendMessage({ command: "run-foo" }, (response) => {
        console.log(response);
      });
    };

    clipLayoutElement.append(clipButton);
    return clipLayoutElement;
  };

  const setMediaRecorder = (videoPlayer: HTMLMediaElement) => {
    if (!("captureStream" in videoPlayer))
      return console.error("captureStream not support");
    if (mediaRecorder !== null) mediaRecorder.stop();

    mediaStream = (videoPlayer as any).captureStream() as MediaStream;
    const options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(mediaStream, options);
    mediaRecorder.addEventListener("dataavailable", (ev) => {
      if (ev.data) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            chrome.runtime.sendMessage(
              {
                command: "push-packet",
                result: Array.from(
                  new Uint8Array(ev.target.result as ArrayBuffer)
                ),
              },
              (response) => {
                if (response !== "ok") console.log(response);
              }
            );
          }
          // TODO:: 에러처리필요
        };
        reader.readAsArrayBuffer(ev.data);
      }
    });
    mediaRecorder.addEventListener("start", (ev) => {
      console.log("start media recorder");
      chrome.runtime.sendMessage({ command: "start-packet" }, (response) => {
        console.log(response);
      });
    });
    mediaRecorder.addEventListener("stop", (ev) => {
      console.log("stop media recorder");
        window.clearInterval(threadId);
      chrome.runtime.sendMessage({ command: "stop-packet" }, (response) => {
        console.log(response);
      });
    });
    // TODO::가져오기처리
    mediaRecorder.start();
    threadId = window.setInterval(() => {
      mediaRecorder && mediaRecorder.requestData();
    }, 500);
  };

  const videoPlayerOverlay = document.querySelector(
    "div[data-a-target=video-player]"
  );
  if (!videoPlayerOverlay) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      try {
        if (mutation.type === "childList") {
          const target = mutation.target as HTMLElement;
          //  if (
          //    target.nodeName === "DIV" &&
          //    target.className.includes("player-controls__right-control-group")
          //  )
          //    target.append(createClipDownloadButton());

          if (
            target.nodeName === "DIV" &&
            target.className.includes("video-ref")
          ) {
            const videoPlayer = target.children[0] as HTMLMediaElement;
            if (videoPlayer?.nodeName === "VIDEO") {
              videoPlayer.addEventListener("playing", () => {
                //setMediaRecorder(videoPlayer); TODO::안정화전까지미사용
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
  observer.observe(videoPlayerOverlay, { subtree: true, childList: true });
})();

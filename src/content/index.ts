import "./hot";

/** @deprecated 사용불가코드 */

const videoPlayer = document.querySelector(".video-player");
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === "VIDEO") {
          (node as HTMLVideoElement).addEventListener("playing", () => {
            const stream = (node as any).captureStream() as MediaStream;
            const options = { mimeType: "video/webm; codecs=vp9" };
            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.addEventListener("dataavailable", (ev) => {
              console.log(ev.data);
            });
            mediaRecorder.start();
          });
        }
      });
    }
  });
});

observer.observe(videoPlayer!, {
  childList: true,
  subtree: true,
});

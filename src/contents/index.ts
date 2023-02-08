import "./hot";
import "./transcode";

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

//const playerControl = document.getElementById("channel-player")!;
//if (playerControl!.firstChild) {
//  const rightControlGroup = playerControl.lastElementChild;

//  if (rightControlGroup) {
//    const plyerClipButton: HTMLButtonElement = rightControlGroup.querySelector(
//      "button[data-a-target='player-clip-button']"
//    )!;
//    plyerClipButton.onclick = (ev) => {
//      ev.preventDefault();
//      alert("test");
//    };
//  }
//}

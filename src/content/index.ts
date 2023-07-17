import "./hot";

const createClipDownloadButton = () => {
	const clipLayoutElement = document.createElement("div");
	const clipButton = document.createElement("button");
	clipButton.onclick = () => {
		chrome.runtime.sendMessage({ command: "run-foo" }, (response) => {
			console.log(response);
		})
	};

	clipLayoutElement.append(clipButton);
	return clipLayoutElement;
}

document.addEventListener("DOMContentLoaded", () => {
	const channelPlayer = document.getElementById("channel-player");
	if (!channelPlayer) return console.error("not found channel player");

	const rightControlGroup = channelPlayer.querySelector(".player-controls__right-control-group");
	if (!rightControlGroup) return console.error("not found right control group")

	rightControlGroup.append(createClipDownloadButton());
});


// command 사용시 확장프로그램 충돌로 직접 키를 입력받도록 처리
document.addEventListener("keydown", (event) => {
	const inputKeys = [];
	if (event.ctrlKey) inputKeys.push("Control");
	if (event.metaKey) inputKeys.push("Command");
	if (event.shiftKey) inputKeys.push("Shift");

	inputKeys.push(event.key);

	const commandLine = inputKeys.join("+");
	if (commandLine === ["Control", "Shift", "X"].join("+") || // Mac 대응
		commandLine === ["Command", "Shift", "X"].join("+")
	) {
		chrome.runtime.sendMessage({ command: "run-foo" }, (response) => {
			console.log(response);
		})
	}
});

// const videoPlayer = document.querySelector("video");
// console.log(videoPlayer);
// const observer = new MutationObserver((mutations) => {
//   mutations.forEach((mutation) => {
//     if (mutation.type === "childList") {
//       mutation.addedNodes.forEach((node) => {
//         if (node.nodeName === "VIDEO") {
//           (node as HTMLVideoElement).addEventListener("playing", () => {
//             const stream = (node as any).captureStream() as MediaStream;
//             const options = { mimeType: "video/webm; codecs=vp9" };
//             const mediaRecorder = new MediaRecorder(stream, options);

//             mediaRecorder.addEventListener("dataavailable", (ev) => {
//               console.log(ev.data);
//             });
//             mediaRecorder.start();
//           });
//         }
//       });
//     }
//   });
// });

// observer.observe(videoPlayer!, {
//   childList: true,
//   subtree: true,
// });

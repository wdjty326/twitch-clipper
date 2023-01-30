import "./hot";
import "./transcode";

const playerControl = document.getElementById("channel-player");
if (playerControl?.firstChild) {
	const rightControlGroup = playerControl.lastElementChild;

	if (rightControlGroup) {
		const plyerClipButton: HTMLButtonElement = rightControlGroup.querySelector("button[data-a-target='player-clip-button']")!;
		plyerClipButton.onclick = (ev) => {
			ev.preventDefault();
			alert("test");
		};
	}	
}

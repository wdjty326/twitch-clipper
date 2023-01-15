import "./hot";

const playerControl = document.getElementById("channel-player");
if (playerControl?.firstChild) {
	//const leftControlGroup = playerControl.firstElementChild;
	const rightControlGroup = playerControl.lastElementChild;

	if (rightControlGroup) {
		const plyerClipButton: HTMLButtonElement = rightControlGroup.querySelector("button[data-a-target='player-clip-button']")!;
		plyerClipButton.onclick = (ev) => {
			ev.preventDefault();
			alert("test");
		};
	}	
}

const chromeEx = document.createElement("span");
chromeEx.innerHTML = "TEST2";
document.body.appendChild(chromeEx);
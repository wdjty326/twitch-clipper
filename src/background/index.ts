import { webRequestListener } from "./webRequest";

import "./hot"; // Hot Module Reloader
import TwitchClipDatabase from "../common/database";

interface LogInfo {
	url: string;
	dump?: Uint8Array;
	xProgramDateTime: string;
}

const networkLog: Record<number, LogInfo[]> = {};

const sleep = (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

chrome.runtime.onInstalled.addListener(function () {
	TwitchClipDatabase.clear(); // DB Clear

	chrome.commands.onCommand.addListener(async (command) => {
		if (command === "run-foo") {
			const tabs = await await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});

			if (typeof tabs[0] !== "undefined" && typeof tabs[0].id !== "undefined") {
				const tabId = tabs[0].id;
				await chrome.windows.create({
					url: `chrome-extension://${chrome.runtime.id}/clipper.html`,
					width: 800,
					height: 600,
				});

				await sleep(1000); // rendering

				if (tabId in networkLog) {
					await chrome.runtime.sendMessage({
						tabId,
						urls: networkLog[tabId],
					});
				}
			}
		}
	});

	chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
		(async () => {
			const currentTab = await chrome.tabs.get(tabId);

			const currentURL = currentTab.url || "";
			const changeURL = changeInfo.url || "";

			if (currentURL && /^https?:\/\/www\.twitch\.tv\/(.+)$/.test(currentURL)) { // reset
				if (currentURL !== changeURL) {
					TwitchClipDatabase.delete(tabId);
					networkLog[tabId] = [];
				}
			}
		})();
	});

	webRequestListener((details, dump) => {
		const tabId = details.tabId;
		const url = details.url;
		const xProgramDateTime = new Date(details.timeStamp).toISOString();

		if (!(tabId in networkLog)) networkLog[tabId] = [];

		const isDuplication = networkLog[tabId].findIndex((log) => log.url === url) !== -1;
		if (!isDuplication) {
			const length = networkLog[tabId].length + 1;
			networkLog[tabId] = networkLog[tabId]
				.concat([
					{
						url,
						dump,
						xProgramDateTime,
					},
				])
				.slice(Math.max(0, length - 120), length); // 120s
		}
	});
});

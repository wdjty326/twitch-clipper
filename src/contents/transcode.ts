import fs from "fs";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log(message);
  if (typeof message !== "string") return;
  try {
    if (/https:\/\/.+\.hls\.ttvnw\.net\/*/.test(message)) {
    //  const ffmpeg = createFFmpeg({
    //    log: false,
    //  });
    //  const url = new URL(message);
    //  const fileName = url.pathname.substring(
    //    url.pathname.lastIndexOf("/") + 1
    //  );
    //  await ffmpeg.load();
    //  ffmpeg.FS("writeFile", fileName, await fetchFile(message));
    //  await ffmpeg.run("-i", message, fileName);
    //  ffmpeg.exit();
    }
  } catch (e) {
    console.error(e);
  }
});

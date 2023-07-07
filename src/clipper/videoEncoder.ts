import { createFFmpeg, fetchFile } from "../ffmpeg";
import { LogInfo } from "./defines";

const corePath = new URL(
  "ffmpeg-core.js",
  `chrome-extension://${chrome.runtime.id}`
).href;

const workerPath = new URL(
  "ffmpeg-core.worker.js",
  `chrome-extension://${chrome.runtime.id}`
).href;

const ffmpeg = createFFmpeg({
  corePath,
  workerPath,
  //  mainName: "main", // 싱글 스레드용
  mainName: "proxy_main",
  log: true, // process.env.NODE_ENV === "development",
});

export const transcode = async (logs: LogInfo[]) => {
  try {
    if (!ffmpeg.isLoaded()) {
    //  await preloadFFmpeg();
      await ffmpeg.load();
    }

    let n = 0;
    for (const { url, dump } of logs) {
      try {
        ffmpeg.FS("writeFile", `${n}.ts`, dump || (await fetchFile(url)));
        n++;
      } catch (e) {
        console.error(e, url);
      }
    }

    await ffmpeg.run(
      "-i",
      `concat:${Array(n)
        .fill(0)
        .map((_, index) => `${index}.ts`)
        .join("|")}`,
      "-acodec",
      "copy",
      "-vcodec",
      "copy",
      "result.mp4"
    );
    const result = ffmpeg.FS("readFile", "result.mp4");
    //return new Blob([result], { type: "video/mp4" });
    return await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = reader.onerror = (ev) => {
        if (ev.target?.result instanceof ArrayBuffer)
          resolve(new Uint8Array(ev.target.result));
        ffmpeg.exit();
      };
      reader.readAsArrayBuffer(
        new Blob([result], {
          type: "video/mp4",
        })
      );
    });
  } catch (e) {
    console.error(e);
    ffmpeg.exit();
  }

  return null;
};

export const upscale = async (url: string) => {
  try {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(url));
    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-vf",
      "scale=1920x1080:flags=lanczos",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "21",
      "compress_1080p.mp4"
    );
    const result = ffmpeg.FS("readFile", "compress_1080p.mp4");
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = reader.onerror = (ev) => {
        resolve(ev.target?.result?.toString() || "");
        ffmpeg.exit();
      };
      reader.readAsDataURL(
        new Blob([result], {
          type: "video/mp4",
        })
      );
    });
  } catch (e) {
    console.error(e);
    ffmpeg.exit();
  }
  return "";
};

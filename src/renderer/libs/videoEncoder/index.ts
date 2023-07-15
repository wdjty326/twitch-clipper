import { LogInfo } from "@/renderer/defines";
import { progressProvider } from "@/renderer/libs";

import { createFFmpeg, fetchFile } from "./ffmpeg";

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
  // 전파처리
  progress: ({ ratio }) =>
    progressProvider._listeners.forEach((fn) => fn(Math.floor(ratio * 100))),
  mainName: "proxy_main",
  log: process.env.NODE_ENV === "development",
});

/**
 * 영상조각을 합칩니다.
 * @param logs
 * @returns
 */
export const transcode = async (logs: LogInfo[]) => {
  try {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
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
      "-sseof",
      "-600", // 비디오의 마지막 10분만 유지
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
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    ffmpeg.exit();
  }

  return null;
};

/**
 * 영상을 자릅니다.
 * @param url
 * @param start
 * @param end
 * @returns
 */
export const videoSlice = async (url: string, start: number, end: number) => {
  try {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(url));
    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-acodec",
      "copy",
      "-vcodec",
      "copy",
      "-ss",
      start.toString(),
      "-to",
      end.toString(),
      "compress_cut.mp4"
    );
    const result = ffmpeg.FS("readFile", "compress_cut.mp4");
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    ffmpeg.exit();
  }
  return null;
};

/**
 * 해상도를 변경합니다.
 * @param url
 * @returns
 */
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
      "scale=-1:1080:flags=lanczos",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "21",
      "compress_1080p.mp4"
    );
    const result = ffmpeg.FS("readFile", "compress_1080p.mp4");
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    ffmpeg.exit();
  }
  return null;
};

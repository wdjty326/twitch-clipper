import { FunctionComponent, useEffect, useState } from "react";
import ClipVideo from "./clipVideo";
import TwitchClipDatabase from "../common/database";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
interface LogInfo {
  url: string;
  dump?: Uint8Array;
  xProgramDateTime: string;
}

const corePath = new URL(
  "ffmpeg-core.js",
  `chrome-extension://${chrome.runtime.id}`
).href;

const workerPath = new Worker(
  new URL("ffmpeg-core.worker.js", `chrome-extension://${chrome.runtime.id}`),
  {
    name: "fffmpeg-core.worker.js",
  }
);

const preloadFFmpeg = () =>
  new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/ffmpeg-core.js";
    script.type = "text/javascript";
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject();
    };
    document.head.appendChild(script);
  });

const ffmpeg = createFFmpeg({
  corePath,
  mainName: "main",
  log: true,
});

const transcode = async (logs: LogInfo[]) => {
  try {
    await preloadFFmpeg();
    await ffmpeg.load();

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
  }

  return "";
};

type chromeEvent = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;

const App: FunctionComponent = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    const callback: chromeEvent = (message) => {
      try {
        if ("urls" in message) {
          (async () => {
            const result = await TwitchClipDatabase.selectAll(message.tabId);
			transcode(result as LogInfo[]).then((url) => {
              setVideoUrl(url);
            });
          })();
        }
      } catch (e) {
        console.error(e);
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  return (
    <div>
      <header>
        <h1>Twitch Clipper</h1>
      </header>
      <main>
        <article>{videoUrl ? <ClipVideo src={videoUrl} /> : "Loading"}</article>
      </main>
    </div>
  );
};

export default App;

import { FunctionComponent, useEffect, useState } from "react";
import ClipVideo from "./clipVideo";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
interface LogInfo {
  url: string;
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

const transcode = async (urls: string[]) => {
  try {
    const m3u8Name = "list.m3u8";
    const tsName = "list.ts";

    await preloadFFmpeg();

    await ffmpeg.load();

    let n = 0;
    for (const url of urls) {
      try {
        ffmpeg.FS("writeFile", `${n}.ts`, await fetchFile(url));
        n++;
      } catch (e) {
        console.error(e, url);
      }
    }

    //ffmpeg.FS("writeFile", m3u8Name, await fetchFile(blob));
    //await ffmpeg.run(
    //  "-f",
    //  "concat",
    //  "-safe",
    //  "0",
    //  "-protocol_whitelist",
    //  "file,http,https,tcp,tls,crypto",
    //  "-i",
    //  txtName,
    //  "-c",
    //  "copy",
    //  tsName
    //);
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
          //  const list = await chrome.storage.local.get([`${message.tabId}`]);
          //  const parts: string = [
          //    "#EXTM3U",
          //    "#EXT-X-PLAYLIST-TYPE:VOD",
          //    "#EXT-X-TARGETDURATION:120",
          //    "#EXT-X-VERSION:4",
          //    "#EXT-X-MEDIA-SEQUENCE:0",
          //    (message.urls as LogInfo[])
          //      .map((url) =>
          //        [
          //          "#EXTINF:2.000",
          //          url.url,
          //          `#EXT-X-PROGRAM-DATE-TIME:${url.xProgramDateTime}`,
          //        ].join("\r\n")
          //      )
          //      .join("\r\n"),
          //    "#EXT-X-ENDLIST",
          //  ].join("\r\n");
          //  console.log(parts);
          //  const blob = new Blob([parts], {
          //    type: "application/vnd.apple.mpegurl",
          //  });

          transcode((message.urls as LogInfo[]).map((value) => value.url)).then(
            (url) => {
              setVideoUrl(url);
            }
          );
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

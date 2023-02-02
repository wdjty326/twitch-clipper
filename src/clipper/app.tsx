import { FunctionComponent, useEffect, useState } from "react";
import ClipVideo from "./clipVideo";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

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

const transcode = async (blob: Blob) => {
  try {
    const txtName = "list.txt";
    const tsName = "list.ts";

    await preloadFFmpeg();

    await ffmpeg.load();

    ffmpeg.FS("writeFile", txtName, await fetchFile(blob));
    await ffmpeg.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-protocol_whitelist",
      "file,http,https,tcp,tls,crypto",
      "-i",
      txtName,
      "-c",
      "copy",
      tsName
    );
    await ffmpeg.run(
      "-i",
      tsName,
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
          const blob = new Blob(
            [
              (message.urls as string[])
                .map((url) => `file '${url}'`)
                .join("\n\r"),
            ],
            {
              type: "text/plain",
            }
          );

          transcode(blob).then((url) => {
            setVideoUrl(url);
          });
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
        <article>{videoUrl && <ClipVideo src={videoUrl} />}</article>
      </main>
    </div>
  );
};

export default App;

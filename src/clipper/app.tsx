import { FunctionComponent, useEffect, useState } from "react";
import ClipVideo from "./clipVideo";
import TwitchClipDatabase from "../common/database";
import Toolbar from "./toolbar";
import { transcode } from "./videoEncoder";
import { LogInfo } from "./defines";

type chromeEvent = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;

const App: FunctionComponent = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [initFileName, setFileName] = useState<string>("");

  useEffect(() => {
    const callback: chromeEvent = (message: {
      tabId: number;
      channelId: string;
      xProgramDateTime: string;
    }) => {
      try {
        if ("tabId" in message) {
          (async () => {
            const result = await TwitchClipDatabase.selectAll(message.tabId);
            transcode(result as LogInfo[]).then((url) => {
              setVideoUrl(url);
              setFileName(`${message.channelId} ${message.xProgramDateTime}`);
            });

            await chrome.storage.session.set(message);
          })();
        }
      } catch (e) {
        console.error(e);
      }
    };

    chrome.storage.session
      .get(["tabId", "channelId", "xProgramDateTime"])
      .then(async (message) => {
        if ("tabId" in message) {
          const result = await TwitchClipDatabase.selectAll(message.tabId);
          transcode(result as LogInfo[]).then((url) => {
            setVideoUrl(url);
            setFileName(`${message.channelId} ${message.xProgramDateTime}`);
          });
        }
      });
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  return (
    <div className="app">
      <header>
        <h1>트위치 클립 다운로더</h1>
      </header>
      <main>
        <article>{videoUrl ? <ClipVideo src={videoUrl} /> : "Loading"}</article>
      </main>
      <Toolbar
        url={videoUrl}
        initFileName={initFileName}
        onUpdateVideoURL={setVideoUrl}
      />
    </div>
  );
};

export default App;

import { FunctionComponent, useEffect, useState } from "react";
import ClipVideo from "./clipVideo";
import TwitchClipDatabase from "../common/database";
import Toolbar from "./toolbar";
import { transcode } from "./videoEncoder";
import { LogInfo } from "./defines";
import Loader from "./loader";

type chromeEvent = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;

const App: FunctionComponent = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [initFileName, setFileName] = useState<string>("");

  useEffect(() => {
    const callback: chromeEvent = async (message: {
      tabId: number;
      windowId: number;
      channelId: string;
      xProgramDateTime: string;
    }) => {
      try {
        if ("tabId" in message) {
          const currentWindow = await chrome.windows.getCurrent();
          if (currentWindow.id === message.windowId) {
            const result = await TwitchClipDatabase.select(
              "TwitchClip",
              message.tabId
            );
            const transcodeData = await transcode(result as LogInfo[]);
            try {
              if (transcodeData) {
                TwitchClipDatabase.insert(
                  "TwitchClipTemp",
                  message.windowId,
                  message.channelId,
                  transcodeData,
                  message.xProgramDateTime
                );

                const url = window.URL.createObjectURL(
                  new Blob([transcodeData])
                );
                setVideoUrl(url);
              }
              setFileName(`${message.channelId} ${message.xProgramDateTime}`);
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    (async () => {
      const currentWindow = await chrome.windows.getCurrent();
      if (currentWindow.id) {
        const message = await TwitchClipDatabase.select(
          "TwitchClipTemp",
          currentWindow.id
        );
        if (message && "windowId" in message) {
          const url = window.URL.createObjectURL(new Blob([message.dump]));
          setVideoUrl(url);
          setFileName(`${message.channelId} ${message.xProgramDateTime}`);
        }
      }
    })();

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
      <main>{videoUrl ? <ClipVideo src={videoUrl} /> : <Loader />}</main>
      <Toolbar
        url={videoUrl}
        initFileName={initFileName}
        onUpdateVideoURL={setVideoUrl}
      />
    </div>
  );
};

export default App;

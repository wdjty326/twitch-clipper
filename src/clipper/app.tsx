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
      <Toolbar url={videoUrl} onUpdateVideoURL={setVideoUrl} />
    </div>
  );
};

export default App;

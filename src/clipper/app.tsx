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
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [initFileName, setFileName] = useState<string>("");

  // 최초로드시 클립처리코드
  useEffect(() => {
    const callback: chromeEvent = async (message: {
      tabId: number;
      windowId: number;
      channelId: string;
      xProgramDateTime: string;
    }) => {
      setLoading(true);
      if ("tabId" in message) {
        const currentWindow = await chrome.windows.getCurrent();
        if (currentWindow.id === message.windowId) {
          let transcodeData: Uint8Array | null = null;

          // 클립데이터합침처리
          try {
            const result = await TwitchClipDatabase.select(
              "TwitchClip",
              message.tabId
            );
            transcodeData = await transcode(result as LogInfo[]);
          } catch (e) {
            console.error("TwitchClip:select:", e);
          }

          // 새로고침시 재로드를 위한 합친클립데이터 임시데이터 저장처리
          try {
            if (transcodeData) {
              TwitchClipDatabase.insert(
                "TwitchClipTemp",
                message.windowId,
                message.channelId,
                transcodeData,
                message.xProgramDateTime
              );

              const url = window.URL.createObjectURL(new Blob([transcodeData]));
              setVideoUrl(url);
            }
            setFileName(`${message.channelId} ${message.xProgramDateTime}`);
          } catch (e) {
            console.error("TwitchClipTemp:select:", e);
          }
        }
      }
      setLoading(false);
    };

    (async () => {
      try {
        setLoading(true);
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
      } catch (e) {
        // TODO::사용자 에러 노출처리를 추후작업
        console.error("TwitchClipTemp:select:", e);
      }
      setLoading(false);
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
      {loading ? (
        <Loader />
      ) : (
        <>
          <main>
			{/** TODO::`videoURL`이 비어있을 경우 별도처리 코드 필요 */}
            <ClipVideo src={videoUrl} />
          </main>
          <Toolbar url={videoUrl} initFileName={initFileName} />
        </>
      )}
    </div>
  );
};

export default App;

import { useEffect, useState } from "react";
import { transcode } from "../videoEncoder";

import TwitchClipDatabase from "../../common/database";
import { LogInfo } from "../defines";

type chromeEvent = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;

/**
 * 트위치 클립 정보를 가져옵니다.
 * @returns 
 */
export const useLoaderTwitchClip = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");

  const LoadTwitchClipTemp = async () => {
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
		  setChannelId(message.channelId);
        }
      }
    } catch (e) {
      // TODO::사용자 에러 노출처리를 추후작업
      console.error("TwitchClipTemp:select:", e);
    }
    setLoading(false);
  };

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

              const url = window.URL.createObjectURL(
                new Blob([transcodeData], { type: "video/mp4" })
              );
              setVideoUrl(url);
            }
			setChannelId(message.channelId);
          } catch (e) {
            console.error("TwitchClipTemp:select:", e);
          }
        }
      }
      setLoading(false);
    };

    LoadTwitchClipTemp();
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  return {
    loading,
    channelId,
    videoUrl,
  };
};

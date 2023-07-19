import { useEffect, useLayoutEffect, useState } from "react";
import { transcode } from "@/renderer/libs/videoEncoder";

import TwitchClipDatabase from "@/main/database"; // main 참조
import { LogInfo } from "@/renderer/defines";
import { getDownloadURL } from "../libs/URL";

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

  useLayoutEffect(() => {
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
              "index_by_tabId",
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

              const url = await getDownloadURL(transcodeData);
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

    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  }, []);

  useLayoutEffect(() => {
	let workerId: number = 0;
    const LoadTwitchClipTemp = async () => {
      if (videoUrl) return; // 이미 데이터를 가져온 경우 
      if (loading) return (workerId = window.setTimeout(LoadTwitchClipTemp, 3000)); // 로딩대기중인 상태면 실행대기상태로 돌림

      setLoading(true);
      try {
        const currentWindow = await chrome.windows.getCurrent();
        if (currentWindow.id) {
          const message = await TwitchClipDatabase.select(
            "TwitchClipTemp",
            "",
            currentWindow.id
          );
          if (message && "windowId" in message) {
            const url = await getDownloadURL(message.dump);
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

    // `onMessage` 를 대기합니다.
    workerId = window.setTimeout(LoadTwitchClipTemp, 3000);
    return () => window.clearTimeout(workerId);
  }, []);

  return {
    loading,
    channelId,
    videoUrl,
  };
};

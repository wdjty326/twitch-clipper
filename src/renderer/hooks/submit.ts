import { useRef } from "react";
import { videoSlice } from "@/renderer/libs/videoEncoder";

export const useClipVideoSubmit = (videoUrl: string) => {
  const startTime = useRef<number>(0);
  const endTime = useRef<number>(0);

  const onClipVideoRange = (start: number, end: number) => {
    startTime.current = start;
    endTime.current = end;
  };

  const onSubmit = async (fileName: string = "1") => {
    if (startTime.current !== 0 || endTime.current !== 0) {
      const stream = await videoSlice(
        videoUrl,
        startTime.current,
        endTime.current
      );
      if (stream) {
        const blob = new Blob([stream], { type: "video/mp4" });
        const downloadURL = URL.createObjectURL(blob);

        await chrome.downloads.download({
          url: downloadURL,
          filename: `${fileName}.mp4`,
          saveAs: false,
          method: "GET",
        });
        URL.revokeObjectURL(downloadURL);
      }
      return;
    }

    await chrome.downloads.download({
      url: videoUrl,
      filename: `${fileName}.mp4`,
      saveAs: false,
      method: "GET",
    });
  };

  return {
    onClipVideoRange,
    onSubmit,
  };
};

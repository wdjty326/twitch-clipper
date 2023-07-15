import { useRef, useState } from "react";
import { videoSlice } from "@/renderer/libs/videoEncoder";
import { getDownloadURL } from "../libs/URL";

export const useClipVideoSubmit = (videoUrl: string) => {
  const startTime = useRef<number>(0);
  const endTime = useRef<number>(0);

  const onClipVideoRange = (start: number, end: number) => {
    startTime.current = start;
    endTime.current = end;
  };

  const onSubmit = async (fileName: string = "1") => {
    const atag = document.createElement("a");
    atag.download = fileName;
    if (startTime.current !== 0 || endTime.current !== 0) {
      const stream = await videoSlice(
        videoUrl,
        startTime.current,
        endTime.current
      );
      if (stream) {
        const downloadURL = await getDownloadURL(stream);
        atag.href = downloadURL;
		atag.click();

		URL.revokeObjectURL(downloadURL);
      }
      return;
    } else {
      atag.href = videoUrl;
      atag.click();
    }
  };

  return {
    onClipVideoRange,
    onSubmit,
  };
};

import { useState } from "react";
import { upscale } from "./videoEncoder";

interface ToolbarProps {
  url: string;
  onUpdateVideoURL(value: string): void;
}

export const Toolbar = ({ url, onUpdateVideoURL }: ToolbarProps) => {
  const [fileName, setFileName] = useState<string>("");
  return (
    <footer>
      <input
        className="toolbar-input"
        value={fileName}
        onInput={(ev) => {
          const target = ev.target as HTMLInputElement;
          setFileName(target.value);
        }}
      />
      <button
        className="toolbar-button"
        onClick={async () => {
          const videoUrl = await upscale(url);
          onUpdateVideoURL(videoUrl);
        }}
      >
        1080p 화질변경
      </button>
      <button
        className="toolbar-button"
        onClick={async () => {
          if (fileName) {
            const result = await chrome.downloads.download({
              url,
              filename: `${fileName}.mp4`,
              saveAs: true,
              method: "GET",
            });
          }
        }}
      >
        다운로드
      </button>
    </footer>
  );
};

export default Toolbar;

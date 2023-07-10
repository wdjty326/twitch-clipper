import { useLayoutEffect, useState } from "react";

interface ToolbarProps {
  initFileName: string;
  url: string;
}

export const Toolbar = ({
  url,
  initFileName,
}: ToolbarProps) => {
  const [fileName, setFileName] = useState<string>(initFileName);
  useLayoutEffect(() => setFileName(initFileName), [initFileName]);
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
          if (fileName) {
            await chrome.downloads.download({
              url,
			  
              filename: `${encodeURIComponent(fileName)}.mp4`,
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

import { useLayoutEffect, useState } from "react";

interface ToolbarProps {
  channelId: string;
  onSubmit(fileName: string): void;
}

export const Toolbar = ({ channelId, onSubmit }: ToolbarProps) => {
  const [fileName, setFileName] = useState<string>(`${channelId}_${Date.now()}`);
  useLayoutEffect(() => setFileName(`${channelId}_${Date.now()}`), [channelId]);
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
      <button className="toolbar-button" onClick={() => onSubmit(fileName)}>
        다운로드
      </button>
    </footer>
  );
};

export default Toolbar;

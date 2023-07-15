import { useLayoutEffect, useState } from "react";

interface ToolbarProps {
  channelId: string;
  onSubmit(fileName: string): void;
}

export const Toolbar = ({ channelId, onSubmit }: ToolbarProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>(
    `${channelId}_${Date.now()}`
  );
  useLayoutEffect(() => setFileName(`${channelId}_${Date.now()}`), [channelId]);
  return (
    <footer>
      <input
        className="toolbar-input"
        value={fileName}
		disabled={loading}
        onInput={(ev) => {
          const target = ev.target as HTMLInputElement;
          setFileName(target.value);
        }}
      />
      <button
        className="toolbar-button"
		disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            await onSubmit(fileName);
          } catch (e) {
            console.error(e);
          }
          setLoading(false);
        }}
      >
        다운로드
      </button>
    </footer>
  );
};

export default Toolbar;

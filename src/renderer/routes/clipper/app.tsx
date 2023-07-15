import { FunctionComponent } from "react";
import { ClipVideo, Toolbar, Loader } from "@/renderer/components";
import { useLoaderTwitchClip } from "@/renderer/hooks/app";
import { useClipVideoSubmit } from "@/renderer/hooks/submit";

const App: FunctionComponent = () => {
  const { channelId, loading, videoUrl } = useLoaderTwitchClip();

  const { onClipVideoRange, onSubmit } = useClipVideoSubmit(videoUrl);
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
            <ClipVideo src={videoUrl} onClipVideo={onClipVideoRange} />
          </main>
          <Toolbar channelId={channelId} onSubmit={onSubmit} />
        </>
      )}
    </div>
  );
};

export default App;

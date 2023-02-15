import { useState } from "react";

interface ClipVideoProps {
  src: string;
}

export const ClipVideo = ({ src }: ClipVideoProps) => {
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  return (
    <div>
      <video
        controls
        src={src}
        onLoad={(ev) => {
          const video = ev.target as HTMLMediaElement;
          setDuration(video.duration);
          setStartTime(0);
          setEndTime(video.duration);
        }}
      ></video>
      <div
        className="clips-editor-slider-background"
        style={{
          height: "48px",
          backgroundImage: `url(chrome-extension://${chrome.runtime.id}/images/ss-tick-45x48.png)`,
          backgroundSize: "auto 100%",
        }}
      >
        <div
          className="draggable-slider"
          style={
            {
              //width: `calc(${parseFloat(((endTime + 1) / (startTime + 1)).toFixed(4))}%)`,
            }
          }
        >
          <div className="draggable-slider-left">
            <svg
              type="color-fill-current"
              width="25px"
              height="20px"
              version="1.1"
              viewBox="0 0 20 20"
              x="0px"
              y="0px"
            >
              <path d="M12.5 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM6 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM12.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM6 12.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM11 17.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM7.5 16a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"></path>
            </svg>
          </div>
          <div className="draggable-slider-handler" />
          <div className="draggable-slider-right">
            <svg
              type="color-fill-current"
              width="25px"
              height="20px"
              version="1.1"
              viewBox="0 0 20 20"
              x="0px"
              y="0px"
            >
              <path d="M12.5 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM6 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM12.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM6 12.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM11 17.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM7.5 16a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipVideo;

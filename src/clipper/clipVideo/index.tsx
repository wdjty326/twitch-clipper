import { useRef, useState } from "react";

interface ClipVideoProps {
  src: string;
}

export const ClipVideo = ({ src }: ClipVideoProps) => {
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const moveFlag = useRef<boolean>(false);

  return (
    <div>
      <video
        controls
        src={src}
        onLoadedData={(ev) => {
          const video = ev.target as HTMLMediaElement;
          setDuration(video.duration);
          setStartTime(0);
          setEndTime(video.duration);
        }}
      />
      {duration > 0 && (
        <div
          ref={sliderRef}
          className="clips-editor-slider-background"
          style={{
            height: "48px",
            backgroundImage: `url(chrome-extension://${chrome.runtime.id}/images/ss-tick-45x48.png)`,
            backgroundSize: "auto 100%",
          }}
        >
          <div
            className="draggable-slider"
            style={{
              left: `${parseFloat(((startTime / duration) * 100).toFixed(2))}%`,
              width: `${parseFloat(
                (((endTime - startTime) / duration) * 100).toFixed(2)
              )}%`,
            }}
          >
            <div
              className="draggable-slider-left"
              onMouseDown={() => {
                moveFlag.current = true;
              }}
              onMouseMove={(e) => {
                if (moveFlag.current) {
                  if (sliderRef.current) {
                    const sliderEl = sliderRef.current;
                    const { left, width } = sliderEl.getBoundingClientRect();
                    const radio =
                      duration *
                      parseFloat(
                        Math.floor(e.clientX - left / width).toFixed(4)
                      );
                    //console.log(duration, radio, endTime);
                    setStartTime(Math.min(radio, endTime - 1));
                  }
                }
              }}
              onMouseUp={() => {
                moveFlag.current = false;
              }}
              onMouseLeave={() => {
                moveFlag.current = false;
              }}
            >
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
            <div
              className="draggable-slider-right"
              onMouseDown={() => {
                moveFlag.current = true;
              }}
              onMouseMove={(e) => {
                if (moveFlag.current) {
                  if (sliderRef.current) {
                    const sliderEl = sliderRef.current;
                    const { left, width } = sliderEl.getBoundingClientRect();
                    const radio =
                      duration *
                      parseFloat(((e.clientX - left) / width).toFixed(4));
                    //console.log(duration, radio, startTime);
                    setEndTime(Math.max(radio, startTime + 1));
                  }
                }
              }}
              onMouseUp={() => {
                moveFlag.current = false;
              }}
              onMouseLeave={() => {
                moveFlag.current = false;
              }}
            >
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
      )}
    </div>
  );
};

export default ClipVideo;

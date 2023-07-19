import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface ClipVideoProps {
  src: string;
  onClipVideo(start: number, end: number): void;
}

export const ClipVideo = ({ src, onClipVideo }: ClipVideoProps) => {
  const [startPointer, setStartPointer] = useState<number>(0);
  const [endPointer, setEndPointer] = useState<number>(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const setClipVideo = (start: number, end: number) => {
    const videoEl = videoRef.current;
    const sliderEl = sliderRef.current;
    if (videoEl && sliderEl) {
      const startTime = Math.floor(
        videoEl.duration * (start / sliderEl.offsetWidth)
      );
      const endTime = Math.floor(
        videoEl.duration * (end / sliderEl.offsetWidth)
      );
      onClipVideo(startTime, endTime);
    }
  };

  const draggableSliderLeftPointerDown: React.PointerEventHandler<
    HTMLDivElement
  > = (e) => {
    const target = e.target as HTMLDivElement;
    target.setPointerCapture(e.pointerId);
    target.onpointermove = (e) => {
      if (sliderRef.current) {
        const sliderEl = sliderRef.current;
        const { left } = sliderEl.getBoundingClientRect();
        const pointer = Math.min(Math.max(e.clientX - left, 0), endPointer);
        setStartPointer(pointer);
        setClipVideo(pointer, endPointer);
      }
    };
  };

  const draggableSliderRightPointerDown: React.PointerEventHandler<
    HTMLDivElement
  > = (e) => {
    const target = e.target as HTMLDivElement;
    target.setPointerCapture(e.pointerId);
    target.onpointermove = (e) => {
      if (sliderRef.current) {
        const sliderEl = sliderRef.current;
        const { left } = sliderEl.getBoundingClientRect();
        const pointer = Math.max(
          Math.min(e.clientX - left, sliderRef.current.offsetWidth),
          startPointer
        );
        setEndPointer(pointer);
        setClipVideo(startPointer, pointer);
      }
    };
  };

  const draggableSliderPointerUp: React.PointerEventHandler<HTMLDivElement> = (
    e
  ) => {
    const target = e.target as HTMLDivElement;
    target.releasePointerCapture(e.pointerId);
    target.onpointermove = null;
  };

  useLayoutEffect(() => {
    // 시작시간계산
    const videoEl = videoRef.current;
    const sliderEl = sliderRef.current;

    if (videoEl && sliderEl) {
      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        try {
          videoEl.pause();
          videoEl.currentTime = Math.floor(
            videoEl.duration * (startPointer / sliderEl.offsetWidth)
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [startPointer, endPointer]);

  useLayoutEffect(() => {
    // 비디오 로드를 시작하는 시점에 endPointer 설정
    if (sliderRef.current?.offsetWidth)
      setEndPointer(sliderRef.current.offsetWidth);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        controls
        src={src}
        onTimeUpdate={(e) => {
          // 종료시간계산
          const videoEl = e.target as HTMLVideoElement;
          const sliderEl = sliderRef.current;

          if (sliderEl) {
            const startTime = Math.floor(
              videoEl.duration * (startPointer / sliderEl.offsetWidth)
            );
            const endTime = Math.floor(
              videoEl.duration * (endPointer / sliderEl.offsetWidth)
            );

            if (
              videoEl.currentTime < startTime ||
              videoEl.currentTime > endTime
            ) {
              // 시간이 범위를 벗어나면 정지하고 시간을 되돌린다.
              videoEl.pause();
              videoEl.currentTime = Math.floor(
                videoEl.duration * (startPointer / sliderEl.offsetWidth)
              );
            }
          }
        }}
      />
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
            transform: `translateX(${startPointer}px)`,
            width: `${endPointer - startPointer}px`,
          }}
        >
          <div
            className="draggable-slider-left"
            onPointerDown={draggableSliderLeftPointerDown}
            onPointerUp={draggableSliderPointerUp}
            onPointerLeave={draggableSliderPointerUp}
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
            onPointerDown={draggableSliderRightPointerDown}
            onPointerUp={draggableSliderPointerUp}
            onPointerLeave={draggableSliderPointerUp}
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
    </>
  );
};

export default ClipVideo;

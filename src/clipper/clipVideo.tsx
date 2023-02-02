interface ClipVideoProps {
  src: string;
}

export const ClipVideo = ({ src }: ClipVideoProps) => {
  return <video controls src={src}></video>;
};

export default ClipVideo;
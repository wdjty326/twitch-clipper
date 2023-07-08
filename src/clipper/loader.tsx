import { useEffect, useState } from "react";
import progressProvider from "./videoEncoder/progress";

// https://codepen.io/hsucherng/pen/ndxGJq
export const Loader = () => {
  const [ratio, setRatio] = useState<number>(0);
  useEffect(() => {
    const callback = (ratio: number) => setRatio(ratio);
    progressProvider.addListener(callback);
    return () => progressProvider.removeListener(callback);
  }, []);

  return (
    <>
      <div className="loader loader-black loader-5"></div>
      <span>{ratio}%</span>
    </>
  );
};
export default Loader;

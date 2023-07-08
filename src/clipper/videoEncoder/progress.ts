type ProgressCallback = (ratio: number) => void;

/**
 * ffmpeg progress 이벤트 전파자입니다.
 */
class ProgressProvider {
  _listeners: ProgressCallback[] = [];

  addListener(callback: ProgressCallback) {
    if (!this._listeners.some((fn) => fn === callback))
      this._listeners.push(callback);
  }

  removeListener(callback: ProgressCallback) {
    const index = this._listeners.indexOf(callback);
    if (index !== -1) this._listeners.splice(index, 1);
  }
}

const progressProvider = new ProgressProvider();
export default progressProvider;

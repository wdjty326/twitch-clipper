export const getDownloadURL = async (stream: Uint8Array) => {
  const blob = new Blob([stream], { type: "video/mp4" });
  const downloadURL =
    (await new Promise<string | undefined>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        resolve(ev.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })) || URL.createObjectURL(blob);
  return downloadURL;
};

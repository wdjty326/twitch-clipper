export interface StorageData {
  tabId: number;
  dataUrl: string;
  referer?: string;
}

export const remove = async (tabId: number) => {
  await chrome.storage.local.remove([`${tabId}`]);
};

export const setter = async (data: StorageData) => {
  const key = `${data.tabId}`;
  const storage = ((await chrome.storage.local.get())[key]) || [];

  const length = storage.length + 1;
  const updateStorage = storage
    .concat([data.dataUrl])
    .slice(Math.min(0, length - 120), length);

  await chrome.storage.local.set({
    [key]: updateStorage,
  });
};

export const getter = async (tabId: number) => {
  const key = `${tabId}`;
  return ((await chrome.storage.local.get(key))[key] || []) as StorageData[];
};

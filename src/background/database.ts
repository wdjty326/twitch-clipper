const storeName = "TwitchClip";

class TwitchClipDatabase {
  db: IDBDatabase | null = null;

  constructor() {
    const request = indexedDB.open("TwitchClipDatabase", 3);

    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result;
      const store = this.db!.createObjectStore(storeName);

      store.createIndex("tabId", "tabId", { unique: false });
      store.createIndex("dump", "dump", { unique: false });
      store.createIndex("xProgramDateTime", "xProgramDateTime", {
        unique: false,
      });
    };
    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    };
  }

  insert(tabId: number, dump: Uint8Array, xProgramDateTime: string) {
    return new Promise<void>((resolve, reject) => {
      const request = this.db!.transaction(storeName, "readwrite")
        .objectStore(storeName)
        .add({
          tabId,
          dump,
          xProgramDateTime,
        });

      request.onsuccess = () => resolve();
      request.onerror = (ev) => reject(ev);
    });
  }

  delete(tabId: number, dump: Uint8Array, xProgramDateTime: string) {
    return new Promise<void>((resolve, reject) => {
      const request = this.db!.transaction(storeName, "readwrite")
        .objectStore(storeName)
        .delete(tabId);

      request.onsuccess = () => resolve();
      request.onerror = (ev) => reject(ev);
    });
  }

  select(tabId: number) {}
}

export default TwitchClipDatabase;

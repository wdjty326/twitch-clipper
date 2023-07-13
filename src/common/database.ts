const storeName = "TwitchClip";
const tempName = "TwitchClipTemp";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

class TwitchClipDatabase {
  private db: IDBDatabase | null = null;
  private waitCallbacks: VoidFunction[] = [];

  constructor() {
    const request = indexedDB.open("TwitchClipDatabase");
    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result as IDBDatabase;
      if (process.env.NODE_ENV === "development") console.log("onupgradeneeded");
      const store = this.db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("index_by_tabId", "tabId", { unique: false });
      store.createIndex("index_by_url", "url", { unique: true });

      this.db.createObjectStore(tempName, { keyPath: "windowId" });
    };
    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.waitCallbacks.forEach((waitCallback) => waitCallback());
    };
  }

  async insert(
    type: typeof storeName | typeof tempName = "TwitchClip",
    tabId: number,
    url: string,
    dump: Uint8Array,
    xProgramDateTime: string
  ) {
    if (!this.db) {
      this.waitCallbacks.push(() =>
        this.insert(type, tabId, url, dump, xProgramDateTime)
      );
      return;
    }

    try {
      // type이 TwitchClip이면 아래로직 추가
      switch (type) {
        case "TwitchClip":
          const isUpdated = await new Promise<boolean>((resolve, reject) => {
            const request = this.db!.transaction(storeName, "readonly")
              .objectStore(storeName)
              .index("index_by_url")
              .get(url);

            request.onsuccess = () => {
              if (!request.result) resolve(true);
              else resolve(false);
            };
            request.onerror = (ev) => reject(ev);
          });
          if (!isUpdated) return;

          await new Promise<boolean>((resolve, reject) => {
            const request = this.db!.transaction(storeName, "readwrite")
              .objectStore(type)
              .put({
                tabId,
                url,
                dump,
                xProgramDateTime,
              });

            request.onsuccess = () => resolve(true);
            request.onerror = (ev) => reject(ev);
          });

          await new Promise<void>((resolve) => {
            const request = this.db!.transaction(storeName, "readonly")
              .objectStore(storeName)
              .index("index_by_tabId")
              .getAll(tabId);

            request.onsuccess = async () => {
              for (const { id, xProgramDateTime } of request.result) {
                const date = new Date(xProgramDateTime);
                if (Date.now() - date.getTime() <= 10 * 60 * 1000 + 8 * 1000)
                  break; // 이전데이터제거 1패킷당 2초 + 오차 최대 8초
                await new Promise<void>((resolve, reject) => {
                  const request = this.db!.transaction(storeName, "readwrite")
                    .objectStore(storeName)
                    .delete(id);
                  request.onsuccess = () => resolve();
                  request.onerror = (ev) => reject(ev);
                });
                resolve();
              }
            };
          });
          break;
        case "TwitchClipTemp":
          await new Promise<boolean>((resolve, reject) => {
            const request = this.db!.transaction(tempName, "readwrite")
              .objectStore(type)
              .put({
                windowId: tabId,
                channelId: url,
                dump,
                xProgramDateTime,
              });

            request.onsuccess = () => resolve(true);
            request.onerror = (ev) => reject(ev);
          });
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async delete(
    type: typeof storeName | typeof tempName = "TwitchClip",
    tabId: number
  ) {
    if (!this.db) {
      this.waitCallbacks.push(() => this.delete(type, tabId));
      return;
    }

    switch (type) {
      case "TwitchClip":
        await new Promise<void>((resolve, reject) => {
          const request = this.db!.transaction(storeName, "readwrite")
            .objectStore(storeName)
            .index("index_by_tabId")
            .getAll(tabId);

          request.onsuccess = async () => {
            for (const { id } of request.result) {
              await new Promise<void>((resolve, reject) => {
                const request = this.db!.transaction(storeName, "readwrite")
                  .objectStore(storeName)
                  .delete(id);
                request.onsuccess = () => resolve();
                request.onerror = (ev) => reject(ev);
              });
            }
            resolve();
          };
          request.onerror = (ev) => reject(ev);
        });
        break;
      case "TwitchClipTemp":
        await new Promise<void>((resolve, reject) => {
          const request = this.db!.transaction(tempName, "readwrite")
            .objectStore(tempName)
            .delete(tabId);

          request.onsuccess = () => resolve();
          request.onerror = (ev) => reject(ev);
        });
        break;
    }
  }

  async select(
    type: typeof storeName | typeof tempName = "TwitchClip",
    tabId: number
  ) {
    if (!this.db) await sleep(1000);

    switch (type) {
      case "TwitchClip":
        return await new Promise<
          Array<{
            tabId: number;
            dump: Uint8Array;
            xProgramDateTime: string;
            url: string;
          }>
        >((resolve, reject) => {
          const request = this.db!.transaction(storeName, "readwrite")
            .objectStore(storeName)
            .index("index_by_tabId")
            .getAll(tabId);

          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onerror = (ev) => reject(ev);
        });
      case "TwitchClipTemp":
        return await new Promise<{
          windowId: number;
          dump: Uint8Array;
          xProgramDateTime: string;
          channelId: string;
        }>((resolve, reject) => {
          const request = this.db!.transaction(tempName, "readwrite")
            .objectStore(tempName)
            .get(tabId);

          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onerror = (ev) => reject(ev);
        });
    }
  }

  async clear(type: typeof storeName | typeof tempName = "TwitchClip") {
    if (!this.db) {
      this.waitCallbacks.push(() => this.clear(type));
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const request = this.db!.transaction(type, "readwrite")
        .objectStore(type)
        .clear();

      request.onsuccess = () => resolve();
      request.onerror = (ev) => reject(ev);
    });
  }
}

const database = new TwitchClipDatabase();
export default database;

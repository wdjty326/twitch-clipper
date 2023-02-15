const storeName = "TwitchClip";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

class TwitchClipDatabase {
  private db: IDBDatabase | null = null;
  private waitFunc: Array<VoidFunction> = [];

  constructor() {
    const request = indexedDB.open("TwitchClipDatabase", 3);
    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result as IDBDatabase;
      const store = this.db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("index_by_tabId", "tabId", { unique: false });
      store.createIndex("index_by_url", "url", { unique: true });
      this.waitFunc.forEach((func) => func());
    };
    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.waitFunc.forEach((func) => func());
    };
  }

  async insert(
    tabId: number,
    url: string,
    dump: Uint8Array,
    xProgramDateTime: string
  ) {
    if (!this.db) {
      this.waitFunc.push(() => this.insert(tabId, url, dump, xProgramDateTime));
      return;
    }

    try {
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

      // 데이터 저장
      const insert = await new Promise<boolean>((resolve, reject) => {
        const request = this.db!.transaction(storeName, "readwrite")
          .objectStore(storeName)
          .add({
            tabId,
            url,
            dump,
            xProgramDateTime,
          });

        request.onsuccess = () => resolve(true);
        request.onerror = (ev) => reject(ev);
      });

      // 이전데이터 제거
      return await new Promise<number>((resolve) => {
        const request = this.db!.transaction(storeName, "readonly")
          .objectStore(storeName)
          .index("index_by_tabId")
          .getAll(tabId);

        request.onsuccess = async () => {
          let n = 0;
          for (const { id, xProgramDateTime } of request.result) {
            if (n++ >= request.result.length - 300) break; // 이전데이터제거 1패킷당 2초
            await new Promise<void>((resolve, reject) => {
              const request = this.db!.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .delete(id);
              request.onsuccess = () => resolve();
              request.onerror = (ev) => reject(ev);
            });
            resolve(n);
          }
        };
      });
    } catch (e) {
      console.error(e);
    }
  }

  async delete(tabId: number) {
    if (!this.db) {
      this.waitFunc.push(() => this.delete(tabId));
      return;
    }

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
  }

  async selectAll(tabId: number) {
    if (!this.db) await sleep(1000);

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
  }

  async clear() {
    if (!this.db) {
      this.waitFunc.push(() => this.clear());
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const request = this.db!.transaction(storeName, "readwrite")
        .objectStore(storeName)
        .clear();

      request.onsuccess = () => resolve();
      request.onerror = (ev) => reject(ev);
    });
  }
}

const database = new TwitchClipDatabase();
export default database;

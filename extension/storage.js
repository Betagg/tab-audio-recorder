(function () {
  const DB_NAME = "tab-audio-recorder";
  const DB_VERSION = 1;
  const STORE_NAME = "recordings";
  const LATEST_KEY = "latest";
  const HISTORY_PREFIX = "history:";
  const HISTORY_LIMIT = 50;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function withStore(mode, callback) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      let result;

      try {
        result = callback(store);
      } catch (error) {
        db.close();
        reject(error);
        return;
      }

      transaction.oncomplete = () => {
        db.close();
        resolve(result);
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
      transaction.onabort = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveLatestRecording(blob, metadata) {
    await withStore("readwrite", (store) => {
      store.put({
        id: LATEST_KEY,
        blob,
        metadata,
        savedAt: Date.now(),
      });
    });
  }

  async function getLatestRecording() {
    return await withStore("readonly", (store) => {
      return requestToPromise(store.get(LATEST_KEY));
    });
  }

  async function clearLatestRecording() {
    await withStore("readwrite", (store) => {
      store.delete(LATEST_KEY);
    });
  }

  async function addHistoryEntry(metadata, filename) {
    const savedAt = Date.now();
    const entry = {
      id: `${HISTORY_PREFIX}${savedAt}`,
      type: "history",
      savedAt,
      title: metadata?.title || "Untitled recording",
      url: metadata?.url || "",
      hostname: metadata?.hostname || "",
      category: metadata?.category || "Audio",
      durationMs: metadata?.durationMs || 0,
      originalDurationMs: metadata?.originalDurationMs || metadata?.durationMs || 0,
      trimStartMs: metadata?.trimStartMs || 0,
      trimEndMs: metadata?.trimEndMs || metadata?.durationMs || 0,
      trimmed: Boolean(metadata?.trimmed),
      filename: filename || metadata?.suggestedFilename || "tab-audio-recording.mp3",
    };

    await withStore("readwrite", (store) => {
      store.put(entry);
    });
    await trimHistory();
    return entry;
  }

  async function getHistoryEntries() {
    const records = await withStore("readonly", (store) => {
      return requestToPromise(store.getAll());
    });

    return (records || [])
      .filter((record) => record.id && record.id.startsWith(HISTORY_PREFIX))
      .sort((a, b) => b.savedAt - a.savedAt);
  }

  async function clearHistoryEntries() {
    const entries = await getHistoryEntries();
    await withStore("readwrite", (store) => {
      for (const entry of entries) {
        store.delete(entry.id);
      }
    });
  }

  async function trimHistory() {
    const entries = await getHistoryEntries();
    const expired = entries.slice(HISTORY_LIMIT);
    if (expired.length === 0) {
      return;
    }

    await withStore("readwrite", (store) => {
      for (const entry of expired) {
        store.delete(entry.id);
      }
    });
  }

  window.TabAudioRecorderStorage = {
    addHistoryEntry,
    clearLatestRecording,
    clearHistoryEntries,
    getHistoryEntries,
    getLatestRecording,
    saveLatestRecording,
  };
})();

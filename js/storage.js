window.VP = window.VP || {};

(function (VP) {
  const KEY = "vacationPlanner.plan";
  const IDB_NAME = "vacationPlanner.fs";
  const IDB_STORE = "handles";
  const IDB_HANDLE_KEY = "planFile";

  let planHandle = null;

  function fileName() {
    const from = VP.PlanYears ? VP.PlanYears.FROM : 2026;
    const to = VP.PlanYears ? VP.PlanYears.TO : 2036;
    return "vacation-plan-" + from + "-" + to + ".json";
  }

  function supportsFsAccess() {
    return window.isSecureContext && typeof window.showOpenFilePicker === "function";
  }

  function hasPlanFile() {
    return !!planHandle;
  }

  function planFileLabel() {
    return planHandle && planHandle.name ? planHandle.name : "";
  }

  function saveLocal(document) {
    try {
      localStorage.setItem(KEY, JSON.stringify(document.toJSON()));
    } catch (_) {
      /* ignore */
    }
  }

  function openIdb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
    });
  }

  async function storeHandle(handle) {
    const db = await openIdb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(handle, IDB_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Could not store file handle"));
    });
    db.close();
  }

  async function loadStoredHandle() {
    try {
      const db = await openIdb();
      const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const req = tx.objectStore(IDB_STORE).get(IDB_HANDLE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Could not read file handle"));
      });
      db.close();
      return handle || null;
    } catch (_) {
      return null;
    }
  }

  async function ensurePermission(handle, mode) {
    if (!handle) return false;
    const opts = { mode: mode || "readwrite" };
    if ((await handle.queryPermission(opts)) === "granted") return true;
    if ((await handle.requestPermission(opts)) === "granted") return true;
    return false;
  }

  async function readHandle(handle) {
    const file = await handle.getFile();
    const text = await file.text();
    const doc = VP.PlanDocument.fromJSON(text);
    saveLocal(doc);
    return doc;
  }

  async function writeHandle(handle, plan) {
    const body = JSON.stringify(plan.toJSON(), null, 2) + "\n";
    const writable = await handle.createWritable();
    await writable.write(body);
    await writable.close();
    saveLocal(plan);
  }

  async function load() {
    if (!window.isSecureContext) {
      const sample = VP.createSample();
      saveLocal(sample);
      return {
        document: sample,
        warning:
          "This build needs HTTPS (or localhost).\n" +
          "Host the HTTPS-Hosting folder online and open it in Chrome or Edge.",
        needsFile: true
      };
    }

    if (!supportsFsAccess()) {
      const sample = VP.createSample();
      saveLocal(sample);
      return {
        document: sample,
        warning:
          "This browser cannot bind a local plan file.\n" +
          "Please use Chrome or Edge.",
        needsFile: true
      };
    }

    const stored = await loadStoredHandle();
    if (stored) {
      try {
        if (await ensurePermission(stored, "readwrite")) {
          planHandle = stored;
          const document = await readHandle(stored);
          return { document: document, warning: null, needsFile: false };
        }
      } catch (err) {
        planHandle = null;
        return {
          document: VP.createSample(),
          warning:
            "Could not reopen the previous plan file.\n" +
            "Click “Open plan file” and choose " +
            fileName() +
            " on the team drive.\n\n" +
            (err && err.message ? err.message : err),
          needsFile: true
        };
      }
    }

    const sample = VP.createSample();
    saveLocal(sample);
    return {
      document: sample,
      warning:
        "Choose the shared plan file on your team drive.\n" +
        "Click “Open plan file” and select " +
        fileName() +
        ".",
      needsFile: true
    };
  }

  async function openPlanFile() {
    if (!supportsFsAccess()) {
      throw new Error("File binding requires Chrome or Edge over HTTPS/localhost.");
    }
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: "Vacation plan JSON",
          accept: { "application/json": [".json"] }
        }
      ]
    });
    if (!(await ensurePermission(handle, "readwrite"))) {
      throw new Error("Permission to read/write the plan file was denied.");
    }
    const document = await readHandle(handle);
    planHandle = handle;
    await storeHandle(handle);
    return document;
  }

  async function saveShared(plan) {
    if (!planHandle) {
      throw new Error("No plan file selected. Click “Open plan file” first.");
    }
    if (!(await ensurePermission(planHandle, "readwrite"))) {
      throw new Error("Permission to write the plan file was denied.");
    }
    await writeHandle(planHandle, plan);
    return true;
  }

  VP.Storage = {
    KEY,
    load,
    save: saveLocal,
    saveShared,
    openPlanFile,
    fileName,
    supportsFsAccess,
    hasPlanFile,
    planFileLabel
  };
})(window.VP);

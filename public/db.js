// db.js — IndexedDB wrapper for Real Tree Guy OS

const DB_NAME = "RealTreeGuyDB";
const DB_VERSION = 1;
const STORE = "users";

// =========================
// OWNER ACCOUNT (PUT YOURS HERE)
// =========================
const OWNER_EMAIL = "boardwalkclay1@gmail.com";
const OWNER_PASSWORD = "Always/6";
// ================================================================

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "email" });

        // =========================
        // AUTO‑CREATE OWNER ACCOUNT
        // =========================
        store.put({
          email: OWNER_EMAIL,
          password: OWNER_PASSWORD,
          role: "treeguy",
          hasPaidAccess: true
        });
      }
    };

    request.onsuccess = async () => {
      const db = request.result;

      // Ensure owner exists even after DB already created
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);

      store.get(OWNER_EMAIL).onsuccess = (e) => {
        if (!e.target.result) {
          store.put({
            email: OWNER_EMAIL,
            password: OWNER_PASSWORD,
            role: "treeguy",
            hasPaidAccess: true
          });
        }
      };

      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getUser(email) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(email);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function saveUser(user) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(user);
    tx.oncomplete = () => resolve(true);
  });
}

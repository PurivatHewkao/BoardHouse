const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || "local";
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const apiCache = new Map();

export const dataSourceSyncedEvent = "boardhouse:data-source-synced";

export function getDataSourceInfo() {
  return {
    mode: DATA_SOURCE,
    apiBaseUrl: API_BASE_URL,
    usesApi: DATA_SOURCE === "api" && Boolean(API_BASE_URL),
  };
}

function canUseLocalStorage() {
  return typeof localStorage !== "undefined";
}

function readLocalValue(key, fallback) {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  const savedValue = localStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : fallback;
}

function writeLocalValue(key, value) {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function removeLocalValue(key) {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.removeItem(key);
}

function hasLocalValue(key) {
  return canUseLocalStorage() && localStorage.getItem(key) !== null;
}

function apiUrl(key) {
  return `${API_BASE_URL}/api/storage/${encodeURIComponent(key)}`;
}

function storageApiUrl() {
  return `${API_BASE_URL}/api/storage`;
}

function shouldSyncApi() {
  return DATA_SOURCE === "api" && Boolean(API_BASE_URL) && typeof fetch !== "undefined";
}

function syncWriteToApi(key, value) {
  if (!shouldSyncApi()) {
    return;
  }

  fetch(apiUrl(key), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  }).catch(() => {
    // Keep the app usable if the local server is temporarily unavailable.
  });
}

function syncRemoveFromApi(key) {
  if (!shouldSyncApi()) {
    return;
  }

  fetch(apiUrl(key), { method: "DELETE" }).catch(() => {
    // Keep the app usable if the local server is temporarily unavailable.
  });
}

export function readData(key, fallback) {
  if (shouldSyncApi()) {
    return apiCache.has(key) ? apiCache.get(key) : fallback;
  }

  try {
    return readLocalValue(key, fallback);
  } catch {
    removeLocalValue(key);
    return fallback;
  }
}

export function writeData(key, value) {
  if (shouldSyncApi()) {
    apiCache.set(key, value);
    syncWriteToApi(key, value);
    return;
  }

  try {
    writeLocalValue(key, value);
    syncWriteToApi(key, value);
  } catch {
    // Keep the mock app usable even if browser storage is blocked.
  }
}

export function removeData(key) {
  if (shouldSyncApi()) {
    apiCache.delete(key);
    syncRemoveFromApi(key);
    return;
  }

  try {
    removeLocalValue(key);
    syncRemoveFromApi(key);
  } catch {
    // Keep the mock app usable even if browser storage is blocked.
  }
}

export function hasData(key) {
  if (shouldSyncApi()) {
    return apiCache.has(key);
  }

  try {
    return hasLocalValue(key);
  } catch {
    return false;
  }
}

export function clearData(keys) {
  keys.forEach((key) => removeData(key));
}

export async function syncDataFromApi(keys) {
  if (!shouldSyncApi()) {
    return false;
  }

  let changed = false;
  const response = await fetch(storageApiUrl());

  if (!response.ok) {
    return false;
  }

  const payload = await response.json();
  const storage = payload?.storage || {};

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(storage, key)) {
      const currentJson = JSON.stringify(apiCache.get(key));
      const nextJson = JSON.stringify(storage[key]);

      if (currentJson !== nextJson) {
        apiCache.set(key, storage[key]);
        changed = true;
      }
    }
  });

  if (changed && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(dataSourceSyncedEvent));
  }

  return changed;
}

export async function resetApiData() {
  if (!shouldSyncApi()) {
    return false;
  }

  const response = await fetch(`${storageApiUrl()}/reset`, { method: "POST" });

  if (!response.ok) {
    return false;
  }

  const payload = await response.json();
  const storage = payload?.storage || {};

  apiCache.clear();
  Object.entries(storage).forEach(([key, value]) => {
    apiCache.set(key, value);
  });

  return true;
}

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || "local";
const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_BASE_URL = resolveApiBaseUrl();
const apiCache = new Map();
const sessionOnlyKeys = new Set(["boardhouse-current-user"]);

export const dataSourceSyncedEvent = "boardhouse:data-source-synced";

export function getDataSourceInfo() {
  return {
    mode: DATA_SOURCE,
    apiBaseUrl: API_BASE_URL,
    usesApi: DATA_SOURCE === "api" && Boolean(API_BASE_URL),
  };
}

function resolveApiBaseUrl() {
  if (CONFIGURED_API_BASE_URL && CONFIGURED_API_BASE_URL !== "auto") {
    return CONFIGURED_API_BASE_URL;
  }

  if (DATA_SOURCE !== "api" || typeof window === "undefined") {
    return "";
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

function canUseLocalStorage() {
  return typeof localStorage !== "undefined";
}

function canUseSessionStorage() {
  return typeof sessionStorage !== "undefined";
}

function isSessionOnlyKey(key) {
  return sessionOnlyKeys.has(key);
}

function removeLegacyLocalValue(key) {
  try {
    removeLocalValue(key);
  } catch {
    // Ignore stale localStorage cleanup failures.
  }
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

function readSessionValue(key, fallback) {
  if (!canUseSessionStorage()) {
    return fallback;
  }

  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : fallback;
}

function writeSessionValue(key, value) {
  if (!canUseSessionStorage()) {
    return;
  }

  sessionStorage.setItem(key, JSON.stringify(value));
}

function removeSessionValue(key) {
  if (!canUseSessionStorage()) {
    return;
  }

  sessionStorage.removeItem(key);
}

function hasSessionValue(key) {
  return canUseSessionStorage() && sessionStorage.getItem(key) !== null;
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
  if (isSessionOnlyKey(key)) {
    removeLegacyLocalValue(key);

    try {
      return readSessionValue(key, fallback);
    } catch {
      removeSessionValue(key);
      return fallback;
    }
  }

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
  if (isSessionOnlyKey(key)) {
    removeLegacyLocalValue(key);

    try {
      writeSessionValue(key, value);
    } catch {
      // Keep the mock app usable even if browser session storage is blocked.
    }

    return;
  }

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
  if (isSessionOnlyKey(key)) {
    removeLegacyLocalValue(key);

    try {
      removeSessionValue(key);
    } catch {
      // Keep the mock app usable even if browser session storage is blocked.
    }

    return;
  }

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
  if (isSessionOnlyKey(key)) {
    try {
      return hasSessionValue(key);
    } catch {
      return false;
    }
  }

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
    if (isSessionOnlyKey(key)) {
      return;
    }

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
    if (isSessionOnlyKey(key)) {
      return;
    }

    apiCache.set(key, value);
  });

  return true;
}

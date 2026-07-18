import { seedData, seedVersion, storageKeys } from "../data/seedData.js";

export { storageKeys };

export function readStorage(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the mock app usable even if browser storage is blocked.
  }
}

function clearAndStampVersion() {
  Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
  writeStorage(storageKeys.seedVersion, seedVersion);
}

function fillMissingKeys() {
  Object.entries(seedData).forEach(([key, value]) => {
    if (localStorage.getItem(key) === null) {
      writeStorage(key, value);
    }
  });
}

export function seedStorage() {
  try {
    // ของเก่าที่ค้างในเบราว์เซอร์คนละเวอร์ชันกับ seed ปัจจุบัน จะขาด user/role ที่เพิ่งเพิ่ม เลยต้องล้างก่อน
    if (readStorage(storageKeys.seedVersion, 0) !== seedVersion) {
      clearAndStampVersion();
    }

    fillMissingKeys();
  } catch {
    // Keep rendering even if localStorage is unavailable.
  }
}

export function resetStorage() {
  try {
    clearAndStampVersion();
    fillMissingKeys();
  } catch {
    // Keep rendering even if localStorage is unavailable.
  }
}

import { seedData, storageKeys } from "../data/seedData.js";

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

export function seedStorage() {
  try {
    Object.entries(seedData).forEach(([key, value]) => {
      if (localStorage.getItem(key) === null) {
        writeStorage(key, value);
      }
    });
  } catch {
    // Keep rendering even if localStorage is unavailable.
  }
}

export function resetStorage() {
  try {
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
    seedStorage();
  } catch {
    // Keep rendering even if localStorage is unavailable.
  }
}

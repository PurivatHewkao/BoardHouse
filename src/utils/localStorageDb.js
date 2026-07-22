import { seedData, seedVersion, storageKeys } from "../data/seedData.js";
import {
  clearData,
  getDataSourceInfo,
  hasData,
  readData,
  resetApiData,
  syncDataFromApi,
  writeData,
} from "../services/dataSource.js";

export { storageKeys };

export function readStorage(key, fallback) {
  return readData(key, fallback);
}

export function writeStorage(key, value) {
  writeData(key, value);
}

function clearAndStampVersion() {
  clearData(Object.values(storageKeys));
  writeStorage(storageKeys.seedVersion, seedVersion);
}

function fillMissingKeys() {
  Object.entries(seedData).forEach(([key, value]) => {
    if (!hasData(key)) {
      writeStorage(key, value);
    }
  });
}

export async function seedStorage() {
  try {
    if (getDataSourceInfo().usesApi) {
      const synced = await syncDataFromApi(Object.values(storageKeys));

      if (!synced) {
        fillMissingKeys();
      }

      return;
    }

    // ของเก่าที่ค้างในเบราว์เซอร์คนละเวอร์ชันกับ seed ปัจจุบัน จะขาด user/role ที่เพิ่งเพิ่ม เลยต้องล้างก่อน
    if (readStorage(storageKeys.seedVersion, 0) !== seedVersion) {
      clearAndStampVersion();
    }

    fillMissingKeys();
  } catch {
    fillMissingKeys();
  }
}

export async function resetStorage() {
  try {
    if (getDataSourceInfo().usesApi) {
      const reset = await resetApiData();

      if (reset) {
        return;
      }
    }

    clearAndStampVersion();
    fillMissingKeys();
  } catch {
    // Keep rendering even if localStorage is unavailable.
  }
}

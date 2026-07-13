import { currentUser as defaultCurrentUser, users as defaultUsers } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";
import { ROLES } from "./roles.js";

export function getUsers() {
  const users = readStorage(storageKeys.users, defaultUsers);
  return Array.isArray(users) ? users : defaultUsers;
}

export function saveUsers(users) {
  writeStorage(storageKeys.users, users);
}

export function getCurrentUser() {
  return readStorage(storageKeys.currentUser, defaultCurrentUser);
}

export function setCurrentUser(user) {
  writeStorage(storageKeys.currentUser, user);
}

export function logoutUser() {
  writeStorage(storageKeys.currentUser, null);
}

export function loginUser(email, password) {
  const user = getUsers().find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
  );

  if (user) {
    setCurrentUser(user);
  }

  return user || null;
}

export function registerUser({ name, email, password, phone = "", address = null }) {
  const users = getUsers();
  const duplicatedUser = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (duplicatedUser) {
    return { ok: false, message: "Email is already registered.", users };
  }

  const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  // สมัครใหม่เป็น customer เสมอ — สิทธิ์ admin กำหนดจากฝั่งระบบเท่านั้น ยกระดับตัวเองไม่ได้
  const user = { id: nextId, role: ROLES.CUSTOMER, name, email, password, phone, address };
  const nextUsers = [...users, user];
  saveUsers(nextUsers);
  setCurrentUser(user);

  return { ok: true, message: "Registered successfully.", user, users: nextUsers };
}

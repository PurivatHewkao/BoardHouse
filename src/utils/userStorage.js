import { users as defaultUsers } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";
import { canManageAdmins, isSuperAdmin, ROLES } from "./roles.js";

export function getUsers() {
  const users = readStorage(storageKeys.users, defaultUsers);
  return Array.isArray(users) ? users : defaultUsers;
}

export function saveUsers(users) {
  writeStorage(storageKeys.users, users);
}

export function getCurrentUser() {
  return readStorage(storageKeys.currentUser, null);
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
  const user = { id: nextId, role: ROLES.CUSTOMER, name, email, password, phone, address, addresses: [] };
  const nextUsers = [...users, user];
  saveUsers(nextUsers);
  setCurrentUser(user);

  return { ok: true, message: "Registered successfully.", user, users: nextUsers };
}

// แก้โปรไฟล์ตัวเอง (C02) — แก้ได้เฉพาะบัญชีที่ล็อกอินอยู่เท่านั้น
// role/id เปลี่ยนจากตรงนี้ไม่ได้ ต่อให้ส่ง field พวกนั้นมาก็โดนทิ้ง
export function updateProfile(actor, { name, email, phone = "", address = null }) {
  const users = getUsers();

  if (!actor) {
    return { ok: false, message: "Please log in first.", users };
  }

  const current = users.find((user) => user.id === actor.id);

  if (!current) {
    return { ok: false, message: "User not found.", users };
  }

  if (!name?.trim() || !email?.trim()) {
    return { ok: false, message: "Name and email are required.", users };
  }

  const duplicatedEmail = users.some(
    (user) => user.id !== current.id && user.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (duplicatedEmail) {
    return { ok: false, message: "Email is already registered.", users };
  }

  const updatedUser = {
    ...current,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address ? { ...address } : null,
  };
  const nextUsers = users.map((user) => (user.id === current.id ? updatedUser : user));
  saveUsers(nextUsers);
  setCurrentUser(updatedUser);

  return { ok: true, message: "Profile updated.", user: updatedUser, users: nextUsers };
}

// เปลี่ยนรหัสผ่านตัวเอง ต้องยืนยันรหัสเดิมก่อนเสมอ
export function changePassword(actor, { currentPassword, nextPassword }) {
  const users = getUsers();

  if (!actor) {
    return { ok: false, message: "Please log in first.", users };
  }

  const current = users.find((user) => user.id === actor.id);

  if (!current) {
    return { ok: false, message: "User not found.", users };
  }

  if (current.password !== currentPassword) {
    return { ok: false, message: "Your current password is incorrect.", users };
  }

  if (!nextPassword || nextPassword.length < 6) {
    return { ok: false, message: "New password must be at least 6 characters.", users };
  }

  const updatedUser = { ...current, password: nextPassword };
  const nextUsers = users.map((user) => (user.id === current.id ? updatedUser : user));
  saveUsers(nextUsers);
  setCurrentUser(updatedUser);

  return { ok: true, message: "Password changed.", user: updatedUser, users: nextUsers };
}

// บันทึกที่อยู่จัดส่งใหม่ลงในโปรไฟล์ผู้ใช้ (address book) เพื่อให้เลือกใช้ตอนจ่ายเงินได้ในครั้งถัดไป
export function addAddressToUser(userId, address) {
  const users = getUsers();
  let savedUser = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    const existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    const nextId = existingAddresses.length ? Math.max(...existingAddresses.map((item) => item.id)) + 1 : 1;
    const nextAddress = { id: nextId, label: "Home", ...address };
    savedUser = { ...user, addresses: [...existingAddresses, nextAddress] };
    return savedUser;
  });

  saveUsers(nextUsers);

  return savedUser;
}
export function getAdmins() {
  return getUsers().filter((user) => user.role === ROLES.ADMIN || isSuperAdmin(user));
}

// ทุก helper ด้านล่างรับ actor (คนที่กดสั่ง) มาเช็คสิทธิ์เสมอ
// กติกา: มีแค่ super admin ที่จัดการ admin ได้, ห้ามแตะบัญชี super admin, และห้ามแตะตัวเอง
function guardAdminAction(actor, targetId, users) {
  if (!canManageAdmins(actor)) {
    return { ok: false, message: "Only a Super Admin can manage admins.", users };
  }

  const target = users.find((user) => user.id === targetId);

  if (!target) {
    return { ok: false, message: "User not found.", users };
  }

  if (isSuperAdmin(target)) {
    return { ok: false, message: "A Super Admin account cannot be modified.", users };
  }

  if (target.id === actor.id) {
    return { ok: false, message: "You cannot change your own account.", users };
  }

  return { ok: true, target };
}

export function createAdmin({ actor, name, email, password, phone = "" }) {
  const users = getUsers();

  if (!canManageAdmins(actor)) {
    return { ok: false, message: "Only a Super Admin can manage admins.", users };
  }

  if (!name || !email || !password) {
    return { ok: false, message: "Name, email and password are required.", users };
  }

  const duplicatedUser = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (duplicatedUser) {
    return { ok: false, message: "Email is already registered.", users };
  }

  const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  const user = { id: nextId, role: ROLES.ADMIN, name, email, password, phone, address: null };
  const nextUsers = [...users, user];
  saveUsers(nextUsers);

  return { ok: true, message: `Added "${name}" as an admin.`, user, users: nextUsers };
}

export function promoteToAdmin(actor, userId) {
  const users = getUsers();
  const guard = guardAdminAction(actor, userId, users);

  if (!guard.ok) {
    return guard;
  }

  if (guard.target.role === ROLES.ADMIN) {
    return { ok: false, message: `"${guard.target.name}" is already an admin.`, users };
  }

  const nextUsers = users.map((user) =>
    user.id === userId ? { ...user, role: ROLES.ADMIN } : user
  );
  saveUsers(nextUsers);

  return { ok: true, message: `Promoted "${guard.target.name}" to admin.`, users: nextUsers };
}

export function demoteToCustomer(actor, userId) {
  const users = getUsers();
  const guard = guardAdminAction(actor, userId, users);

  if (!guard.ok) {
    return guard;
  }

  if (guard.target.role === ROLES.CUSTOMER) {
    return { ok: false, message: `"${guard.target.name}" is already a customer.`, users };
  }

  const nextUsers = users.map((user) =>
    user.id === userId ? { ...user, role: ROLES.CUSTOMER } : user
  );
  saveUsers(nextUsers);

  return { ok: true, message: `Demoted "${guard.target.name}" to customer.`, users: nextUsers };
}

export function deleteAdmin(actor, userId) {
  const users = getUsers();
  const guard = guardAdminAction(actor, userId, users);

  if (!guard.ok) {
    return guard;
  }

  if (guard.target.role !== ROLES.ADMIN) {
    return { ok: false, message: "This user is not an admin.", users };
  }

  const nextUsers = users.filter((user) => user.id !== userId);
  saveUsers(nextUsers);

  return { ok: true, message: `Removed admin "${guard.target.name}".`, users: nextUsers };
}

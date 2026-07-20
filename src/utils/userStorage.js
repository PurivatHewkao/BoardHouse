import { users as defaultUsers } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";
import { canManageAdmins, isSuperAdmin, ROLES } from "./roles.js";
import { validateAddress, validateEmail, validateName, validatePhone } from "./validation.js";

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

  // ตรวจสอบข้อมูลให้ถูกต้องก่อนสมัคร (ชื่อ/อีเมล/เบอร์ต้องเป็นรูปแบบจริง)
  const nameError = validateName(name);
  if (nameError) {
    return { ok: false, message: nameError, users };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { ok: false, message: emailError, users };
  }

  if (!password || password.length < 6) {
    return { ok: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", users };
  }

  const phoneError = validatePhone(phone, { required: false });
  if (phoneError) {
    return { ok: false, message: phoneError, users };
  }

  const duplicatedUser = users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase());

  if (duplicatedUser) {
    return { ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว", users };
  }

  const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  // สมัครใหม่เป็น customer เสมอ — สิทธิ์ admin กำหนดจากฝั่งระบบเท่านั้น ยกระดับตัวเองไม่ได้
  const user = { id: nextId, role: ROLES.CUSTOMER, name: name.trim(), email: email.trim(), password, phone: phone.trim(), address, addresses: [] };
  const nextUsers = [...users, user];
  saveUsers(nextUsers);
  setCurrentUser(user);

  return { ok: true, message: "Registered successfully.", user, users: nextUsers };
}

// แก้โปรไฟล์ตัวเอง (C02) — แก้ได้เฉพาะบัญชีที่ล็อกอินอยู่เท่านั้น
// role/id เปลี่ยนจากตรงนี้ไม่ได้ ต่อให้ส่ง field พวกนั้นมาก็โดนทิ้ง
// ที่อยู่ไม่ได้แก้จากตรงนี้แล้ว — ใช้ address book (saveUserAddress ฯลฯ) แทน
export function updateProfile(actor, { name, email, phone = "" }) {
  const users = getUsers();

  if (!actor) {
    return { ok: false, message: "Please log in first.", users };
  }

  const current = users.find((user) => user.id === actor.id);

  if (!current) {
    return { ok: false, message: "User not found.", users };
  }

  // ตรวจสอบข้อมูลก่อนบันทึกทุกครั้ง — ชื่อ/อีเมล/เบอร์ต้องถูกต้องตามรูปแบบ
  const nameError = validateName(name);
  if (nameError) {
    return { ok: false, message: nameError, users };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { ok: false, message: emailError, users };
  }

  const phoneError = validatePhone(phone, { required: false });
  if (phoneError) {
    return { ok: false, message: phoneError, users };
  }

  const duplicatedEmail = users.some(
    (user) => user.id !== current.id && user.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (duplicatedEmail) {
    return { ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว", users };
  }

  const updatedUser = {
    ...current,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
  };
  const nextUsers = users.map((user) => (user.id === current.id ? updatedUser : user));
  saveUsers(nextUsers);
  setCurrentUser(updatedUser);

  return { ok: true, message: "บันทึกข้อมูลเรียบร้อยแล้ว", user: updatedUser, users: nextUsers };
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

// ===== Address book (สมุดที่อยู่หลายรายการ เหมือนแอปซื้อของ) =====
// user.addresses = แหล่งข้อมูลจริง (มีได้หลายที่อยู่ + ระบุ isDefault ได้ 1 อัน)
// user.address = สำเนาของที่อยู่ default ไว้เผื่อโค้ดเก่า/ตอน checkout ที่ยังอ้างถึง

function getAddressList(user) {
  const list = Array.isArray(user?.addresses) ? user.addresses : [];

  // ย้ายข้อมูลที่อยู่เดี่ยวแบบเก่า (user.address) เข้าสมุดที่อยู่อัตโนมัติ ถ้ายังไม่มีในลิสต์
  if (list.length === 0 && user?.address && user.address.line1) {
    return [
      {
        id: 1,
        isDefault: true,
        label: user.address.label || "Home",
        recipientName: user.address.recipientName || user.name || "",
        phone: user.address.phone || user.phone || "",
        line1: user.address.line1 || "",
        district: user.address.district || "",
        province: user.address.province || "",
        postalCode: user.address.postalCode || "",
      },
    ];
  }

  return list;
}

// อ่านรายการที่อยู่ของผู้ใช้ (พร้อม migrate ที่อยู่แบบเก่าให้อัตโนมัติ) — ใช้แสดงผลในหน้า Profile
export function getUserAddresses(user) {
  return getAddressList(user);
}

function pickDefaultAddress(addresses) {
  if (!addresses || addresses.length === 0) {
    return null;
  }
  return addresses.find((item) => item.isDefault) || addresses[0];
}

// เขียน addresses กลับเข้า user พร้อมอัปเดตสำเนา default (user.address) ให้ตรงกันเสมอ
function commitAddresses(userId, buildNextAddresses) {
  const users = getUsers();
  let savedUser = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    let nextAddresses = buildNextAddresses(getAddressList(user));

    // ต้องมีที่อยู่ default เสมอ 1 อัน ถ้ายังมีที่อยู่เหลืออยู่
    if (nextAddresses.length > 0 && !nextAddresses.some((item) => item.isDefault)) {
      nextAddresses = nextAddresses.map((item, index) => ({ ...item, isDefault: index === 0 }));
    }

    const def = pickDefaultAddress(nextAddresses);
    savedUser = {
      ...user,
      addresses: nextAddresses,
      address: def ? { ...def } : null,
    };
    return savedUser;
  });

  saveUsers(nextUsers);

  // ถ้าคนที่แก้คือผู้ใช้ที่ล็อกอินอยู่ ให้ sync session ด้วย
  const current = getCurrentUser();
  if (savedUser && current && current.id === savedUser.id) {
    setCurrentUser(savedUser);
  }

  return savedUser;
}

// เพิ่ม/แก้ไขที่อยู่ 1 รายการ (self-service — actor ต้องเป็นเจ้าของบัญชี)
export function saveUserAddress(actor, address) {
  if (!actor) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const check = validateAddress(address);
  if (!check.ok) {
    return { ok: false, message: check.message };
  }

  const savedUser = commitAddresses(actor.id, (list) => {
    const makeDefault = Boolean(address.isDefault) || list.length === 0;
    // ถ้าตั้งอันนี้เป็น default ต้องปลด default ของอันอื่น
    const cleared = makeDefault ? list.map((item) => ({ ...item, isDefault: false })) : list;

    if (address.id) {
      // แก้ไขที่อยู่เดิม
      return cleared.map((item) =>
        item.id === address.id ? { ...item, ...address, isDefault: makeDefault || item.isDefault } : item
      );
    }

    // เพิ่มที่อยู่ใหม่
    const nextId = list.length ? Math.max(...list.map((item) => Number(item.id) || 0)) + 1 : 1;
    return [...cleared, { ...address, id: nextId, isDefault: makeDefault }];
  });

  if (!savedUser) {
    return { ok: false, message: "ไม่พบบัญชีผู้ใช้" };
  }

  return { ok: true, message: "บันทึกที่อยู่เรียบร้อยแล้ว", user: savedUser };
}

export function deleteUserAddress(actor, addressId) {
  if (!actor) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const savedUser = commitAddresses(actor.id, (list) => list.filter((item) => item.id !== addressId));

  if (!savedUser) {
    return { ok: false, message: "ไม่พบบัญชีผู้ใช้" };
  }

  return { ok: true, message: "ลบที่อยู่เรียบร้อยแล้ว", user: savedUser };
}

export function setDefaultUserAddress(actor, addressId) {
  if (!actor) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const savedUser = commitAddresses(actor.id, (list) =>
    list.map((item) => ({ ...item, isDefault: item.id === addressId }))
  );

  if (!savedUser) {
    return { ok: false, message: "ไม่พบบัญชีผู้ใช้" };
  }

  return { ok: true, message: "ตั้งเป็นที่อยู่หลักแล้ว", user: savedUser };
}

// ใช้ตอน checkout เมื่อกรอกที่อยู่ใหม่แล้วติ๊ก "บันทึกไว้ใช้ครั้งหน้า" — เพิ่มเข้าสมุดที่อยู่ให้เลย
export function addAddressToUser(userId, address) {
  return commitAddresses(userId, (list) => {
    const nextId = list.length ? Math.max(...list.map((item) => Number(item.id) || 0)) + 1 : 1;
    const makeDefault = list.length === 0;
    const cleared = makeDefault ? [] : list;
    return [...cleared, { label: "Home", ...address, id: nextId, isDefault: makeDefault }];
  });
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
    return { ok: false, message: "เฉพาะ Super Admin เท่านั้นที่จัดการแอดมินได้", users };
  }

  const nameError = validateName(name);
  if (nameError) {
    return { ok: false, message: nameError, users };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { ok: false, message: emailError, users };
  }

  if (!password || password.length < 6) {
    return { ok: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", users };
  }

  const phoneError = validatePhone(phone, { required: false });
  if (phoneError) {
    return { ok: false, message: phoneError, users };
  }

  const duplicatedUser = users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase());

  if (duplicatedUser) {
    return { ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว", users };
  }

  const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  const user = {
    id: nextId,
    role: ROLES.ADMIN,
    name: name.trim(),
    email: email.trim(),
    password,
    phone: phone.trim(),
    address: null,
    addresses: [],
  };
  const nextUsers = [...users, user];
  saveUsers(nextUsers);

  return { ok: true, message: `เพิ่ม "${user.name}" เป็นแอดมินแล้ว`, user, users: nextUsers };
}

// Super Admin แก้ไขข้อมูลของ admin คนอื่นได้ (ชื่อ/อีเมล/เบอร์ และตั้งรหัสผ่านใหม่ได้ถ้าต้องการ)
// แก้ super admin หรือแก้ตัวเองจากตรงนี้ไม่ได้ (กันแตะบัญชีระดับสูงและกันแก้ตัวเองสับสน)
export function updateAdmin(actor, userId, { name, email, phone = "", password = "" }) {
  const users = getUsers();
  const guard = guardAdminAction(actor, userId, users);

  if (!guard.ok) {
    return guard;
  }

  if (guard.target.role !== ROLES.ADMIN) {
    return { ok: false, message: "บัญชีนี้ไม่ใช่แอดมิน", users };
  }

  const nameError = validateName(name);
  if (nameError) {
    return { ok: false, message: nameError, users };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { ok: false, message: emailError, users };
  }

  const phoneError = validatePhone(phone, { required: false });
  if (phoneError) {
    return { ok: false, message: phoneError, users };
  }

  const duplicatedEmail = users.some(
    (user) => user.id !== userId && user.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (duplicatedEmail) {
    return { ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว", users };
  }

  // เปลี่ยนรหัสผ่านเฉพาะเมื่อกรอกมาเท่านั้น ถ้าเว้นว่างให้ใช้รหัสเดิม
  if (password && password.length < 6) {
    return { ok: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", users };
  }

  const nextUsers = users.map((user) =>
    user.id === userId
      ? {
          ...user,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password ? password : user.password,
        }
      : user
  );
  saveUsers(nextUsers);

  return { ok: true, message: `บันทึกข้อมูลแอดมิน "${name.trim()}" แล้ว`, users: nextUsers };
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
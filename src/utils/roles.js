export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
};

export const ADMIN_NAV = "Admin";

const CUSTOMER_NAV = ["Home", "Cart", "Orders", "Profile"];

// หน้าฝั่งลูกค้า (หน้าบ้าน) — แอดมิน/ซูเปอร์แอดมินไม่ควรเข้าถึง
const CUSTOMER_ONLY_PAGES = ["Home", "Cart", "Orders", "Profile", "Checkout"];

const ACCESS_LABELS = {
  [ROLES.CUSTOMER]: "Customer",
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUPER_ADMIN]: "Super Admin",
};

// super admin ทำได้ทุกอย่างที่ admin ทำได้ เลยนับเป็น admin ด้วย
export function isAdmin(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
}

export function isSuperAdmin(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}

export function isCustomer(user) {
  return user?.role === ROLES.CUSTOMER;
}

export function canAccessAdmin(user) {
  return isAdmin(user);
}

// เพิ่ม/ลบ/เลื่อนขั้น admin ได้เฉพาะ super admin
export function canManageAdmins(user) {
  return isSuperAdmin(user);
}

export function getAccessLabel(user) {
  if (!user) {
    return "Guest";
  }

  return ACCESS_LABELS[user.role] || "Customer";
}

export function getNavItems(user) {
  if (!user) {
    return [];
  }

  // แอดมิน/ซูเปอร์แอดมินเห็นเฉพาะหน้าหลังบ้าน (Admin) เท่านั้น ไม่ปนกับหน้าซื้อของฝั่งลูกค้า
  return isAdmin(user) ? [ADMIN_NAV] : CUSTOMER_NAV;
}

// เช็คว่า user คนนี้เข้าหน้านี้ได้หรือไม่ (ใช้กันแอดมินหลุดเข้าหน้าบ้าน และกันลูกค้าเข้าหน้า Admin)
export function canAccessPage(user, page) {
  if (isAdmin(user)) {
    // แอดมินเข้าได้เฉพาะหน้า Admin และหน้า auth เท่านั้น
    return !CUSTOMER_ONLY_PAGES.includes(page);
  }

  // ผู้ที่ไม่ใช่แอดมินเข้าหน้า Admin ไม่ได้
  return page !== ADMIN_NAV;
}

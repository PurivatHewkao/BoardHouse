export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
};

export const ADMIN_NAV = "Admin";

const CUSTOMER_NAV = ["Home", "Cart", "Orders", "Profile"];

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

  return isAdmin(user) ? [...CUSTOMER_NAV, ADMIN_NAV] : CUSTOMER_NAV;
}

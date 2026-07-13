export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};

export const ADMIN_NAV = "Admin";

const CUSTOMER_NAV = ["Home", "Cart", "Orders"];

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export function canAccessAdmin(user) {
  return isAdmin(user);
}

export function getAccessLabel(user) {
  if (!user) {
    return "Guest";
  }

  return isAdmin(user) ? "Admin" : "Customer";
}

export function getNavItems(user) {
  if (!user) {
    return [];
  }

  return isAdmin(user) ? [...CUSTOMER_NAV, ADMIN_NAV] : CUSTOMER_NAV;
}

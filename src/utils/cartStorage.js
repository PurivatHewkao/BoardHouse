const cartKey = "boardhouse-cart";

export const defaultCart = [
  { productId: 1, quantity: 2 },
  { productId: 3, quantity: 2 },
];

export function getInitialCart() {
  try {
    const savedCart = localStorage.getItem(cartKey);
    const parsedCart = savedCart ? JSON.parse(savedCart) : defaultCart;

    return Array.isArray(parsedCart) ? parsedCart : defaultCart;
  } catch {
    localStorage.removeItem(cartKey);
    return defaultCart;
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  } catch {
    // Keep the demo running even if browser storage is blocked.
  }
}

import { cart as defaultCart, storageKeys } from "../data/seedData.js";
import { readStorage, writeStorage } from "./localStorageDb.js";

export { defaultCart };

export function getCart() {
  const cart = readStorage(storageKeys.cart, defaultCart);
  return Array.isArray(cart) ? cart : defaultCart;
}

export const getInitialCart = getCart;

export function saveCart(cart) {
  writeStorage(storageKeys.cart, cart);
}

export function addCartItem(cart, productId, products) {
  const product = products.find((item) => item.id === productId);

  if (!product || product.stock <= 0) {
    return cart;
  }

  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    return cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
        : item
    );
  }

  return [...cart, { productId, quantity: 1 }];
}

export function updateCartQuantity(cart, productId, amount, products) {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return cart;
  }

  return cart.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.min(product.stock, Math.max(1, item.quantity + amount)) }
      : item
  );
}

export function removeCartItem(cart, productId) {
  return cart.filter((item) => item.productId !== productId);
}

export function clearCart() {
  saveCart([]);
  return [];
}

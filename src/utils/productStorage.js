import { products as defaultProducts } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";

export function getProducts() {
  const products = readStorage(storageKeys.products, defaultProducts);
  return Array.isArray(products) ? products : defaultProducts;
}

export function saveProducts(products) {
  writeStorage(storageKeys.products, products);
}

export function addProduct(product) {
  const products = getProducts();
  const nextId = products.length ? Math.max(...products.map((item) => item.id)) + 1 : 1;
  const newProduct = { ...product, id: nextId };
  const nextProducts = [...products, newProduct];
  saveProducts(nextProducts);
  return nextProducts;
}

export function updateProduct(productId, updates) {
  const nextProducts = getProducts().map((product) =>
    product.id === productId ? { ...product, ...updates, id: productId } : product
  );
  saveProducts(nextProducts);
  return nextProducts;
}

export function deleteProduct(productId) {
  const nextProducts = getProducts().filter((product) => product.id !== productId);
  saveProducts(nextProducts);
  return nextProducts;
}

export function reduceProductStock(products, cartItems) {
  return products.map((product) => {
    const cartItem = cartItems.find((item) => item.productId === product.id);

    if (!cartItem) {
      return product;
    }

    return {
      ...product,
      stock: Math.max(0, product.stock - cartItem.quantity),
    };
  });
}

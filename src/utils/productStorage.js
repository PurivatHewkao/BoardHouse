import { products as defaultProducts } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";

export const productsUpdatedEvent = "boardhouse:products-updated";

// ดึงรายการสินค้าทั้งหมด
export function getProducts() {
  const products = readStorage(storageKeys.products, defaultProducts);
  return Array.isArray(products) ? products : defaultProducts;
}

// บันทึกรายการสินค้าทั้งหมดลง Storage
export function saveProducts(products) {
  writeStorage(storageKeys.products, products);

  // storage event จะไม่ทำงานใน tab เดียวกัน จึงส่ง event ภายในแอปเพื่อให้
  // หน้าร้านและหน้า Admin เห็นสินค้า/stock ชุดเดียวกันทันที
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(productsUpdatedEvent, { detail: products }));
  }
}

// เพิ่มสินค้าชิ้นใหม่ (รองรับการแปลงค่าฟิลด์ตัวกรองใหม่ให้เป็นตัวเลขเสมอ และเก็บรูปภาพแบบ Base64 หรือ File Path)
export function addProduct(product) {
  const products = getProducts();
  const nextId = products.length ? Math.max(...products.map((item) => item.id)) + 1 : 1;
  
  const newProduct = { 
    ...product, 
    id: nextId,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    minAge: Number(product.minAge || 0),         // แปลงค่าเป็นตัวเลขเพื่อใช้กรองข้อมูล
    minPlayers: Number(product.minPlayers || 0), // แปลงค่าเป็นตัวเลขเพื่อใช้กรองข้อมูล
    maxPlayers: Number(product.maxPlayers || 0), // แปลงค่าเป็นตัวเลขเพื่อใช้กรองข้อมูล
    image: product.image || "/images/products/placeholder.jpg" // ถ้ารูปภาพว่าง ให้ใช้รูปเริ่มต้นในเครื่อง
  };
  
  const nextProducts = [...products, newProduct];
  saveProducts(nextProducts);
  return nextProducts;
}

// แก้ไขสินค้าเดิมที่มีอยู่
export function updateProduct(productId, updates) {
  const nextProducts = getProducts().map((product) => {
    if (product.id === productId) {
      return { 
        ...product, 
        ...updates, 
        id: productId,
        price: updates.price !== undefined ? Number(updates.price) : product.price,
        stock: updates.stock !== undefined ? Number(updates.stock) : product.stock,
        minAge: updates.minAge !== undefined ? Number(updates.minAge) : product.minAge,
        minPlayers: updates.minPlayers !== undefined ? Number(updates.minPlayers) : product.minPlayers,
        maxPlayers: updates.maxPlayers !== undefined ? Number(updates.maxPlayers) : product.maxPlayers,
        image: updates.image !== undefined ? updates.image : product.image // ใช้รูปใหม่ (Base64 จากเครื่อง) ถ้ามีการแก้ไข
      };
    }
    return product;
  });
  saveProducts(nextProducts);
  return nextProducts;
}

// ลบสินค้าออก
export function deleteProduct(productId) {
  const nextProducts = getProducts().filter((product) => product.id !== productId);
  saveProducts(nextProducts);
  return nextProducts;
}

// ลดจำนวนสต็อกสินค้าในคลังเมื่อมีการสั่งซื้อสำเร็จ
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

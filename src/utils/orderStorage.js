import { orders as defaultOrders } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";

// ลำดับสถานะที่ไหลอัตโนมัติได้ตามเวลา (ไม่รวม Cancelled เพราะต้องยกเลิกโดยแอดมินเท่านั้น)
export const orderStatusFlow = ["Paid", "Preparing Shipment", "In Transit", "Completed"];

// ⏱️ เวลาต่อ 1 สถานะ (จำลองสั้นๆ เพื่อ demo) — ปรับตัวเลขนี้ได้ตามต้องการ
export const AUTO_ADVANCE_STAGE_MS = 60 * 1000; // 1 นาที/สถานะ

export function getOrders() {
  const orders = readStorage(storageKeys.orders, defaultOrders);
  return Array.isArray(orders) ? orders : defaultOrders;
}

export function saveOrders(orders) {
  writeStorage(storageKeys.orders, orders);
}

export function getOrdersByUser(userId) {
  return getOrders().filter((order) => order.userId === userId);
}

// สร้างเลขพัสดุอัตโนมัติทันทีที่ได้ออเดอร์ (ก่อนแอดมินจะเลือกขนส่งจริง)
// รูปแบบ: BH + วันที่ (YYMMDD) + เลขสุ่ม 6 หลัก เช่น BH2607180F3K21
function generateTrackingNumber() {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BH${datePart}${randomPart}`;
}

export function createOrder({ user, cartItems, paymentMethod = "Cash on Delivery", shippingAddress }) {
  const orderItems = cartItems.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const now = Date.now();
  const order = {
    id: `ORD-${now}`,
    userId: user?.id || null,
    date: new Date().toISOString().slice(0, 10),
    items: orderItems.map((item) => item.name).join(", "),
    orderItems,
    total,
    status: "Paid",
    tone: "primary",
    paymentMethod,
    shippingAddress: shippingAddress || user?.address || null,
    createdAt: now,
    statusUpdatedAt: now,
    // ได้เลขพัสดุทันทีตอนสั่งซื้อ ส่วนขนส่งจริง (carrier) แอดมินค่อยยืนยัน/แก้ไขทีหลังได้
    trackingNumber: generateTrackingNumber(),
    carrier: "",
  };
  const nextOrders = [order, ...getOrders()];
  saveOrders(nextOrders);
  return { order, orders: nextOrders };
}

function toneForStatus(status) {
  if (status === "Completed") return "primary";
  if (status === "Cancelled") return "danger";
  return "soft";
}

export function updateOrderStatus(orderId, status) {
  const nextOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          tone: toneForStatus(status),
          statusUpdatedAt: Date.now(),
        }
      : order
  );
  saveOrders(nextOrders);
  return nextOrders;
}

// ยกเลิกออเดอร์ — ต้องระบุเหตุผลเสมอ
export function cancelOrder(orderId, reason) {
  const nextOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          status: "Cancelled",
          tone: "danger",
          cancelReason: reason,
          statusUpdatedAt: Date.now(),
        }
      : order
  );
  saveOrders(nextOrders);
  return nextOrders;
}

// ให้แอดมินแก้ไขรหัสพัสดุ/ผู้ให้บริการขนส่ง และเติมข้อมูลที่อยู่จัดส่งให้ครบ
export function updateOrderDetails(orderId, updates) {
  const nextOrders = getOrders().map((order) => (order.id === orderId ? { ...order, ...updates } : order));
  saveOrders(nextOrders);
  return nextOrders;
}

// สถานะถัดไปตามลำดับการไหลปกติ (คืนค่า null ถ้าเป็นสถานะสุดท้ายหรือ Cancelled)
export function getNextStatus(status) {
  const index = orderStatusFlow.indexOf(status);
  if (index === -1 || index === orderStatusFlow.length - 1) {
    return null;
  }
  return orderStatusFlow[index + 1];
}

// เช็คว่าออเดอร์นี้ "ถึงเวลา" ที่ควรเลื่อนไปสถานะถัดไปหรือยัง (ยังไม่เลื่อนให้จริง ต้องให้แอดมินกดยืนยัน)
export function isOrderDueForNextStatus(order, now = Date.now()) {
  if (!order || order.status === "Cancelled") {
    return false;
  }
  const nextStatus = getNextStatus(order.status);
  if (!nextStatus) {
    return false;
  }
  const lastChange = order.statusUpdatedAt || order.createdAt || 0;
  return now - lastChange >= AUTO_ADVANCE_STAGE_MS;
}
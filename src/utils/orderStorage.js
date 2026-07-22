import { orders as defaultOrders } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";

// ลำดับสถานะที่ไหลอัตโนมัติได้ตามเวลา (ไม่รวม Cancelled เพราะต้องยกเลิกโดยแอดมินเท่านั้น)
export const orderStatusFlow = ["Preparing Shipment", "In Transit", "Completed"];

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

// เวลาที่ใช้จัดเรียงออเดอร์ — ใช้ createdAt (แม่นระดับวินาที) ถ้ามี ไม่งั้น fallback เป็นวันที่ (date)
// จำเป็นเพราะ order.date เก็บแค่ระดับวัน ออเดอร์วันเดียวกันจะเรียงสลับกันมั่ว
export function getOrderTime(order) {
  if (order?.createdAt) {
    return Number(order.createdAt) || 0;
  }
  if (order?.date) {
    const time = new Date(order.date).getTime();
    return Number.isFinite(time) ? time : 0;
  }
  return 0;
}

// เรียงออเดอร์จากใหม่ไปเก่า (ล่าสุดอยู่บนสุด)
export function sortOrdersByNewest(orders) {
  return [...orders].sort((a, b) => getOrderTime(b) - getOrderTime(a));
}

export function createOrder({ user, cartItems, paymentMethod = "Credit Card", shippingAddress }) {
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
    // ลูกค้าจ่ายเงินตอน checkout เสร็จแล้ว ให้เริ่มที่ "Preparing Shipment" เลย (ข้ามสถานะ Paid)
    status: "Preparing Shipment",
    tone: "soft",
    paymentMethod,
    shippingAddress: shippingAddress || user?.address || null,
    createdAt: now,
    statusUpdatedAt: now,
    // ยังไม่มีเลขพัสดุตอนสร้างออเดอร์ แอดมินเป็นคนกรอกเลขพัสดุ/เลือกขนส่งจริงทีหลัง
    trackingNumber: "",
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
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order;
    // ออเดอร์ที่ยกเลิกแล้ว (Cancelled) ห้ามเปลี่ยนสถานะอีก แต่ Completed แอดมินย้อนกลับเป็น In Transit ได้ (เผื่อกดปิดออเดอร์พลาด)
    if (order.status === "Cancelled") {
      return order;
    }
    return {
      ...order,
      status,
      tone: toneForStatus(status),
      statusUpdatedAt: Date.now(),
    };
  });
  saveOrders(nextOrders);
  return nextOrders;
}

// ยกเลิกออเดอร์ — ต้องระบุเหตุผลเสมอ และบันทึกไว้ด้วยว่าแอดมินคนไหนเป็นคนยกเลิก
export function cancelOrder(orderId, reason, admin) {
  const nextOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          status: "Cancelled",
          tone: "danger",
          cancelReason: reason,
          cancelledBy: admin?.name || admin?.email || "ไม่ทราบผู้ดำเนินการ",
          statusUpdatedAt: Date.now(),
        }
      : order
  );
  saveOrders(nextOrders);
  return nextOrders;
}

// ให้แอดมินแก้ไขรหัสพัสดุ/ผู้ให้บริการขนส่ง และเติมข้อมูลที่อยู่จัดส่งให้ครบ
export function updateOrderDetails(orderId, updates) {
  const nextOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order;
    // ออเดอร์ที่ปิดแล้ว (Completed/Cancelled) ห้ามแก้ไขข้อมูลขนส่ง/สถานะอีก
    // กันเคสที่ทำให้สถานะเด้งกลับไปเป็น "In Transit" หลังจากปิดออเดอร์เป็น Completed แล้ว
    if (order.status === "Completed" || order.status === "Cancelled") {
      return order;
    }
    return { ...order, ...updates };
  });
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
import { orders as defaultOrders } from "../data/seedData.js";
import { readStorage, storageKeys, writeStorage } from "./localStorageDb.js";

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

export function createOrder({ user, cartItems, paymentMethod = "Cash on Delivery", shippingAddress }) {
  const orderItems = cartItems.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `ORD-${Date.now()}`,
    userId: user?.id || null,
    date: new Date().toISOString().slice(0, 10),
    items: orderItems.map((item) => item.name).join(", "),
    orderItems,
    total,
    status: "Paid",
    tone: "primary",
    paymentMethod,
    shippingAddress: shippingAddress || user?.address || null,
  };
  const nextOrders = [order, ...getOrders()];
  saveOrders(nextOrders);
  return { order, orders: nextOrders };
}

export function updateOrderStatus(orderId, status) {
  const nextOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          tone: status === "Completed" ? "primary" : "soft",
        }
      : order
  );
  saveOrders(nextOrders);
  return nextOrders;
}

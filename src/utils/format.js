export function money(value) {
  return `$${value.toFixed(2)}`;
}

// ย่อชื่อสินค้าที่ยาวเกินไปด้วยการตัดเป็นคำๆ (ไม่ตัดกลางคำ และไม่เติม "..." ต่อท้าย)
export function shortenProductName(name, maxWords = 3) {
  if (!name) {
    return "";
  }

  const words = name.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return name;
  }

  return words.slice(0, maxWords).join(" ");
}

// สรุปรายชื่อสินค้าในออเดอร์เป็นข้อความเดียว
// - ถ้าสินค้ามีมากกว่า limit ชิ้น จะโชว์แค่ limit ชิ้นแรก แล้วเติม "..." ต่อท้ายให้รู้ว่ายังมีอีก
// - ชื่อสินค้าที่ยาวก็ยังถูกย่อเป็นคำๆ ด้วย เพื่อไม่ให้บรรทัดยาวเกินไป
export function summarizeOrderItems(order, { limit = 4, maxWords = 3 } = {}) {
  const items = Array.isArray(order?.orderItems) ? order.orderItems : null;

  if (!items || items.length === 0) {
    return order?.items || "";
  }

  const isOverLimit = items.length > limit;
  const visibleItems = isOverLimit ? items.slice(0, limit) : items;
  const names = visibleItems.map((item) => (isOverLimit ? shortenProductName(item.name, maxWords) : item.name));
  const summary = names.join(", ");

  return isOverLimit ? `${summary}, ...` : summary;
}

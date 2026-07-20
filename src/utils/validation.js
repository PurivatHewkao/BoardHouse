// ตัวช่วยตรวจสอบข้อมูลฟอร์มแบบรวมศูนย์ — ใช้ได้ทั้งหน้า Profile, Checkout และการสร้าง Admin
// ทุกฟังก์ชันคืนค่าเป็น string ข้อความ error ถ้าไม่ผ่าน หรือ "" (ว่าง) ถ้าผ่าน

// ชื่อผู้ใช้ (ใช้เป็นชื่อที่แสดง/username) ต้องมีความยาวพอสมควรและไม่เป็นช่องว่างล้วน
export function validateName(name) {
  const value = (name || "").trim();

  if (!value) {
    return "กรุณากรอกชื่อ";
  }

  if (value.length < 2) {
    return "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
  }

  if (value.length > 60) {
    return "ชื่อต้องไม่เกิน 60 ตัวอักษร";
  }

  return "";
}

// อีเมลต้องอยู่ในรูปแบบอีเมลจริง (มี @ และโดเมนที่มีจุด)
export function validateEmail(email) {
  const value = (email || "").trim();

  if (!value) {
    return "กรุณากรอกอีเมล";
  }

  // รูปแบบพื้นฐาน: ตัวอักษรก่อน @ , โดเมน , จุด , ส่วนขยายอย่างน้อย 2 ตัว
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailPattern.test(value)) {
    return "รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)";
  }

  return "";
}

// เบอร์โทรต้องเป็นตัวเลข (อนุญาต + - เว้นวรรค วงเล็บ) และมีจำนวนหลัก 9-10 หลัก แบบเบอร์ไทย
export function validatePhone(phone, { required = true } = {}) {
  const value = (phone || "").trim();

  if (!value) {
    return required ? "กรุณากรอกเบอร์โทรศัพท์" : "";
  }

  // ต้องมีเฉพาะตัวเลขและอักขระคั่นที่ยอมรับได้เท่านั้น
  if (!/^[0-9()+\-\s]+$/.test(value)) {
    return "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 9 || digits.length > 10) {
    return "เบอร์โทรศัพท์ต้องมี 9-10 หลัก";
  }

  return "";
}

// รหัสไปรษณีย์ไทยต้องเป็นตัวเลข 5 หลัก
export function validatePostalCode(postalCode) {
  const value = (postalCode || "").trim();

  if (!/^\d{5}$/.test(value)) {
    return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
  }

  return "";
}

// ตรวจที่อยู่ 1 รายการให้ครบทุกฟิลด์ที่จำเป็น คืน object { ok, message }
// requireLabel = false ใช้กับที่อยู่จัดส่งในออเดอร์ (ไม่มีป้ายชื่อ label)
export function validateAddress(address, { requireLabel = true } = {}) {
  if (!address) {
    return { ok: false, message: "กรุณากรอกที่อยู่" };
  }

  if (requireLabel && !(address.label || "").trim()) {
    return { ok: false, message: "กรุณาระบุป้ายชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)" };
  }

  const nameError = validateName(address.recipientName);
  if (nameError) {
    return { ok: false, message: `ชื่อผู้รับ: ${nameError}` };
  }

  const phoneError = validatePhone(address.phone);
  if (phoneError) {
    return { ok: false, message: `เบอร์ผู้รับ: ${phoneError}` };
  }

  if (!(address.line1 || "").trim()) {
    return { ok: false, message: "กรุณากรอกบ้านเลขที่/ถนน" };
  }

  if (!(address.district || "").trim()) {
    return { ok: false, message: "กรุณากรอกเขต/อำเภอ" };
  }

  if (!(address.province || "").trim()) {
    return { ok: false, message: "กรุณากรอกจังหวัด" };
  }

  const postalError = validatePostalCode(address.postalCode);
  if (postalError) {
    return { ok: false, message: postalError };
  }

  return { ok: true, message: "" };
}

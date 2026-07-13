# BoardHouse LocalStorage Data Contract

ไฟล์นี้เป็นข้อตกลงกลางสำหรับทีมเวลาทำงานกับ mock database ของ BoardHouse

## หลักการ

- ใช้ `localStorage` เป็น mock database เท่านั้น ยังไม่มี backend/database จริง
- ห้ามแก้ข้อมูลหลักด้วยการ import แล้ว mutate array จาก `seedData.js` โดยตรง
- ถ้าต้องอ่าน/เขียนข้อมูล ให้ใช้ helper ใน `src/utils/*Storage.js`
- `seedData.js` ใช้เป็นข้อมูลตั้งต้นตอนเปิดเว็บครั้งแรก หรือ reset mock data

## LocalStorage Keys

| Key | ใช้เก็บ | เจ้าของหลัก |
| --- | --- | --- |
| `boardhouse-products` | รายการสินค้าและ stock | Product/Admin |
| `boardhouse-users` | user ทั้ง customer/admin | Auth/Admin |
| `boardhouse-current-user` | user ที่ login อยู่ | Auth/App |
| `boardhouse-cart` | สินค้าในตะกร้า | Cart/Checkout |
| `boardhouse-orders` | order history และสถานะ order | Orders/Admin/Checkout |

## Helper Files

| ไฟล์ | ใช้ทำอะไร |
| --- | --- |
| `src/utils/localStorageDb.js` | read/write/seed/reset ข้อมูลกลาง |
| `src/utils/productStorage.js` | อ่านสินค้า, เพิ่ม, แก้ไข, ลบ, ลด stock |
| `src/utils/cartStorage.js` | อ่านตะกร้า, เพิ่มสินค้า, เปลี่ยนจำนวน, ลบสินค้า, ล้างตะกร้า |
| `src/utils/orderStorage.js` | อ่าน order, สร้าง order, เปลี่ยนสถานะ order |
| `src/utils/userStorage.js` | อ่าน user, register, login, current user, logout |

## Product Shape

```js
{
  id: 1,
  name: "Catan",
  category: "Strategy",
  price: 39.99,
  stock: 12,
  ageRange: "10+",
  players: "3-4",
  playTime: "60-120 min",
  difficulty: "Medium",
  image: "/images/products/catan.jpg",
  description: "Trade, build, and settle an island in a classic strategy board game."
}
```

## Cart Item Shape

```js
{
  productId: 1,
  quantity: 2
}
```

## User Shape

```js
{
  id: 1,
  role: "customer", // "customer" หรือ "admin"
  name: "Jane Doe",
  email: "jane@example.com",
  password: "password",
  phone: "081-234-5678",
  address: {
    label: "Home",
    line1: "99/1 BoardHouse Street",
    district: "Bangkok",
    province: "Bangkok",
    postalCode: "10200"
  }
}
```

## Order Shape

```js
{
  id: "ORD-1001",
  userId: 1,
  date: "2026-06-20",
  items: "Catan, Uno",
  orderItems: [
    { productId: 1, name: "Catan", price: 39.99, quantity: 1 }
  ],
  total: 49.98,
  status: "Completed",
  tone: "primary",
  paymentMethod: "Credit Card",
  shippingAddress: {
    label: "Home",
    line1: "99/1 BoardHouse Street",
    district: "Bangkok",
    province: "Bangkok",
    postalCode: "10200",
    recipientName: "Jane Doe",
    phone: "081-234-5678"
  }
}
```

`recipientName` และ `phone` ใน `shippingAddress` มาจากฟอร์มหน้า Checkout (`CheckoutRoute.jsx`) เพื่อให้ผู้รับพัสดุไม่ต้องเป็นคนเดียวกับเจ้าของบัญชีเสมอไป

## Order Status

ใช้ค่าตามนี้เพื่อให้ UI และ Admin ทำงานตรงกัน:

```js
["Paid", "Preparing Shipment", "In Transit", "Completed", "Cancelled"]
```

## ตัวอย่างการใช้งานตาม Role

### Product/Admin

```js
import { getProducts, addProduct, updateProduct, deleteProduct } from "../utils/productStorage.js";

const products = getProducts();
addProduct(newProduct);
updateProduct(productId, updates);
deleteProduct(productId);
```

### Cart/Checkout

```js
import { addCartItem, updateCartQuantity, removeCartItem, clearCart } from "../utils/cartStorage.js";
import { createOrder } from "../utils/orderStorage.js";
import { reduceProductStock, saveProducts } from "../utils/productStorage.js";

const nextCart = addCartItem(cart, productId, products);
const nextProducts = reduceProductStock(products, cartItems);
saveProducts(nextProducts);
createOrder({ user: currentUser, cartItems });
clearCart();
```

### Auth

```js
import { loginUser, registerUser, getCurrentUser, logoutUser } from "../utils/userStorage.js";

const user = loginUser(email, password);
const result = registerUser({ name, email, password });
const currentUser = getCurrentUser();
logoutUser();
```

### Orders/Admin

```js
import { getOrders, updateOrderStatus } from "../utils/orderStorage.js";

const orders = getOrders();
updateOrderStatus(orderId, "In Transit");
```

## Reset Mock Data

ใช้เมื่อต้องการล้างข้อมูล localStorage กลับไปค่าเริ่มต้น

```js
import { resetStorage } from "../utils/localStorageDb.js";

resetStorage();
```

## ข้อควรระวัง

- ถ้าเพิ่ม field ใหม่ใน product/user/order ให้เพิ่มใน `seedData.js` และเอกสารนี้ด้วย
- ถ้าแก้ product ผ่าน Admin ต้องเรียก `saveProducts()` หรือ helper CRUD เท่านั้น
- Checkout ต้องสร้าง order และลด stock จากข้อมูลชุดเดียวกัน
- `localStorage` เป็นข้อมูลใน browser ของแต่ละเครื่อง ไม่ใช่ database กลาง
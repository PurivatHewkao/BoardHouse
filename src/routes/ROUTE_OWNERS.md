# BoardHouse Route Owners

ใช้ `App.jsx` เป็นตัวรวมหน้าและส่งข้อมูลกลางให้ route ต่าง ๆ

## Role Ownership

| No. | Role | Main Files |
| --- | --- | --- |
| 1 | Project Manager / Fullstack Developer | `src/App.jsx`, `src/utils/localStorageDb.js`, `src/data/seedData.js` |
| 2 | Product Management Developer | `src/routes/HomeRoute.jsx`, `src/routes/AdminRoute.jsx`, `src/utils/productStorage.js` |
| 3 | Cart and Checkout Developer | `src/routes/CartRoute.jsx`, `src/routes/OrdersRoute.jsx`, `src/utils/cartStorage.js`, `src/utils/orderStorage.js` |
| 4 | Authentication and UI Developer | `src/routes/AuthRoutes.jsx`, `src/routes/ProfileRoute.jsx`, `src/utils/userStorage.js`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/styles.css` |

## Route Map

- `HomeRoute.jsx` = หน้าแรก, รายการสินค้า, search/filter, ปุ่ม Add to Cart
- `CartRoute.jsx` = ตะกร้าสินค้า, quantity, remove item, checkout summary
- `OrdersRoute.jsx` = ประวัติคำสั่งซื้อและสถานะ order
- `AuthRoutes.jsx` = Login และ Register
- `ProfileRoute.jsx` = ลูกค้าแก้ข้อมูลตัวเอง (ชื่อ อีเมล เบอร์ ที่อยู่) และเปลี่ยนรหัสผ่าน (C02)
- `AdminRoute.jsx` = Dashboard ฝั่ง admin และต่อยอดเป็น product/order/customer management

## Storage Guide

อ่านรายละเอียด data contract ได้ที่:

`src/data/DATA_README.md`

สรุป helper ตามงาน:

- Product/Admin ใช้ `productStorage.js`
- Cart/Checkout ใช้ `cartStorage.js` + `orderStorage.js`
- Auth ใช้ `userStorage.js`
- Orders ใช้ `orderStorage.js`
- Seed/reset localStorage ใช้ `localStorageDb.js`

## Important Rule

ห้ามแก้ array จาก `seedData.js` โดยตรงใน route ให้ใช้ helper ใน `src/utils/*Storage.js` เพื่อให้ข้อมูลในแต่ละ route ตรงกัน

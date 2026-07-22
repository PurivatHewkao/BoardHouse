# BoardHouse Route Owners

ไฟล์นี้ใช้เป็นข้อตกลงของทีมว่าใครควรแก้ไฟล์ไหนเป็นหลัก เพื่อลด conflict และป้องกันการแก้ไฟล์ของคนอื่นโดยไม่จำเป็น

## Team Ownership

| Area | Responsibility | Primary Files | Ask Before Editing |
| --- | --- | --- | --- |
| Shop / Product Browsing | หน้า Home, รายการสินค้า, ค้นหา, filter, product modal | `src/routes/HomeRoute.jsx` | `src/App.jsx`, `src/utils/productStorage.js` |
| Cart / Checkout / Orders | ตะกร้า, checkout, payment, order history | `src/routes/CartRoute.jsx`, `src/routes/CheckoutRoute.jsx`, `src/routes/OrdersRoute.jsx`, `src/components/OrderDetailModal.jsx` | `src/App.jsx`, `src/utils/cartStorage.js`, `src/utils/orderStorage.js` |
| Admin Panel | Dashboard, จัดการสินค้า, ลูกค้า, order, admin tools | `src/routes/AdminRoute.jsx` | `src/utils/productStorage.js`, `src/utils/orderStorage.js`, `src/utils/userStorage.js`, `src/utils/roles.js` |
| Auth / Profile / Navigation | Login, register, profile, header, footer, role display | `src/routes/AuthRoutes.jsx`, `src/routes/ProfileRoute.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx` | `src/App.jsx`, `src/utils/userStorage.js`, `src/utils/roles.js` |
| Backend / Supabase | Supabase client, service layer, API routes, env docs | `src/lib/*`, `src/services/*`, `api/*`, `.env.example` | `src/utils/*Storage.js`, `package.json` |
| Docs / Deploy | README, diagrams, screenshots, Vercel notes | `README.md`, `docs/**` | `package.json`, source files |

## Shared Files

ไฟล์เหล่านี้กระทบหลายหน้า ต้องคุยกับทีมก่อนแก้หรือแยก PR ให้เล็กที่สุด

- `src/App.jsx`
- `src/data/seedData.js`
- `src/data/DATA_README.md`
- `src/utils/localStorageDb.js`
- `src/utils/productStorage.js`
- `src/utils/cartStorage.js`
- `src/utils/orderStorage.js`
- `src/utils/userStorage.js`
- `src/utils/roles.js`
- `src/styles.css`
- `package.json`

## Route Map

- `HomeRoute.jsx` = หน้าแรก, รายการสินค้า, search/filter, product detail modal, add to cart
- `CartRoute.jsx` = ตะกร้าสินค้า, quantity, remove item, checkout summary
- `CheckoutRoute.jsx` = ที่อยู่จัดส่ง, payment method, place order
- `OrdersRoute.jsx` = ประวัติคำสั่งซื้อและสถานะ order
- `AuthRoutes.jsx` = Login และ Register
- `ProfileRoute.jsx` = แก้ข้อมูลส่วนตัว, address, password
- `AdminRoute.jsx` = Dashboard ฝั่ง admin, product/order/customer/admin management

## Storage Rule

Routes และ components ไม่ควรแก้ array จาก `seedData.js` โดยตรง ให้เรียกผ่าน helper ใน `src/utils/*Storage.js`

ตอนนี้ระบบยังเป็น:

```text
React route/component -> src/utils/*Storage.js -> localStorage
```

เมื่อต่อ Supabase ให้คงชื่อ helper เดิมไว้ แล้วให้ helper เรียก service ใหม่:

```text
React route/component -> src/utils/*Storage.js -> src/services/* -> Supabase / API
```

## Branch Names

ใช้ branch ตามขอบเขตงาน เช่น

- `feature/shop-page`
- `feature/cart-checkout`
- `feature/admin-panel`
- `feature/auth-profile`
- `feature/supabase-backend`
- `docs/readme-update`

## Merge Rules

- 1 branch ควรแก้ 1 เรื่อง
- ก่อน push ให้รัน `npm run build`
- ถ้าจำเป็นต้องแก้ไฟล์ใน Shared Files ให้บอกทีมก่อน
- ถ้า conflict ในไฟล์ route ใหัเจ้าของ area นั้นเป็นคน resolve
- ห้ามลบหรือ reset งานคนอื่นโดยไม่ตกลงกันก่อน

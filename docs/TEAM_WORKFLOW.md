# BoardHouse Team Workflow

เอกสารนี้ใช้แบ่งงานสำหรับทีม เพื่อให้แต่ละคนทำงานของตัวเองโดยไม่ต้องไปแก้ไฟล์ของคนอื่นบ่อยเกินไป

## Goal

แยกพื้นที่ทำงานเป็น 3 ชั้นหลัก

```text
UI Layer       src/routes/*, src/components/*
Storage Layer  src/utils/*Storage.js
Backend Layer  src/lib/*, src/services/*, api/*
```

คนทำ UI ควรแก้เฉพาะ route/component ของตัวเอง ส่วนคนทำ backend ควรเพิ่ม service/API ใหม่ก่อน แล้วค่อยเชื่อมเข้ากับ storage helper เดิมทีละส่วน

## Work Areas

| Area | Main Owner Work | Files |
| --- | --- | --- |
| Shop | หน้าเลือกซื้อสินค้า, filter, product card, product detail | `src/routes/HomeRoute.jsx` |
| Cart / Checkout | cart, checkout, order history | `src/routes/CartRoute.jsx`, `src/routes/CheckoutRoute.jsx`, `src/routes/OrdersRoute.jsx` |
| Admin | dashboard, product/order/customer/admin management | `src/routes/AdminRoute.jsx` |
| Auth / Profile | login, register, profile, role UI, navigation | `src/routes/AuthRoutes.jsx`, `src/routes/ProfileRoute.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx` |
| Backend | Supabase client, services, Vercel API functions | `src/lib/*`, `src/services/*`, `api/*` |
| Docs / Deploy | README, screenshots, diagrams, deployment notes | `README.md`, `docs/**` |

## Backend Migration Plan

### Step 1: Add backend files without changing UI

สร้างไฟล์ในพื้นที่ backend เท่านั้น

```text
src/lib/supabaseClient.js
src/services/productService.js
src/services/userService.js
src/services/orderService.js
src/services/cartService.js
api/products.js
api/orders.js
api/users.js
```

### Step 2: Keep current helper API names

อย่าให้ route ต้องเปลี่ยนเยอะ ให้คง function เดิม เช่น

```text
getProducts()
addProduct()
updateProduct()
loginUser()
createOrder()
```

จากนั้นค่อยเปลี่ยนภายใน `src/utils/*Storage.js` ให้ไปเรียก service

### Step 3: Migrate one domain at a time

ลำดับที่แนะนำ:

1. Products
2. Auth / Users
3. Orders
4. Cart
5. Admin permission tools

## Shared File Policy

ไฟล์กลางที่ต้องคุยก่อนแก้:

- `src/App.jsx`
- `src/data/seedData.js`
- `src/utils/*Storage.js`
- `src/utils/roles.js`
- `src/styles.css`
- `package.json`

ถ้าต้องแก้ไฟล์กลาง ให้ทำ branch เล็กและเขียนเหตุผลใน commit/PR ให้ชัด

## Vercel / Supabase Env

ใช้ `.env.example` เป็น template เท่านั้น ห้าม commit `.env` หรือ `.env.local`

Frontend ใช้:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Serverless API ใช้:

```text
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` ห้ามใช้ใน React frontend

## Definition of Done

งานหนึ่งชิ้นถือว่าเสร็จเมื่อ:

- หน้าเว็บยังใช้งาน flow เดิมได้
- ไม่มีการแก้ไฟล์คนอื่นโดยไม่จำเป็น
- `npm run build` ผ่าน
- README/docs ที่เกี่ยวข้องถูกอัปเดต
- ถ้ามี env ใหม่ ต้องอัปเดต `.env.example`

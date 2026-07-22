# api

โฟลเดอร์นี้เตรียมไว้สำหรับ Vercel Serverless Functions

ถ้าทีมต้องการ backend ชัดเจน ให้สร้าง endpoint เช่น:

```text
api/products.js
api/orders.js
api/users.js
```

ตัวอย่าง flow:

```text
React -> /api/products -> Supabase
```

## Generic Storage API Contract

`src/services/dataSource.js` รองรับ API กลางแบบ key-value เพื่อให้ย้ายจาก localStorage ไป backend ได้โดยแก้โค้ดน้อยที่สุด

ให้ backend รองรับ endpoint นี้:

```text
GET    /api/storage/:key
PUT    /api/storage/:key
DELETE /api/storage/:key
```

รูปแบบ response ของ `GET`:

```json
{
  "value": []
}
```

รูปแบบ body ของ `PUT`:

```json
{
  "value": []
}
```

key ที่ระบบใช้ตอนนี้:

```text
boardhouse-products
boardhouse-users
boardhouse-current-user
boardhouse-cart
boardhouse-orders
boardhouse-seed-version
```

ถ้าตั้งค่า:

```text
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:3000
```

เว็บจะยังอ่าน/เขียน localStorage เป็น cache เหมือนเดิม และ sync ข้อมูลไป API เบื้องหลัง

โปรเจกต์นี้มี Express server local ให้แล้วใน `server/index.js` ถ้าจะใช้ให้รัน:

```powershell
npm run server
npm run dev
```

ใช้ `SUPABASE_SERVICE_ROLE_KEY` ได้เฉพาะในไฟล์ `api/*` เท่านั้น และต้องตั้งค่าใน Vercel Environment Variables

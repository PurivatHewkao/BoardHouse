# src/services

ใช้เก็บ service layer สำหรับติดต่อ backend หรือ Supabase โดยตรง

เป้าหมายคือให้ route/component ไม่ต้องรู้ว่า data มาจาก localStorage, Supabase, หรือ API

โครงที่วางไว้:

```text
productService.js
userService.js
orderService.js
cartService.js
dataSource.js
```

`dataSource.js` เป็นตัวกลางหลักที่ `src/utils/localStorageDb.js` เรียกใช้ ตอนนี้ default เป็น localStorage เหมือนเดิม จึงไม่กระทบ route/component เดิม

โหมดที่รองรับ:

```text
VITE_DATA_SOURCE=local  ใช้ localStorage อย่างเดียว
VITE_DATA_SOURCE=api    ใช้ localStorage เป็น cache และ sync ไป backend ผ่าน VITE_API_URL
```

ตัวอย่าง flow ที่ต้องการ:

```text
HomeRoute.jsx -> productStorage.js -> localStorageDb.js -> dataSource.js
```

ถ้าจะต่อ Express server ให้ทำ endpoint ตาม contract ใน `api/README.md` ก่อน แล้วค่อยตั้ง:

```text
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:3000
```

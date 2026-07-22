# src/lib

ใช้เก็บ client หรือ config กลางสำหรับ integration ภายนอก เช่น Supabase

ตัวอย่างไฟล์ที่จะเพิ่มภายหลัง:

```text
supabaseClient.js
```

กติกา:

- ห้ามใส่ secret key ในไฟล์ frontend
- ใช้เฉพาะ `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ใน React
- ถ้าต้องใช้ service role key ให้ใช้ใน `api/*` เท่านั้น

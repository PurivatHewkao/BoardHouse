# BoardHouse Local Express Server

Server นี้ใช้เป็น backend ง่าย ๆ สำหรับ demo ข้ามเครื่อง โดยเก็บข้อมูลใน `server/db.json`

## Run Locally

เปิด terminal แรก:

```powershell
npm run server
```

เปิด terminal ที่สอง:

```powershell
npm run dev
```

Frontend จะเรียก API จากค่าใน `.env.local`:

```text
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:3000
```

## Run On LAN

ถ้าต้องให้เครื่องอื่นใน Wi-Fi เดียวกันเรียก server ได้:

```powershell
npm start
```

จากนั้นเปลี่ยน `.env.local` ในเครื่อง frontend เป็น IP เครื่อง server เช่น:

```text
VITE_API_URL=http://192.168.1.25:3000
```

## Endpoints

```text
GET    /api/health
GET    /api/storage
GET    /api/storage/:key
PUT    /api/storage/:key
DELETE /api/storage/:key
POST   /api/storage/reset
```

ข้อมูลเริ่มต้น seed จาก `src/data/seedData.js` อัตโนมัติเมื่อยังไม่มี `server/db.json`

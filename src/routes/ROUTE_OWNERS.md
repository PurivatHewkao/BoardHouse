
ใช้ `App.jsx` เป็นตัวรวมหน้าและส่งข้อมูลกลาง

| No. | Role | Main Files |
| --- | --- | --- |
| 1 | Project Manager / Fullstack Developer | `src/App.jsx`, `src/utils/cartStorage.js`, `src/data/products.js`, `src/data/orders.js` |
| 2 | Fullstack Developer / Product Management Developer | `src/routes/HomeRoute.jsx`, `src/routes/AdminRoute.jsx`, `src/data/products.js` |
| 3 | Fullstack Developer / Cart and Checkout Developer | `src/routes/CartRoute.jsx`, `src/routes/OrdersRoute.jsx`, `src/utils/cartStorage.js` |
| 4 | Fullstack Developer / Authentication and UI Developer | `src/routes/AuthRoutes.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/DiceMark.jsx`, `src/styles.css` |

## Route Map

- `HomeRoute.jsx` = หน้าแรก, รายการสินค้า, search/filter, ปุ่ม Add to Cart
- `CartRoute.jsx` = ตะกร้าสินค้า, quantity, remove item, checkout summary
- `OrdersRoute.jsx` = ประวัติคำสั่งซื้อ
- `AuthRoutes.jsx` = Login และ Register
- `AdminRoute.jsx` = Dashboard ฝั่ง admin

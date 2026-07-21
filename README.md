<h1 align="center">🎲 CSI204-Project</h1>

<h2 align="center">House Board</h2>

<p align="center"> <b>Boardgame Ecommerce Platform</b> </p>

<p align="center"> เว็บไซต์ eCommerce สำหรับร้านจำหน่ายบอร์ดเกมบนเว็บไซต์ ผู้ใช้สามารถเลือกดูสินค้า</p>

<p align="center"> https://house-board-swart.vercel.app/ </p>

รายชิ่อสมาชิกกลุ่ม

| ลำดับ | ชื่อ-นามสกุล            | กลุ่ม | รหัสนักศึกษา | ตำแหน่ง | หมายเหตุ |
| ----- | ----------------------- | ----- | ------------ | ----- | -----|
| 1     | ภูริวัชร์ จินดาพงษ์ศิริ | T003  | 67182803     | Project Manager | 
| 2     | ภานุกร แสงมณี           | T001  | 67161002     | Fullstack Dev | กำลังกู้คืนบัญชี GitHub |
| 3     | บุรพร วันทอง            | T001  | 67167437     | Fullstack Dev | กำลังกู้คืนบัญชี GitHub |
| 4     | กนก รัตนเรืองรักษ์      | T001  | 67188118     | Fullstack Dev | กำลังกู้คืนบัญชี GitHub |


## ภาพรวมโครงการ

### Project Overview


## ที่มาและความสำคัญ

ในปัจจุบัน ธุรกิจการซื้อขายสินค้าได้รับความนิยมเพิ่มมากขึ้น เนื่องจากผู้ใช้งานสามารถเลือกดูสินค้า เปรียบเทียบราคา และสั่งซื้อสินค้าได้อย่างสะดวกผ่านเว็บไซต์ โดยไม่จำเป็นต้องเดินทางไปยังหน้าร้านจริง สินค้าประเภทบอร์ดเกมก็เป็นหนึ่งในสินค้าที่มีกลุ่มผู้สนใจเฉพาะทางมากขึ้น ทั้งในกลุ่มนักเรียน นักศึกษา กลุ่มเพื่อน ครอบครัว และผู้ที่ชื่นชอบกิจกรรมสันทนาการแบบเล่นร่วมกัน

อย่างไรก็ตาม การซื้อขายบอร์ดเกมผ่านช่องทางทั่วไปอาจยังมีข้อจำกัด เช่น การค้นหาข้อมูลสินค้าไม่สะดวก การตรวจสอบราคาและจำนวนสินค้าคงเหลือทำได้ยาก รวมถึงร้านค้าขนาดเล็กอาจยังไม่มีระบบสำหรับจัดการข้อมูลสินค้า คำสั่งซื้อ และสถานะการจัดส่งอย่างเป็นระบบ ด้วยเหตุนี้ กลุ่มผู้พัฒนาจึงมีแนวคิดในการจัดทำเว็บไซต์ BoardHouse ซึ่งเป็นระบบร้านขายบอร์ดเกม เพื่อจำลองการทำงานของระบบ e-Commerce สำหรับการขายบอร์ดเกม

BoardHouse ถูกออกแบบให้ผู้ใช้งานสามารถเลือกดูรายการบอร์ดเกม ค้นหาสินค้า ดูรายละเอียดสินค้า เพิ่มสินค้าลงตะกร้า ทำรายการสั่งซื้อ และติดตามประวัติคำสั่งซื้อได้ ในขณะเดียวกัน ผู้ดูแลระบบสามารถจัดการข้อมูลสินค้า ตรวจสอบคำสั่งซื้อ และปรับสถานะคำสั่งซื้อได้ผ่านหน้า Admin ระบบนี้จึงช่วยให้การซื้อขายบอร์ดเกมมีความสะดวก เป็นระเบียบ และใกล้เคียงกับกระบวนการทำงานของเว็บไซต์ e-Commerce จริง

## การวางแผน Planning

ในขั้นตอนการวางแผนทีมได้เลือกที่จะทำเว็บไซต์ **“House Board”** ซึ่งเป็นเว็บไซต์ eCommerce สำหรับจำหน่ายบอร์ดเกม มีวัตถุประสงค์เพื่อให้ลูกค้าสามารถเลือกค้นหาสินค้า ดูรายละเอียดบอร์ดเกม ค้นหาสินค้า และสั่งซื้อผ่านเว็บไซต์ได้อย่างง่ายดาย

ช่วงแรกของการทำงานทีมพัฒนาได้เลือกใช้ Notion สำหรับการวางแผนและแบ่งหน้าที่รวมถึงกำหนด Timeline เพื่อให้งานสามารถเป็นไปได้ตามกำหนดการ โดยมีเหตุผลการเลือกใช้ Notion เนื่องจาก Notion สามารถรองรับการใช้งานได้หลากหลายรูปแบบ มีขอบเขตการทำงานกว้าง มี Template ให้สามารถเลือกใช้ได้มากมาย สามารถเชิญบุคคลอื่นเข้ามาดูหรือแก้ไขได้อีกด้วย

การเลือกเครื่องมือพัฒนาทีมได้ใช้ Figma ในการออกแบบและทำ Wireframe เนื่องจาก Figma ใช้งานง่ายและมีแหล่งเรียนรู้จำนวนมาก ในส่วนของ Frontend ทีมเลือกใช้ React และบันทึกข้อมูลเป็น Local Storage โดยมี GitHub เป็นตัวกลางในการส่งข้อมูลของแต่ละคน



## เป้าหมายทางธุรกิจและขอบเขต

### วัตถุประสงค์

- เพื่อพัฒนาเว็บไซต์อีคอมเมิร์ซสำหรับจำหน่ายบอร์ดเกมที่ใช้งานได้
- เพื่อให้ผู้ใช้สามารถค้นหา เลือก และสั่งซื้อบอร์ดเกมได้อย่างสะดวก
- เพื่อให้ Admin สามารถจัดการสินค้า สต็อก และคำสั่งซื้อได้อย่างมีประสิทธิภาพ
- เพื่อนำเสนอข้อมูลสินค้าที่ครบถ้วน ช่วยให้ผู้ซื้อตัดสินใจได้ง่ายขึ้น

### ขอบเขตของระบบ

### Customer
- สมัครสมาชิกและเข้าสู่ระบบ
- แก้ไขข้อมูลส่วนตัว
- ดูสินค้าและรายละเอียดของสินค้า
- เพิ่มหรือลดตะกร้าสินค้าและเลือกวิธีชำระเงิน

### Admin
- เข้าสู่ระบบหลังบ้านสำหรับ Admin
- CRUD สินค้า โดยมีชื่อ ราคา รายละเอียด และหมวดหมู่ของสินค้า
- ตรวจสอบประวัติการสั่งซื้อและข้อมูลลูกค้า
- มี Dashboard แสดงจำนวนสินค้า จำนวนออเดอร์ ลูกค้าทั้งหมด และยอดขาย

### Super Admin 
- ได้รับสิทธิ์ทั้งหมดของ Admin
- ดูรายชื่อ Admin
- เพิ่มและแก้ไขข้อมูลส่วนตัว Admin


## การวิเคราะห์ Analysis 

## User Persona


## Functional Requirement

House Board จะแบ่งผู้ใช้งานออกเป็นสามบทบาทด้วยกัน ได้แก่ Customer ผู้ซื้อม, Admin ผู้จำหน่ายผ่านเว็บไซต์, และ Super Admin โดยแต่ละบทบาทจะมี Function ดังนี้

### Customer

| รหัส | ฟังก์ชัน | รายละเอียด | ความสำคัญ |
| ---- | -------- | ----------- | ---------- |
|  C01 | Register / Login | สร้างบัญชี, เข้าสู่ระบบ | High |
|  C02 | แก้ไขข้อมูลส่วนตัว | แก้ไขชื่อ อีเมล รหัสผ่าน ที่อยู่ เบอร์โทร | High |
|  C03 | ดูรายละเอียดสินค้า | แสดงรายการบอร์ดเกม รูป ชื่อ ราคา ประเภท | High |
|  C04 | ค้นหาสินค้า | ค้นหาด้วยชื่อ ประเภท | High |
|  C05 | ฟิลเตอร์ประเภทสินค้า | กรองตามช่วงอายุ ประเภท ราคา ระยะเวลาที่ใช้ในการเล่น | Mediun |
|  C06 | ตะกร้าสินค้า | เพิ่ม/ลด สินค้าถ้าและแสดงยอดรวม | High |
|  C07 | การชำระเงิน | เลือกช่องทางการชำระเงิน | High |
|  C08 | ตรวจสอบที่อยู่ | เลือกที่อยู่หรือเพิ่มที่อยู่ใหม่ | High |
|  C09 | การติดตามออเดอร์ | ดูสถานะการสั่งซื้อ ชำระเงินแล้ว รอจัดส่ง กำลังจัดส่ง ส่งสำเร็จ | High |
|  C10 | ตรวจสอบประวัติการสั่งซื้อ | ดูออเดอร์ที่เคยสั่งซื้อ | Mediun |

---

### Admin

| รหัส | ฟังก์ชัน | รายละเอียด | ความสำคัญ |
| ---- | -------- | ----------- | ---------- |
| A01  | Login | เข้าสู่ระบบ | High |
| A02  | ดูข้อมูล Customer | ดูข้อมูล customer | Mediun |
| A03  | จัดการผู้ใช้ | แก้ไขข้อมูล customer, admin | High |
| A04  | จัดการสินค้า CRUD | เพิ่ม ลบ แก้ไข ข้อมูลสินค้า | High |
| A05  | จัดการออเดอร์ | แก้ไขข้อมูลออเดอร์ | High |
| A06  | Dashboard | แสดงยอดการสั่งซื้อ รายได้ จำนวนลูกค้า | Mediun |

---

### Super Admin

| รหัส | ฟังก์ชัน | รายละเอียด | ความสำคัญ |
| ---- | -------- | ----------- | ---------- |
| SA01  | เพิ่ม Admin คนอื่นได้ | เพิ่ม admin คนอื่น | High |
| SA02  | แก้ไขสิทธิ์ Admin ได้ | เลื่อนขั้น Admin คนอื่นได้, ลบ Admin | Mediun |

---

### System

| รหัส | ฟังก์ชัน | รายละเอียด | ความสำคัญ |
| ---- | -------- | ----------- | ---------- |
| S01  | ลดสินค้า stock | จำนวนของใน Stock ลดตามที่ customer สั่งซื้อ | High |
| S02  | ตรวจสอบ out of stock | ถ้าของใน Stock หมดจะสั้งซื้อไม่ได้ | High |


---

## Diagram
Miro : https://miro.com/app/board/uXjVH-d1Rmk=/?share_link_id=553190737674
### Use Case Diagram
```mermaid
flowchart LR
    Customer["👤<br/>Customer"]

    Admin["👤<br/>Admin"]
    SuperAdmin["👤<br/>SuperAdmin"]

    subgraph System["เว็บซื้อขายบอร์ดเกม"]
        Browse([Browse Boardgame])
        LoginCustomer([Login])
        Search([Search / Filter])
        Detail([View Project Detail])

        Ordering([Ordering])
        Cart([Manage Cart])
        Addon([Select Add-on])
        Checkout([Checkout])
        Payment([Make Payment])
        ProcessPayment([Process Payment])

        History([View Order History])
        Track([Track Order Status])
        Cancel([Cancel Order])

        AdminLogin([login])
        Dashboard([Dashboard])
        ManageProduct([Manage Product])
        ManageOrder([Manage Order])
        ManageCustomer([Manage Customer])
        ManageAdmin([Manage Admin])
    end

    Customer --- Browse
    Customer --- LoginCustomer
    Customer ---Search
    Customer --- Detail
    Customer --- Addon
    Customer --- Cancel

    LoginCustomer --> Ordering
    LoginCustomer --> History

    Ordering -.->|«include»| Cart
    Addon -.->|«extend»| Ordering
    Cart -.->|«include»| Checkout
    Checkout -.->|«include»| Payment
    Payment -.->|«include»| ProcessPayment

    History -.->|«include»| Track
    Cancel -.->|«extend»| History

    AdminLogin --- Admin
    Dashboard --- AdminLogin
    ManageProduct --- AdminLogin
    ManageOrder --- AdminLogin
    ManageCustomer --- AdminLogin

    Track-.->|«include»| ManageOrder
    Browse -.->|«include»| ManageProduct

    AdminLogin --- SuperAdmin
    ManageAdmin --- SuperAdmin

```

### Class Diagram
```mermaid
classDiagram
    direction LR

    class Customer {
        - string userId
        - string username
        - string password
        - string email
        - string phone
        - string location
        - string name
        + register() bool
        + login() bool
        + logout() void
        + addInfo() bool
        + updateInfo() bool
    }

    class Cart {
        - int cartId
        + addItem() void
        + removeItem() void
        + calculateTotal() float
        + checkout() Order
    }

    class CartProduct {
        - int quantity
        - float price
        + allTotal() int
        + viewItem() list
    }

    class Product {
        - int productId
        - string nameProduct
        - float price
        - string description
        - string category
        + addproduct() void
        + updateproduct() void
        
    }

    class Order {
        - int orderId
        - datetime orderDate
        - string status
        - float totalAmount
        + createOrder() bool
        + checkStatus() string
        + confirm() void
    }

    class Payment {
        - int paymentId
        - float numAmount
        - datetime payDate
        - string paymentStatus
        + processPay() bool
    }

    class OrderDetail {
        - int orderDetailId
        - string nameProduct
        - int quantity
        - float unitPrice
        + calculateSubtotal() float
    }

    class Admin {
        - int adminId
        - string adminName
        - string password
        + login() bool
        + logout() void
        + viewAddress() list
        + manageProducts() void
        + manageOrders() void
    }

    class Stock {
        - string nameProduct
        - int quantity
        + updateStock() void
        + checkProductAmount() int
    }

    %% Customer shopping flow
    Customer "1" --> "1" Cart : มีตะกร้า
    Cart "1" --> "*" CartProduct : มีรายการ
    CartProduct "*" --> "1" Product : ถูกเลือกใส่ตะกร้า

    %% Order and payment flow
    Customer "1" --> "*" Order : สั่งซื้อ
    Order "1" --> "*" OrderDetail : รายละเอียด
    Order "1" --> "1" Payment : ชำระเงิน
    Product "1" --> "*" OrderDetail : ถูกสั่งซื้อ

    %% Admin and stock management
    Product "1" --> "1" Stock : มีสต็อก
    Customer "*" <-- "*" Admin : ตรวจสอบ
    Order "*" <-- "1" Admin : จัดการคำสั่งซื้อ
    Product "*" <-- "1" Admin : จัดการสินค้า
```

### Sequence Diagram

#### Customer Checkout Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Product
    participant Cart
    participant CartProduct
    participant Order
    participant OrderDetail
    participant Stock
    participant Payment

    rect rgb(255, 248, 184)
        Note over Customer,CartProduct: Browse & Add to Cart
        Customer->>Product: เลือกสินค้า
        Product-->>Customer: แสดงรายละเอียดสินค้า
        Customer->>Cart: เพิ่มสินค้า
        Cart->>CartProduct: ดูรายการ
        CartProduct-->>Cart: เพิ่มรายการสำเร็จ
        Cart->>Cart: คำนวณยอดรวม
        Cart-->>Customer: แสดงข้อมูลรวมในตะกร้า
    end

    rect rgb(255, 248, 184)
        Note over Customer,OrderDetail: Checkout
        Customer->>Cart: ชำระเงิน
        Cart->>Order: สร้างคำสั่งซื้อ
        Order->>CartProduct: ดึงรายการสินค้า
        CartProduct-->>Order: รายการสินค้า + จำนวน

        loop สำหรับแต่ละสินค้าในตะกร้า
            Order->>Stock: เช็คสต็อกสินค้า
            Stock-->>Order: จำนวนคงเหลือ
        end

        alt สินค้าพร้อมส่งครบ
            Order->>OrderDetail: บันทึกรายละเอียดออเดอร์
            Order-->>Customer: สร้างออเดอร์สำเร็จ ไปหน้าชำระเงิน
        else สินค้าไม่พอ
            Order-->>Customer: แจ้งเตือนสินค้าไม่เพียงพอ
        end
    end

    rect rgb(255, 248, 184)
        Note over Customer,Payment: Make Payment / Process Payment
        Customer->>Payment: ชำระเงิน
        Payment->>Order: เช็คสถานะ
        Order-->>Payment: สถานะออเดอร์ (รอชำระเงิน)
        Payment->>Payment: บันทึกข้อมูลและวันที่ชำระเงิน
        Payment-->>Order: อัปเดตสถานะเป็น "ชำระเงินแล้ว"
        Order->>Stock: อัปเดตสต็อก
        Stock-->>Order: อัปเดตสต็อกสำเร็จ
        Order-->>Customer: ยืนยันการชำระเงิน
    end
```

#### Admin Order Management Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Order
    participant OrderDetail
    participant Customer
    participant Stock

    Admin->>Admin: เลือกเมนูจัดการคำสั่งซื้อ
    Admin->>Order: ดึงรายการคำสั่งซื้อทั้งหมด
    Order-->>Admin: รายการคำสั่งซื้อ + สถานะ
    Admin->>Order: เลือกสถานะคำสั่งซื้อ
    Order-->>Admin: สถานะปัจจุบัน

    alt อัปเดตสถานะคำสั่งซื้อ เช่น "จัดส่งแล้ว"
        Admin->>Order: อัปเดตสถานะ
        Order->>OrderDetail: ดึงรายละเอียดสินค้าในคำสั่งซื้อ
        OrderDetail-->>Order: รายการสินค้า
        Order->>Customer: แจ้งอัปเดตสถานะคำสั่งซื้อ
    else ยกเลิกคำสั่งซื้อ
        Admin->>Order: ยกเลิกคำสั่งซื้อ
        Order->>Stock: อัปเดตสต็อกสินค้า
        Stock-->>Order: อัปเดตสำเร็จ
        Order->>Customer: แจ้งยกเลิกคำสั่งซื้อ
    end

    Order-->>Admin: บันทึกการเปลี่ยนแปลงสำเร็จ
```
### System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser) - React SPA, ไม่มี Backend Server"]
        subgraph Presentation["Presentation Layer - src/routes + components"]
            HomeRoute["HomeRoute<br/>Browse / Search / Detail"]
            AuthRoutes["AuthRoutes<br/>Login / Register"]
            CartRoute["CartRoute<br/>Manage Cart"]
            CheckoutRoute["CheckoutRoute<br/>Checkout / Payment"]
            OrdersRoute["OrdersRoute<br/>Order History / Track"]
            ProfileRoute["ProfileRoute<br/>Profile / Address"]
            AdminRoute["AdminRoute<br/>Dashboard / Manage All"]
        end
        subgraph AppCore["Application Core"]
            AppJsx["App.jsx<br/>Root State + Routing"]
        end
        subgraph BusinessLogic["Business Logic Layer - src/utils"]
            UserStorage["userStorage.js<br/>Auth, Address, Role"]
            OrderStorage["orderStorage.js<br/>Order, Status Flow"]
            CartStorage["cartStorage.js<br/>Cart Ops"]
            ProductStorage["productStorage.js<br/>Product CRUD"]
            Validation["validation.js<br/>Form Validation (ใหม่)"]
            Roles["roles.js<br/>Role Guard"]
        end
        subgraph DataLayer["Data Access Layer"]
            LocalDb["localStorageDb.js<br/>read/write wrapper"]
        end
        subgraph Storage["Persistence"]
            LocalStorage[("localStorage<br/>users, orders, products, cart")]
        end
        SeedData["seedData.js<br/>Initial Mock Data"]
    end
    Presentation --> AppJsx
    AppJsx --> BusinessLogic
    Presentation -.validate ก่อนส่ง.-> Validation
    UserStorage --> LocalDb
    OrderStorage --> LocalDb
    CartStorage --> LocalDb
    ProductStorage --> LocalDb
    LocalDb --> LocalStorage
    SeedData -.seed ครั้งแรก.-> LocalDb
    Roles --> AppJsx
```
---

## Development

## System Structure

House Board เป็นเว็บจำหน่ายบอร์ดเกมแบบ eCommerce แต่อย่างไรก็ตามเนื่องจากโปรเจกต์นี้เป็นการบันทึกข้อมูลแบบ Local Storage ดังนั้นโครงสร้างของระบบจะแบ่งออกเป็น 3 ส่วนหลัก ได้แก่ Frontend, Backend และ Local Storage


### Frontend

Frontend จะเป็นส่วนที่ผู้ใช้งานมองเห็นและใช้งานผ่านเว็บไซต์ เช่น หน้าแรก หน้าเข้าสู่ระบบ หน้าแสดงสินค้า การแก้ไขสินค้า ตะกร้า และการ Checkout มีหน้าที่แสดงข้อมูลสินค้า รับข้อมูลจากผู้ใช้งาน และแสดงรูปภาพสินค้าที่ถูกจัดเก็บไว้ในเครื่องคอมพิวเตอร์ผ่าน Backend

### Backend

Backend ของระบบใช้สำหรับให้บริการไฟล์รูปภาพสินค้า โดยใช้เครื่องคอมพิวเตอร์ของทีมเป็นตัวจัดเก็บรูปภาพ และใช้ Backend เป็นตัวกลางในการส่งรูปภาพไปแสดงบนหน้าเว็บไซต์

Backend ที่ใช้ในโปรเจกต์นี้จะพัฒนาโดยใช้ Node.js และ Express.js เพื่อสร้าง Local File Server สำหรับให้ Frontend เรียกใช้งานรูปภาพสินค้า

### Local Storage

Local Storage ใช้สำหรับจัดเก็บข้อมูลภายใน Browser ของผู้ใช้งาน เช่น ข้อมูลสินค้า ข้อมูลผู้ใช้งาน ข้อมูลตะกร้าสินค้า และข้อมูลคำสั่งซื้อ

อย่างไรก็ตาม Local Storage ไม่ใช่ Database จริง เนื่องจากข้อมูลถูกจัดเก็บไว้ที่เครื่องของผู้ใช้งานแต่ละคน ไม่ได้ถูกจัดเก็บไว้บน Server กลาง

## Tech Stack

โครงการ **BoardHouse** เป็นเว็บแอปพลิเคชันสำหรับขายบอร์ดเกม โดยเลือกใช้เทคโนโลยีที่เหมาะสมกับการพัฒนา Frontend Web Application และใช้ `localStorage` เป็นฐานข้อมูลจำลองสำหรับจัดเก็บข้อมูลภายในระบบ

### Frontend

| Technology   | Description  |
| ------------ | ---------------------------------- |
| React        | ใช้สำหรับพัฒนา User Interface แบบ Component-Based ทำให้สามารถแบ่งส่วนของหน้าเว็บออกเป็น Component เช่น Navbar, Product Card, Cart Item, Form และ Table ได้อย่างเป็นระบบ |
| JavaScript   | ใช้สำหรับเขียน Logic การทำงานของระบบ เช่น การจัดการสินค้า ตะกร้าสินค้า การเข้าสู่ระบบ และการจัดการคำสั่งซื้อ |
| Tailwind CSS | ใช้สำหรับออกแบบ Layout, Spacing, Color, Responsive Design และปรับแต่ง UI ให้เหมาะกับธีมของเว็บไซต์ |
| Bootstrap    | ใช้สำหรับ Component สำเร็จรูปบางส่วน เช่น Button, Form, Table, Navbar และ Modal เพื่อช่วยให้พัฒนา UI ได้รวดเร็วขึ้น   |

### Data Storage

| Technology   | Description                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| localStorage | ใช้เป็น Mock Database สำหรับจัดเก็บข้อมูลสินค้า ผู้ใช้งาน ตะกร้าสินค้า และคำสั่งซื้อ โดยไม่ต้องเชื่อมต่อกับฐานข้อมูลจริง |

### Development Tools

| Tool               | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| Visual Studio Code | ใช้เป็น Code Editor สำหรับเขียนและจัดการไฟล์โปรเจกต์                    |
| Git                | ใช้สำหรับ Version Control เพื่อติดตามการเปลี่ยนแปลงของโค้ด              |
| GitHub             | ใช้สำหรับจัดเก็บ Source Code และช่วยให้สมาชิกในทีมสามารถทำงานร่วมกันได้ |




## การออกแบบ UX และ UI


### ทีมใช้ Photoshop สำหรับทำ Wireframe

#### Customer Wireframe

![Customer Wireframe](docs/images/uxui-customer-wireframe.png)

#### Admin Wireframe

![Admin Wireframe](docs/images/uxui-admin-wireframe.png)

---


## Testing Approach

### Function Testing
https://quilled-edge-054.notion.site/3a3dadaf37a28079ac5df91952911184?v=a57dadaf37a2832fac5f88ef334e57c4&source=copy_link </br>
| ลำดับ | ชื่อ-นามสกุล            | กลุ่ม | รหัสนักศึกษา | ลิ้งค์ |
| ----- | ----------------------- | ----- | ------------ | ----- |
| 1     | Overall Team's UAT |  |  | [FT Result](https://app.notion.com/p/3a1dadaf37a28027bfbdcb58b847b5cf?v=514dadaf37a2823b85b188e55ac23683&source=copy_link) |
| 2     | ภูริวัชร์ จินดาพงษ์ศิริ | T003  | 67182803     | [FT Purivat](https://app.notion.com/p/3a2dadaf37a2809aa6e6e43f927bc880?v=ea3dadaf37a283cd90cc085a4300fed9) |
| 3     | ภานุกร แสงมณี           | T001  | 67161002     | [FT Phanukon](https://quilled-edge-054.notion.site/3a2dadaf37a280c89ae1d139a73fbdcd?v=62cdadaf37a282c694e00899daed109e&source=copy_link) |
| 4     | บุรพร วันทอง            | T001  | 67167437     | [FT Buraphorn](https://quilled-edge-054.notion.site/3a2dadaf37a28042aaa6cf6913afc0f8?v=a02dadaf37a2833381f888987d344a59&source=copy_link) |
| 5     | กนก รัตนเรืองรักษ์      | T001  | 67188118     | [FT Kanok](https://app.notion.com/p/3a2dadaf37a28028afacf3820d12d683?v=512dadaf37a282ac9c2e08952eb11778&source=copy_link) |


### User Acceptance 
https://quilled-edge-054.notion.site/3a1dadaf37a28069a987e5e7becfb3ff?v=3a1dadaf37a2807aadf7000c32cf3915 </br>
| ลำดับ | ชื่อ-นามสกุล            | กลุ่ม | รหัสนักศึกษา | ลิ้งค์ |
| ----- | ----------------------- | ----- | ------------ | ----- |
| 1     | Overall Team's UAT |  |  | [UAT Result](https://app.notion.com/p/3a1dadaf37a28027bfbdcb58b847b5cf?v=514dadaf37a2823b85b188e55ac23683&source=copy_link) |
| 2     | ภูริวัชร์ จินดาพงษ์ศิริ | T003  | 67182803     | [UAT Purivat](https://app.notion.com/p/3a1dadaf37a2809ba7b3dde503ed4837?v=7f1dadaf37a28299937c88bb8772b0cc&source=copy_link) |
| 3     | ภานุกร แสงมณี           | T001  | 67161002     | [UAT Phanukon](https://app.notion.com/p/3a1dadaf37a2803d9eeff2f8da04a69a?v=e83dadaf37a2830a95ab0806a4ed061a&source=copy_link) |
| 4     | บุรพร วันทอง            | T001  | 67167437     | [UAT Buraphorn](https://app.notion.com/p/3a1dadaf37a280b79c33ec14abbc10b5?v=e32dadaf37a282baae72881bfe56a2fb&source=copy_link) |
| 5     | กนก รัตนเรืองรักษ์      | T001  | 67188118     | [UAT Kanok](https://app.notion.com/p/3a1dadaf37a28045a7bfc15d2f441079?v=7b0dadaf37a28311898a08a38a887d38&source=copy_link) |

---

## Deployment

### Vercel
ทีมเลือกให้ Vercel เนื่องจากสามารถทำได้ง่ายและรวจเร็ว </br>

![](docs/images/deploy-vercel-1.png)

![](docs/images/deploy-vercel-2.png)

### เหตุผลที่เลือก

---

## Maintenance

ถ้าเว็บมีปัญหาจะทำยังไง แก้ไขได้ในเวลาเท่าไหร่

---

## Result

ภาพ website ตอนเสร็จแล้ว

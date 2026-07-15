import React, { useState } from "react";
import { getOrders, updateOrderStatus } from "../utils/orderStorage.js";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../utils/productStorage.js";
import { getUsers } from "../utils/userStorage.js";
import { money } from "../utils/format.js";
import { resetStorage } from "../utils/localStorageDb.js";
// 💡 ดึงประเภทหมวดหมู่เดียวกับหน้าโฮมมาใช้ (ถ้าดึงจากไฟล์นี้ไม่ได้ ให้เปลี่ยนพาธให้ตรงกับโปรเจกต์หนูนะคะ)
import { categories } from "../data/products.js";
import { orderStatuses } from "../data/seedData.js";
import OrderDetailModal from "../components/OrderDetailModal.jsx";

function AdminRoute() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [message, setMessage] = useState("");
  
  const [dashboardData, setDashboardData] = useState(() => ({
    products: getProducts(),
    orders: getOrders(),
    users: getUsers(),
  }));

  // State ฟิลด์ข้อมูลสินค้า
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newDescription, setNewDescription] = useState("");
  // 💡 เพิ่ม State สำหรับเลือกประเภทสินค้า (เริ่มต้นเลือกประเภทแรกที่ไม่ใช่ "All")
  const [newCategory, setNewCategory] = useState(() => {
    const defaultCat = categories.find(cat => cat !== "All");
    return defaultCat || "General";
  });
  const [editingId, setEditingId] = useState(null);

  // State สำหรับหน้า Orders (ดูรายละเอียด + เปลี่ยนสถานะ order)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");

  // 🔎 ช่องค้นหาในหน้ารายชื่อลูกค้า
  const [customerSearch, setCustomerSearch] = useState("");

  const { products, orders, users } = dashboardData;
  const customers = users.filter((user) => user.role === "customer");
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  // 💡 รวมสถิติการใช้งานของลูกค้าแต่ละคน โดยจับคู่ออเดอร์ (order.userId) กับผู้ใช้ (user.id)
  //    ได้ออกมาเป็น จำนวนออเดอร์ / ยอดซื้อรวม / วันที่สั่งซื้อล่าสุด ของลูกค้าทุกคน
  const customersWithStats = customers.map((customer) => {
    const customerOrders = orders.filter((order) => order.userId === customer.id);
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = customerOrders.reduce(
      (latest, order) => (!latest || order.date > latest ? order.date : latest),
      ""
    );
    return {
      ...customer,
      orderCount: customerOrders.length,
      totalSpent,
      lastOrderDate,
    };
  });

  // ลูกค้าที่ "เข้ามาใช้บริการจริง" = มีออเดอร์อย่างน้อย 1 รายการ
  const activeCustomerCount = customersWithStats.filter((c) => c.orderCount > 0).length;

  // กรองรายชื่อตามคำค้น (ชื่อ / อีเมล / เบอร์โทร)
  const filteredCustomers = customersWithStats.filter((customer) => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      customer.name.toLowerCase().includes(keyword) ||
      customer.email.toLowerCase().includes(keyword) ||
      (customer.phone || "").toLowerCase().includes(keyword)
    );
  });

  // ออเดอร์ล่าสุด 5 รายการ (ใช้โชว์บนแดชบอร์ด)
  const recentOrders = [...orders]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
    .map((order) => ({
      ...order,
      customerName: users.find((user) => user.id === order.userId)?.name || "ผู้เยี่ยมชม",
    }));

  // ลูกค้าที่ซื้อเยอะสุด 5 อันดับ (ใช้โชว์บนแดชบอร์ด)
  const topCustomers = [...customersWithStats]
    .filter((customer) => customer.orderCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const stats = [
    { label: "Total Products", value: products.length, icon: "box" },
    { label: "Total Orders", value: orders.length, icon: "bag" },
    { label: "Total Customers", value: customers.length, icon: "users" },
    { label: "Total Sales", value: money(revenue), icon: "cash" },
  ];

  // แปลงชื่อลูกค้าเป็นอักษรย่อ ใช้ทำไอคอนวงกลม avatar
  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function refreshData() {
    setDashboardData({
      products: getProducts(),
      orders: getOrders(),
      users: getUsers(),
    });
  }

  function handleResetData() {
    resetStorage();
    refreshData();
    setMessage("Mock data has been reset.");
  }

  function handleSaveProduct(e) {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) {
      alert("กรุณากรอกข้อมูลหลักให้ครบถ้วน (ชื่อ, ราคา, คลัง)");
      return;
    }

    // 💡 แพ็กข้อมูลส่งเข้าระบบ โดยรอบนี้มีประเภทสินค้า (category) ติดไปด้วยแล้ว!
    const itemData = {
      name: newName,
      price: Number(newPrice),
      stock: Number(newStock),
      image: newImage || "https://placehold.co/300x200?text=No+Image",
      description: newDescription, 
      category: newCategory, 
    };

    if (editingId) {
      updateProduct(editingId, itemData);
      setEditingId(null);
    } else {
      addProduct(itemData);
    }
    
    refreshData();

    // เคลียร์ฟอร์ม
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setNewImage("");
    setNewDescription("");
    const defaultCat = categories.find(cat => cat !== "All");
    setNewCategory(defaultCat || "General");
    alert("บันทึกข้อมูลสินค้าและประเภทเรียบร้อยแล้วค่ะ!");
  }

  function handleEditClick(product) {
    setEditingId(product.id);
    setNewName(product.name);
    setNewPrice(product.price);
    setNewStock(product.stock);
    setNewImage(product.image || "");
    setNewDescription(product.description || "");
    // ดึงประเภทเดิมของสินค้าชิ้นนั้นขึ้นมาแสดงใน Dropdown ค้างไว้
    setNewCategory(product.category || categories.find(cat => cat !== "All") || "General");
  }

  function handleDeleteClick(id) {
    if (confirm("หนูแน่ใจใช่ไหมคะว่าจะลบสินค้าชิ้นนี้?")) {
      deleteProduct(id);
      refreshData();
    }
  }

  function getCustomerName(userId) {
    const user = users.find((item) => item.id === userId);
    return user ? user.name : "Guest";
  }

  function handleOrderStatusChange(orderId, status) {
    const target = orders.find((order) => order.id === orderId);
    if (target && target.status === "Completed") {
      // ออเดอร์ที่ Completed แล้วห้ามแก้ไขสถานะอีก
      return;
    }
    updateOrderStatus(orderId, status);
    refreshData();
    setSelectedOrder((current) =>
      current && current.id === orderId ? { ...current, status, tone: status === "Completed" ? "primary" : "soft" } : current
    );
  }

  const filteredOrders = orders.filter((order) => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      order.id.toLowerCase().includes(query) ||
      getCustomerName(order.userId).toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  return (
    <section className="py-5">
      <div className="container-xxl">
        <div className="row g-4">
          
          <aside className="col-lg-3">
            <h2 className="h6 text-muted text-uppercase mb-3">Admin</h2>
            <div className="list-group shadow-sm">
              <button className={`list-group-item list-group-item-action ${currentTab === "dashboard" ? "active" : ""}`} type="button" onClick={() => setCurrentTab("dashboard")}>
                Dashboard
              </button>
              <button className={`list-group-item list-group-item-action ${currentTab === "products" ? "active" : ""}`} type="button" onClick={() => setCurrentTab("products")}>
                Products
              </button>
              <button className={`list-group-item list-group-item-action ${currentTab === "customers" ? "active" : ""}`} type="button" onClick={() => setCurrentTab("customers")}>
                Customers
              </button>
              <button className={`list-group-item list-group-item-action ${currentTab === "orders" ? "active" : ""}`} type="button" onClick={() => setCurrentTab("orders")}>
                Orders
              </button>
            </div>
          </aside>

          <div className="col-lg-9">
            
            {/* ================= 1. หน้า DASHBOARD ================= */}
            {currentTab === "dashboard" && (
              <>
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                  <div>
                    <h1 className="page-title mb-2">Dashboard</h1>
                    <p className="lead text-muted mb-0">Overview of the BoardHouse store.</p>
                  </div>
                  <div className="d-grid gap-2 d-md-block">
                    <button className="btn btn-outline-danger" type="button" onClick={handleResetData}>
                      Reset Mock Data
                    </button>
                  </div>
                </div>
                {message && <div className="alert alert-success border-0 shadow-sm">{message}</div>}
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {stats.map((stat) => (
                    <div className="col" key={stat.label}>
                      <article className="card stat-card h-100 shadow-sm">
                        <div className="card-body d-flex align-items-center gap-3 p-4">
                          <span className={`stat-icon ${stat.icon}`} />
                          <div>
                            <p className="mb-1 text-muted">{stat.label}</p>
                            <strong className="display-6">{stat.value}</strong>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>

                {/* แถวล่าง: ออเดอร์ล่าสุด + ลูกค้าซื้อเยอะสุด */}
                <div className="row g-4 mt-1">
                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">Recent Orders</h5>
                          <button className="btn btn-sm btn-link text-decoration-none p-0" type="button" onClick={() => setCurrentTab("orders")}>
                            ดูทั้งหมด →
                          </button>
                        </div>
                        {recentOrders.length === 0 ? (
                          <p className="text-muted mb-0">ยังไม่มีคำสั่งซื้อในระบบ</p>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th className="py-2">รหัส</th>
                                  <th className="py-2">ลูกค้า</th>
                                  <th className="py-2">วันที่</th>
                                  <th className="py-2 text-end">ยอด</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recentOrders.map((order) => (
                                  <tr key={order.id}>
                                    <td className="text-muted">{order.id}</td>
                                    <td className="fw-semibold">{order.customerName}</td>
                                    <td className="text-muted">{order.date}</td>
                                    <td className="text-end">{money(order.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">Top Customers</h5>
                          <button className="btn btn-sm btn-link text-decoration-none p-0" type="button" onClick={() => setCurrentTab("customers")}>
                            ดูทั้งหมด →
                          </button>
                        </div>
                        {topCustomers.length === 0 ? (
                          <p className="text-muted mb-0">ยังไม่มีลูกค้าที่สั่งซื้อ</p>
                        ) : (
                          <ul className="list-group list-group-flush">
                            {topCustomers.map((customer, index) => (
                              <li key={customer.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                                <span className="customer-avatar">{initials(customer.name)}</span>
                                <div className="flex-grow-1">
                                  <span className="fw-semibold d-block">{customer.name}</span>
                                  <small className="text-muted">{customer.orderCount} ออเดอร์</small>
                                </div>
                                <span className="fw-bold text-nowrap">{money(customer.totalSpent)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= หน้า CUSTOMERS (รายชื่อลูกค้าที่เข้ามาใช้บริการ) ================= */}
            {currentTab === "customers" && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">Customers</h1>
                  <p className="lead text-muted mb-0">รายชื่อลูกค้าที่สมัครและเข้ามาใช้บริการเว็บไซต์</p>
                </div>

                <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
                  <div className="col">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <p className="mb-1 text-muted small">ลูกค้าทั้งหมด</p>
                        <strong className="h3">{customers.length}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <p className="mb-1 text-muted small">เคยสั่งซื้อ</p>
                        <strong className="h3">{activeCustomerCount}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <p className="mb-1 text-muted small">ยอดซื้อรวม</p>
                        <strong className="h3">{money(revenue)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3 border-bottom">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="🔎 ค้นหาชื่อ อีเมล หรือเบอร์โทรลูกค้า..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">ลูกค้า</th>
                            <th className="py-3">ติดต่อ</th>
                            <th className="py-3 text-center">ออเดอร์</th>
                            <th className="py-3 text-end">ยอดซื้อรวม</th>
                            <th className="py-3">สั่งซื้อล่าสุด</th>
                            <th className="px-4 py-3 text-center">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center text-muted py-5">
                                ไม่พบลูกค้าที่ตรงกับคำค้นหา
                              </td>
                            </tr>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <tr key={customer.id}>
                                <td className="px-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <span className="customer-avatar">{initials(customer.name)}</span>
                                    <div>
                                      <span className="fw-semibold text-dark d-block">{customer.name}</span>
                                      <small className="text-muted">#{customer.id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="d-block text-dark">{customer.email}</span>
                                  <small className="text-muted">{customer.phone || "—"}</small>
                                </td>
                                <td className="text-center">{customer.orderCount}</td>
                                <td className="text-end fw-semibold">{money(customer.totalSpent)}</td>
                                <td className="text-muted">{customer.lastOrderDate || "—"}</td>
                                <td className="text-center">
                                  {customer.orderCount > 0 ? (
                                    <span className="badge bg-success-subtle text-success px-2 py-1">Active</span>
                                  ) : (
                                    <span className="badge bg-light border text-muted px-2 py-1">ยังไม่สั่งซื้อ</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= 2. หน้า PRODUCTS ================= */}
            {currentTab === "products" && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">Products Management</h1>
                  <p className="lead text-muted mb-0">จัดการข้อมูลสต็อก รูปภาพ รายละเอียด และประเภทสินค้า</p>
                </div>

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title text-muted text-uppercase mb-3" style={{ fontSize: "0.85rem" }}>
                      {editingId ? "✏️ Mode: แก้ไขข้อมูลสินค้า" : "＋ Mode: เพิ่มสินค้าใหม่"}
                    </h5>
                    <form onSubmit={handleSaveProduct} className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small text-muted">ชื่อสินค้า</label>
                        <input type="text" className="form-control" placeholder="เช่น Catan, Dixit" value={newName} onChange={(e) => setNewName(e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted">ลิงก์ URL รูปภาพสินค้า</label>
                        <input type="text" className="form-control" placeholder="https://..." value={newImage} onChange={(e) => setNewImage(e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">ราคาขาย (บาท)</label>
                        <input type="number" className="form-control" placeholder="ราคาสินค้า" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">จำนวนในสต็อก (ชิ้น)</label>
                        <input type="number" className="form-control" placeholder="จำนวนสินค้าในคลัง" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
                      </div>
                      
                      {/* 💡 เพิ่มกล่อง Dropdown สำหรับเลือกประเภทสินค้าตามที่กำหนดไว้ในหน้าโฮม */}
                      <div className="col-md-4">
                        <label className="form-label small text-muted">ประเภทสินค้า</label>
                        <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                          {categories
                            .filter((cat) => cat !== "All") // กรองเอาคำว่า "All" ออกไป ไม่ให้แอดมินเผลอไปกดตั้งค่าสินค้าเป็นประเภท "ทั้งหมด"
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-muted">รายละเอียด / คำอธิบายสินค้า</label>
                        <textarea className="form-control" rows="3" placeholder="เขียนอธิบายสรรพคุณสินค้า..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)}></textarea>
                      </div>
                      <div className="col-12 d-flex gap-2 justify-content-end pt-2">
                        {editingId && (
                          <button type="button" className="btn btn-light border" onClick={() => { setEditingId(null); setNewName(""); setNewPrice(""); setNewStock(""); setNewImage(""); setNewDescription(""); }}>
                            ยกเลิกแก้ไข
                          </button>
                        )}
                        <button type="submit" className="btn btn-primary px-4">
                          {editingId ? "อัปเดตข้อมูล" : "บันทึกสินค้า"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="py-3">สินค้า</th>
                            <th className="py-3">ประเภท</th> {/* 💡 เพิ่มคอลัมน์โชว์ประเภทสินค้าในตารางแอดมิน */}
                            <th className="py-3">ราคา</th>
                            <th className="py-3">คงเหลือ</th>
                            <th className="px-4 py-3 text-end">เครื่องมือ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id}>
                              <td className="px-4 text-muted">#{product.id}</td>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <img src={product.image || "https://placehold.co/300x200?text=No+Image"} alt={product.name} className="rounded" style={{ width: "45px", height: "45px", objectFit: "cover" }} />
                                  <div>
                                    <span className="fw-semibold text-dark d-block">{product.name}</span>
                                    <small className="text-muted text-truncate d-block" style={{ maxWidth: "200px" }}>{product.description || "ไม่มีรายละเอียด"}</small>
                                  </div>
                                </div>
                              </td>
                              {/* 💡 โชว์ป้ายประเภทสินค้าเพื่อความง่ายในการตรวจสอบ */}
                              <td>
                                <span className="badge rounded-pill bg-light border text-dark">
                                  {product.category || "General"}
                                </span>
                              </td>
                              <td>{product.price.toLocaleString()} บาท</td>
                              <td>
                                <span className={`badge ${product.stock > 0 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} px-2 py-1`}>
                                  {product.stock} ชิ้น
                                </span>
                              </td>
                              <td className="px-4 text-end">
                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEditClick(product)}>แก้ไข</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(product.id)}>ลบ</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= 3. หน้า ORDERS ================= */}
            {currentTab === "orders" && (
              <>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div>
                    <h1 className="page-title mb-2">Orders Management</h1>
                    <p className="lead text-muted mb-0">จัดการคำสั่งซื้อของลูกค้าในระบบ</p>
                  </div>
                  <div style={{ minWidth: "260px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาด้วยเลขออเดอร์, ชื่อลูกค้า, สถานะ..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">เลขออเดอร์</th>
                            <th className="py-3">ลูกค้า</th>
                            <th className="py-3">วันที่</th>
                            <th className="py-3">รายการ</th>
                            <th className="py-3">ยอดรวม</th>
                            <th className="py-3">สถานะ</th>
                            <th className="px-4 py-3 text-end">เครื่องมือ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-4 fw-semibold text-dark">{order.id}</td>
                              <td>{getCustomerName(order.userId)}</td>
                              <td className="text-muted">{order.date}</td>
                              <td className="text-muted">
                                <span className="text-truncate d-block" style={{ maxWidth: "220px" }}>
                                  {order.items}
                                </span>
                              </td>
                              <td className="text-brand fw-semibold">{money(order.total)}</td>
                              <td>
                                {order.status === "Completed" ? (
                                  <span className="badge rounded-pill status primary">
                                    <i className="bi bi-lock-fill me-1" />
                                    {order.status}
                                  </span>
                                ) : (
                                  <select
                                    className="form-select form-select-sm"
                                    style={{ minWidth: "160px" }}
                                    value={order.status}
                                    onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                  >
                                    {orderStatuses.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="px-4 text-end">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  ดูรายละเอียด
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center text-muted py-5">
                                ไม่พบคำสั่งซื้อที่ตรงกับการค้นหา
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          customerName={getCustomerName(selectedOrder.userId)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}

export default AdminRoute;
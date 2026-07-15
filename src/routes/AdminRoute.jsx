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

  // State ฟิลด์ข้อมูลสินค้าทั่วไป
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newImage, setNewImage] = useState(""); // ตัวนี้จะเก็บได้ทั้ง URL และ Base64 String ค่ะ
  const [newDescription, setNewDescription] = useState("");
  
  // 💡 เพิ่ม State สำหรับตัวกรองอายุและจำนวนผู้เล่น
  const [newMinAge, setNewMinAge] = useState(8);
  const [newMinPlayers, setNewMinPlayers] = useState(2);
  const [newMaxPlayers, setNewMaxPlayers] = useState(4);

  // 💡 เพิ่ม State สำหรับเลือกประเภทสินค้า (เริ่มต้นเลือกประเภทแรกที่ไม่ใช่ "All")
  const [newCategory, setNewCategory] = useState(() => {
    const defaultCat = categories.find(cat => cat !== "All");
    return defaultCat || "General";
  });
  const [editingId, setEditingId] = useState(null);

  // State สำหรับหน้า Orders (ดูรายละเอียด + เปลี่ยนสถานะ order)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");

  const { products, orders, users } = dashboardData;
  const customers = users.filter((user) => user.role === "customer");
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  const stats = [
    { label: "Total Products", value: products.length, icon: "box" },
    { label: "Total Orders", value: orders.length, icon: "bag" },
    { label: "Total Customers", value: customers.length, icon: "users" },
    { label: "Total Sales", value: money(revenue), icon: "cash" },
  ];

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

  // 🖼️ ฟังก์ชันแปลง "ไฟล์รูปภาพในเครื่อง" ให้เป็น Base64 String เพื่อเก็บใน localStorage
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // จำกัดขนาดไฟล์ที่ 1.5MB เพื่อไม่ให้เกินโควต้าสูงสุดของ localStorage (5MB)
      if (file.size > 1.5 * 1024 * 1024) {
        alert("ไฟล์ภาพมีขนาดใหญ่เกินไปค่ะ (ไม่ควรเกิน 1.5MB) เพื่อป้องกันพื้นที่จัดเก็บข้อมูลในเบราว์เซอร์เต็ม");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // เมื่อแปลงเสร็จ จะได้ Base64 String แล้วนำไปเก็บไว้ใน State ของรูปภาพ
        setNewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function handleSaveProduct(e) {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) {
      alert("กรุณากรอกข้อมูลหลักให้ครบถ้วน (ชื่อ, ราคา, คลัง)");
      return;
    }

    // 💡 แพ็กข้อมูลส่งเข้าระบบ รวมถึงหมวดหมู่, ตัวกรองอายุ และตัวกรองจำนวนผู้เล่นแล้ว!
    const itemData = {
      name: newName,
      price: Number(newPrice),
      stock: Number(newStock),
      image: newImage || "https://placehold.co/300x200?text=No+Image",
      description: newDescription, 
      category: newCategory,
      minAge: Number(newMinAge),
      minPlayers: Number(newMinPlayers),
      maxPlayers: Number(newMaxPlayers),
    };

    if (editingId) {
      updateProduct(editingId, itemData);
      setEditingId(null);
    } else {
      addProduct(itemData);
    }
    
    refreshData();
    clearForm();
    alert("บันทึกข้อมูลสินค้าและเงื่อนไขตัวกรองเรียบร้อยแล้วค่ะ!");
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
    
    // 💡 ดึงค่าตัวกรองเดิมมาแสดงใน Form ถ้าไม่มีข้อมูลดั้งเดิมจะใช้ค่าเริ่มต้น (8, 2, 4)
    setNewMinAge(product.minAge !== undefined ? product.minAge : 8);
    setNewMinPlayers(product.minPlayers !== undefined ? product.minPlayers : 2);
    setNewMaxPlayers(product.maxPlayers !== undefined ? product.maxPlayers : 4);
  }

  function handleDeleteClick(id) {
    if (confirm("หนูแน่ใจใช่ไหมคะว่าจะลบสินค้าชิ้นนี้?")) {
      deleteProduct(id);
      refreshData();
    }
  }

  function clearForm() {
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setNewImage("");
    setNewDescription("");
    const defaultCat = categories.find(cat => cat !== "All");
    setNewCategory(defaultCat || "General");
    setNewMinAge(8);
    setNewMinPlayers(2);
    setNewMaxPlayers(4);

    // รีเซ็ตค่าในช่อง Input File บนหน้าเว็บด้วย
    const fileInput = document.getElementById("localImageUpload");
    if (fileInput) fileInput.value = "";
  }

  function getCustomerName(userId) {
    const user = users.find((item) => item.id === userId);
    return user ? user.name : "Guest";
  }

  function handleOrderStatusChange(orderId, status) {
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
              </>
            )}

            {/* ================= 2. หน้า PRODUCTS ================= */}
            {currentTab === "products" && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">Products Management</h1>
                  <p className="lead text-muted mb-0">จัดการข้อมูลสต็อก รูปภาพ รายละเอียด และเงื่อนไขตัวกรองบอร์ดเกม</p>
                </div>

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title text-muted text-uppercase mb-3" style={{ fontSize: "0.85rem" }}>
                      {editingId ? "✏️ Mode: แก้ไขข้อมูลสินค้า" : "＋ Mode: เพิ่มสินค้าใหม่"}
                    </h5>
                    <form onSubmit={handleSaveProduct} className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-bold">ชื่อสินค้า</label>
                        <input type="text" className="form-control" placeholder="เช่น Catan, Dixit" value={newName} onChange={(e) => setNewName(e.target.value)} />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-bold">ประเภทสินค้า</label>
                        <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                          {categories
                            .filter((cat) => cat !== "All") // กรองเอาคำว่า "All" ออกไป
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* 🖼️ เลือกอัปโหลดรูปภาพได้ 2 แบบ: เลือกไฟล์จากเครื่อง หรือ กรอก URL */}
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-bold">อัปโหลดรูปภาพจากเครื่อง</label>
                        <input 
                          type="file" 
                          id="localImageUpload"
                          className="form-control" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                        />
                        <div className="form-text" style={{ fontSize: "0.75rem" }}>แปลงรูปเป็น Base64 บันทึกลงเครื่องโดยตรง</div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-bold">หรือ ลิงก์ URL รูปภาพสินค้า</label>
                        <input type="text" className="form-control" placeholder="https://..." value={newImage} onChange={(e) => setNewImage(e.target.value)} />
                      </div>

                      {/* ส่วนแสดงภาพ Preview เล็ก ๆ */}
                      {newImage && (
                        <div className="col-12">
                          <p className="small mb-1 text-muted">ตัวอย่างแสดงผลรูปภาพ:</p>
                          <img src={newImage} alt="Preview" className="img-thumbnail" style={{ maxHeight: "80px", objectFit: "contain" }} />
                        </div>
                      )}

                      <div className="col-md-4">
                        <label className="form-label small text-muted fw-bold">ราคาขาย (บาท)</label>
                        <input type="number" className="form-control" placeholder="ราคาสินค้า" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-muted fw-bold">จำนวนในสต็อก (ชิ้น)</label>
                        <input type="number" className="form-control" placeholder="จำนวนสินค้าในคลัง" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
                      </div>

                      {/* 👶 ฟิลด์ตัวกรอง: อายุขั้นต่ำ */}
                      <div className="col-md-4">
                        <label className="form-label small text-muted fw-bold">อายุแนะนำบนกล่อง (ปี+)</label>
                        <input type="number" className="form-control" placeholder="เช่น 8" value={newMinAge} onChange={(e) => setNewMinAge(e.target.value)} min="0" />
                      </div>

                      {/* 👥 ฟิลด์ตัวกรอง: ช่วงจำนวนผู้เล่น */}
                      <div className="col-md-4">
                        <label className="form-label small text-muted fw-bold">ผู้เล่นขั้นต่ำ (คน)</label>
                        <input type="number" className="form-control" placeholder="เช่น 2" value={newMinPlayers} onChange={(e) => setNewMinPlayers(e.target.value)} min="1" />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-muted fw-bold">ผู้เล่นสูงสุด (คน)</label>
                        <input type="number" className="form-control" placeholder="เช่น 4" value={newMaxPlayers} onChange={(e) => setNewMaxPlayers(e.target.value)} min="1" />
                      </div>

                      <div className="col-md-4">
                        {/* ปล่อยว่างเพื่อรักษาระยะ Grid 3 คอลัมน์ให้สมดุล */}
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-muted fw-bold">รายละเอียด / คำอธิบายสินค้า</label>
                        <textarea className="form-control" rows="3" placeholder="เขียนอธิบายสรรพคุณสินค้า..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)}></textarea>
                      </div>

                      <div className="col-12 d-flex gap-2 justify-content-end pt-2">
                        {editingId && (
                          <button type="button" className="btn btn-light border" onClick={clearForm}>
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
                            <th className="py-3">ประเภท</th>
                            <th className="py-3">ช่วงผู้เล่น / อายุ</th> {/* 💡 คอลัมน์สรุปข้อมูลตัวกรอง */}
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
                              <td>
                                <span className="badge rounded-pill bg-light border text-dark">
                                  {product.category || "General"}
                                </span>
                              </td>
                              {/* 💡 แสดงข้อมูลตัวกรองของเกมบนตารางสินค้า */}
                              <td>
                                <div style={{ fontSize: "0.85rem" }}>
                                  <div className="text-muted">👥 {product.minPlayers || 2} - {product.maxPlayers || 4} คน</div>
                                  <div className="text-muted">👶 {product.minAge || 8} ปีขึ้นไป</div>
                                </div>
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
                              <td className="text-muted text-truncate d-block" style={{ maxWidth: "220px" }}>
                                {order.items}
                              </td>
                              <td className="text-brand fw-semibold">{money(order.total)}</td>
                              <td>
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
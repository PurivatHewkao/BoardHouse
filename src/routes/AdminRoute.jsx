import React, { useState } from "react";
import { getOrders, updateOrderStatus, updateOrderDetails, cancelOrder } from "../utils/orderStorage.js";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../utils/productStorage.js";
import {
  createAdmin,
  deleteAdmin,
  demoteToCustomer,
  getUsers,
  promoteToAdmin,
} from "../utils/userStorage.js";
import { canManageAdmins, isCustomer, isSuperAdmin, ROLES } from "../utils/roles.js";
import { money, summarizeOrderItems } from "../utils/format.js";
import { resetStorage } from "../utils/localStorageDb.js";
import { categories } from "../data/products.js";
import { orderStatuses } from "../data/seedData.js";
import OrderDetailModal from "../components/OrderDetailModal.jsx";

function AdminRoute({ currentUser }) {
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
  const [newImage, setNewImage] = useState(""); 
  const [newDescription, setNewDescription] = useState("");
  
  // State สำหรับตัวกรองอายุและจำนวนผู้เล่น
  const [newMinAge, setNewMinAge] = useState(8);
  const [newMinPlayers, setNewMinPlayers] = useState(2);
  const [newMaxPlayers, setNewMaxPlayers] = useState(4);

  // State สำหรับเลือกประเภทสินค้า
  const [newCategory, setNewCategory] = useState(() => {
    const defaultCat = categories.find(cat => cat !== "All");
    return defaultCat || "General";
  });
  const [editingId, setEditingId] = useState(null);

  // State สำหรับค้นหาและกรองหมวดหมู่ในตารางสินค้า
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // State สำหรับหน้า Orders
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [cancelError, setCancelError] = useState("");

  // ช่องค้นหาในหน้ารายชื่อลูกค้า
  const [customerSearch, setCustomerSearch] = useState("");

  // State หน้า Admins
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [promoteId, setPromoteId] = useState("");
  const [adminError, setAdminError] = useState("");

  const { products, orders, users } = dashboardData;
  const customers = users.filter(isCustomer);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  const canManage = canManageAdmins(currentUser);
  const admins = users.filter((user) => user.role === ROLES.ADMIN || isSuperAdmin(user));

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

  const activeCustomerCount = customersWithStats.filter((c) => c.orderCount > 0).length;

  const filteredCustomers = customersWithStats.filter((customer) => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      customer.name.toLowerCase().includes(keyword) ||
      customer.email.toLowerCase().includes(keyword) ||
      (customer.phone || "").toLowerCase().includes(keyword)
    );
  });

  const recentOrders = [...orders]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
    .map((order) => ({
      ...order,
      customerName: users.find((user) => user.id === order.userId)?.name || "ผู้เยี่ยมชม",
    }));

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
    window.location.reload();
  }

  function applyAdminResult(result) {
    if (!result.ok) {
      setAdminError(result.message);
      return false;
    }
    setAdminError("");
    refreshData();
    setMessage(result.message);
    return true;
  }

  function handleCreateAdmin(e) {
    e.preventDefault();
    const result = createAdmin({
      actor: currentUser,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phone: adminPhone,
    });
    if (applyAdminResult(result)) {
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setAdminPhone("");
    }
  }

  function handlePromote(e) {
    e.preventDefault();
    if (!promoteId) {
      setAdminError("กรุณาเลือกลูกค้าที่ต้องการเลื่อนขั้น");
      return;
    }
    if (applyAdminResult(promoteToAdmin(currentUser, Number(promoteId)))) {
      setPromoteId("");
    }
  }

  function handleDemote(user) {
    if (!confirm(`ลดขั้น "${user.name}" กลับเป็นลูกค้าใช่ไหม?`)) return;
    applyAdminResult(demoteToCustomer(currentUser, user.id));
  }

  function handleDeleteAdmin(user) {
    if (!confirm(`ลบบัญชี admin "${user.name}" ถาวรใช่ไหม?`)) return;
    applyAdminResult(deleteAdmin(currentUser, user.id));
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("ไฟล์ภาพมีขนาดใหญ่เกินไปค่ะ (ไม่ควรเกิน 1.5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
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
    if (Number(newPrice) < 0 || Number(newStock) < 0) {
      alert("ราคาและจำนวนสินค้าในสต็อกต้องไม่ติดลบนะคะ!");
      return;
    }

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
    alert("บันทึกข้อมูลสินค้าและเงื่อนไขเรียบร้อยแล้วค่ะ!");
  }

  function handleEditClick(product) {
    setEditingId(product.id);
    setNewName(product.name);
    setNewPrice(product.price);
    setNewStock(product.stock);
    setNewImage(product.image || "");
    setNewDescription(product.description || "");
    setNewCategory(product.category || categories.find(cat => cat !== "All") || "General");
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

  function openCancelModal(orderId) {
    setCancelTargetId(orderId);
    setCancelReasonInput("");
    setCancelError("");
  }

  function closeCancelModal() {
    setCancelTargetId(null);
    setCancelReasonInput("");
    setCancelError("");
  }

  function handleConfirmCancel() {
    const trimmedReason = cancelReasonInput.trim();
    if (!trimmedReason) {
      setCancelError("กรุณาระบุเหตุผลก่อนยกเลิกออเดอร์ค่ะ");
      return;
    }
    cancelOrder(cancelTargetId, trimmedReason, currentUser);
    refreshData();
    setSelectedOrder((current) =>
      current && current.id === cancelTargetId
        ? {
            ...current,
            status: "Cancelled",
            tone: "danger",
            cancelReason: trimmedReason,
            cancelledBy: currentUser?.name || currentUser?.email || "ไม่ทราบผู้ดำเนินการ",
          }
        : current
    );
    closeCancelModal();
  }

  function handleOrderDetailsSave(orderId, updates) {
    updateOrderDetails(orderId, updates);
    refreshData();
    setSelectedOrder((current) => (current && current.id === orderId ? { ...current, ...updates } : current));
  }

  // ตัวกรองสินค้า Real-time สำหรับหน้าตาราง
  const filteredProducts = products.filter((product) => {
    const normalizedSearch = productSearch.trim().toLocaleLowerCase("th-TH");
    const searchableText = `${product.name || ""} ${product.category || ""}`.toLocaleLowerCase("th-TH");
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesCategory = selectedCategoryFilter === "All" || product.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((order) => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return true;
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
              {canManage && (
                <button className={`list-group-item list-group-item-action ${currentTab === "admins" ? "active" : ""}`} type="button" onClick={() => setCurrentTab("admins")}>
                  Admins
                </button>
              )}
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
                            {topCustomers.map((customer) => (
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

            {/* ================= 2. หน้า PRODUCTS ================= */}
            {currentTab === "products" && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">Products Management</h1>
                  <p className="lead text-muted mb-0">เพิ่ม แก้ไข หรือลบสินค้าบอร์ดเกมออกจากระบบหน้าร้าน</p>
                </div>

                {/* Form เพิ่ม / แก้ไข สินค้า */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-3">
                      {editingId ? "📝 แก้ไขข้อมูลบอร์ดเกม" : "✨ เพิ่มบอร์ดเกมใหม่เข้าระบบ"}
                    </h5>
                    <form onSubmit={handleSaveProduct} className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">ชื่อบอร์ดเกม *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="เช่น Catan, Dixit, Azul"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">ราคาสินค้า (บาท) *</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          min="0"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">จำนวนในคลัง (กล่อง) *</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          min="0"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">หมวดหมู่สินค้า</label>
                        <select
                          className="form-select"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                        >
                          {categories
                            .filter((cat) => cat !== "All")
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">อัปโหลดรูปภาพสินค้า</label>
                        <input
                          id="localImageUpload"
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={handleImageUpload}
                        />
                        <small className="text-muted d-block mt-1">แนะนำให้ใช้รูปภาพไม่เกิน 1.5MB ค่ะ</small>
                      </div>

                      {/* ตัวกรองเพิ่มเติมของบอร์ดเกม */}
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">👶 อายุขั้นต่ำ (ปี)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="เช่น 8"
                          min="0"
                          value={newMinAge}
                          onChange={(e) => setNewMinAge(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">👥 จำนวนผู้เล่นต่ำสุด</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="เช่น 2"
                          min="1"
                          value={newMinPlayers}
                          onChange={(e) => setNewMinPlayers(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">🔊 จำนวนผู้เล่นสูงสุด</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="เช่น 4"
                          min="1"
                          value={newMaxPlayers}
                          onChange={(e) => setNewMaxPlayers(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">คำอธิบายสินค้า</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="รายละเอียดกติกา อุปกรณ์ภายในกล่อง หรือจุดเด่นของเกม..."
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                      <div className="col-12 d-flex gap-2 justify-content-end">
                        <button type="button" className="btn btn-light border" onClick={clearForm}>
                          ล้างฟอร์ม
                        </button>
                        <button type="submit" className="btn btn-boardhouse px-4">
                          {editingId ? "อัปเดตข้อมูล" : "บันทึกสินค้า"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* กล่องค้นหาและฟิลเตอร์หมวดหมู่สินค้าในตาราง */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body p-3">
                    <div className="row g-2">
                      <div className="col-md-8">
                        <input
                          type="search"
                          className="form-control"
                          placeholder="🔎 ค้นหาชื่อบอร์ดเกมหรือหมวดหมู่..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        >
                          <option value="All">📂 แสดงทุกหมวดหมู่</option>
                          {categories
                            .filter((cat) => cat !== "All")
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ตารางแสดงรายชื่อสินค้า */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3" style={{ width: "90px" }}>รูปภาพ</th>
                            <th className="py-3">ชื่อสินค้า</th>
                            <th className="py-3">หมวดหมู่</th>
                            <th className="py-3">เงื่อนไขเกม</th>
                            <th className="py-3 text-end">ราคา</th>
                            <th className="py-3 text-center">คงเหลือ</th>
                            <th className="px-4 py-3 text-end">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-muted py-5">
                                ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหาค่ะ
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <tr key={product.id}>
                                <td className="px-4">
                                  <div 
                                    className="d-flex align-items-center justify-content-center overflow-hidden border rounded bg-light"
                                    style={{ width: "60px", height: "60px" }}
                                  >
                                    <img
                                      src={product.image || "https://placehold.co/300x200?text=No+Image"}
                                      alt={product.name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <span className="fw-semibold text-dark d-block">{product.name}</span>
                                  <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>
                                    {product.description || "ไม่มีคำอธิบาย"}
                                  </small>
                                </td>
                                <td>
                                  <span className="badge bg-secondary-subtle text-secondary">{product.category || "General"}</span>
                                </td>
                                <td>
                                  <small className="d-block text-muted">👶 {product.minAge || 8}+ ปีขึ้นไป</small>
                                  <small className="d-block text-muted">👥 {product.minPlayers || 2} - {product.maxPlayers || 4} คน</small>
                                </td>
                                <td className="text-end fw-semibold">{money(product.price)}</td>
                                <td className="text-center">
                                  <span className={`fw-bold ${product.stock === 0 ? "text-danger" : "text-dark"}`}>{product.stock}</span>
                                </td>
                                <td className="px-4 text-end">
                                  <div className="d-flex gap-2 justify-content-end">
                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(product)}>แก้ไข</button>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(product.id)}>ลบ</button>
                                  </div>
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

            {/* ================= 3. หน้า CUSTOMERS ================= */}
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
                              <td colSpan="6" className="text-center text-muted py-5">ไม่พบลูกค้าที่ตรงกับคำค้นหา</td>
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

            {/* ================= 4. หน้า ORDERS ================= */}
            {currentTab === "orders" && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">Orders Management</h1>
                  <p className="lead text-muted mb-0">ดูและอัปเดตสถานะใบสั่งซื้อของลูกค้า</p>
                </div>
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body p-3">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="🔎 ค้นหารหัสคำสั่งซื้อ ชื่อลูกค้า หรือสถานะ..."
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
                            <th className="px-4 py-3">รหัสออเดอร์</th>
                            <th className="py-3">ลูกค้า</th>
                            <th className="py-3">วันที่</th>
                            <th className="py-3">รายการสินค้า</th>
                            <th className="py-3 text-end">ยอดรวม</th>
                            <th className="py-3 text-center">สถานะ</th>
                            <th className="px-4 py-3 text-end">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-muted py-5">ไม่พบรายการสั่งซื้อ</td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="px-4 text-muted fw-mono">{order.id}</td>
                                <td className="fw-semibold">{getCustomerName(order.userId)}</td>
                                <td>{order.date}</td>
                                <td className="text-truncate" style={{ maxWidth: "200px" }}>{summarizeOrderItems(order.items)}</td>
                                <td className="text-end fw-bold">{money(order.total)}</td>
                                <td className="text-center">
                                  <span className={`badge status-${order.status.toLowerCase()}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 text-end">
                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedOrder(order)}>
                                    ดูรายละเอียด
                                  </button>
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

            {/* ================= 5. หน้า ADMINS (เฉพาะ Super Admin) ================= */}
            {currentTab === "admins" && canManage && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">Admins</h1>
                  <p className="lead text-muted mb-0">จัดการทีมผู้ดูแลระบบ — เฉพาะ Super Admin เท่านั้นที่เข้าหน้านี้ได้</p>
                </div>
                {adminError && <div className="alert alert-danger border-0 shadow-sm">{adminError}</div>}
                {message && <div className="alert alert-success border-0 shadow-sm">{message}</div>}

                <div className="row g-3 mb-4">
                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <h2 className="h6 mb-3">เพิ่ม Admin ใหม่</h2>
                        <form className="row g-2" onSubmit={handleCreateAdmin}>
                          <div className="col-md-6">
                            <input className="form-control" placeholder="ชื่อ-นามสกุล" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                          </div>
                          <div className="col-md-6">
                            <input className="form-control" type="email" placeholder="อีเมล" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                          </div>
                          <div className="col-md-6">
                            <input className="form-control" type="password" placeholder="รหัสผ่าน" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
                          </div>
                          <div className="col-md-6">
                            <input className="form-control" placeholder="เบอร์โทร (ไม่บังคับ)" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
                          </div>
                          <div className="col-12">
                            <button className="btn btn-boardhouse w-100" type="submit">เพิ่ม Admin</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <h2 className="h6 mb-3">เลื่อนขั้นลูกค้าเป็น Admin</h2>
                        <form className="vstack gap-2" onSubmit={handlePromote}>
                          <select className="form-select" value={promoteId} onChange={(e) => setPromoteId(e.target.value)}>
                            <option value="">— เลือกลูกค้า —</option>
                            {customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>{customer.name} ({customer.email})</option>
                            ))}
                          </select>
                          <button className="btn btn-boardhouse" type="submit">เลื่อนขั้นเป็น Admin</button>
                          {customers.length === 0 && <small className="text-muted">ยังไม่มีลูกค้าให้เลื่อนขั้น</small>}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">ผู้ดูแล</th>
                            <th className="py-3">ติดต่อ</th>
                            <th className="py-3 text-center">สิทธิ์</th>
                            <th className="px-4 py-3 text-end">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map((admin) => {
                            const locked = isSuperAdmin(admin) || admin.id === currentUser?.id;
                            return (
                              <tr key={admin.id}>
                                <td className="px-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <span className="customer-avatar">{initials(admin.name)}</span>
                                    <div>
                                      <span className="fw-semibold text-dark d-block">{admin.name}</span>
                                      <small className="text-muted">#{admin.id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="d-block text-dark">{admin.email}</span>
                                  <small className="text-muted">{admin.phone || "—"}</small>
                                </td>
                                <td className="text-center">
                                  <span className={`role-badge ${admin.role}`}>
                                    {isSuperAdmin(admin) ? "Super Admin" : "Admin"}
                                  </span>
                                </td>
                                <td className="px-4 text-end">
                                  {locked ? (
                                    <small className="text-muted">
                                      {admin.id === currentUser?.id ? "บัญชีของคุณ" : "แก้ไขไม่ได้"}
                                    </small>
                                  ) : (
                                    <div className="d-flex gap-2 justify-content-end">
                                      <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => handleDemote(admin)}>ลดขั้น</button>
                                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAdmin(admin)}>ลบ</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
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

      {/* Modal ดูรายละเอียดคำสั่งซื้อ */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleOrderStatusChange}
          onCancelClick={openCancelModal}
          onSaveDetails={handleOrderDetailsSave}
          editableStatuses={editableStatuses}
        />
      )}

      {/* Modal ป๊อปอัปกรอกเหตุผลการยกเลิกออเดอร์ */}
      {cancelTargetId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">🚫 ระบุเหตุผลการยกเลิกออเดอร์</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeCancelModal}></button>
              </div>
              <div className="modal-body">
                {cancelError && <div className="alert alert-danger py-2 small">{cancelError}</div>}
                <p className="text-muted small mb-2">กรุณากรอกเหตุผลที่ต้องยกเลิกคำสั่งซื้อนี้ ระบบจะบันทึกข้อมูลและส่งแจ้งไปยังฝั่งลูกค้าค่ะ</p>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="เช่น สินค้าหมดคลังชั่วคราว, ลูกค้าแจ้งขอยกเลิกผ่านแชท..."
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light border" onClick={closeCancelModal}>ปิดหน้าต่าง</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmCancel}>ยืนยันการยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminRoute;

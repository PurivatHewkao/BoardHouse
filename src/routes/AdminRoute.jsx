import React, { useState } from "react";
import { getOrders, sortOrdersByNewest, updateOrderStatus, updateOrderDetails } from "../utils/orderStorage.js";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../utils/productStorage.js";
import {
  changePassword,
  createAdmin,
  deleteAdmin,
  getUsers,
  updateAdmin,
  updateProfile,
} from "../utils/userStorage.js";
import { canManageAdmins, isCustomer, isSuperAdmin, ROLES } from "../utils/roles.js";
import { money, summarizeOrderItems } from "../utils/format.js";
import { resetStorage } from "../utils/localStorageDb.js";
import { categories } from "../data/products.js";
import OrderDetailModal from "../components/OrderDetailModal.jsx";

function AdminRoute({ currentUser, setCurrentUser }) {
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
  const [selectedStockFilter, setSelectedStockFilter] = useState("All");

  // State สำหรับหน้า Orders
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  // ช่องค้นหาในหน้ารายชื่อลูกค้า
  const [customerSearch, setCustomerSearch] = useState("");

  // State หน้า Admins
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminError, setAdminError] = useState("");

  // State สำหรับแก้ไขข้อมูล admin คนอื่น (เฉพาะ Super Admin)
  const [editingAdmin, setEditingAdmin] = useState(null);

  // State หน้า "บัญชีของฉัน" — แอดมินแก้ข้อมูล/เปลี่ยนรหัสผ่านของตัวเองได้
  const [myName, setMyName] = useState(currentUser?.name || "");
  const [myEmail, setMyEmail] = useState(currentUser?.email || "");
  const [myPhone, setMyPhone] = useState(currentUser?.phone || "");
  const [myProfileMessage, setMyProfileMessage] = useState(null);
  const [myCurrentPassword, setMyCurrentPassword] = useState("");
  const [myNewPassword, setMyNewPassword] = useState("");
  const [myConfirmPassword, setMyConfirmPassword] = useState("");
  const [myPasswordMessage, setMyPasswordMessage] = useState(null);

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

  // เรียงจากวันที่/เวลาสั่งซื้อล่าสุด (ใช้ createdAt เป็นหลัก) แล้วเอา 5 อันดับแรก
  const recentOrders = sortOrdersByNewest(orders)
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
    { label: "สินค้าทั้งหมด", value: products.length, icon: "box" },
    { label: "ออเดอร์ทั้งหมด", value: orders.length, icon: "bag" },
    { label: "ลูกค้าทั้งหมด", value: customers.length, icon: "users" },
    { label: "ยอดขายรวม", value: money(revenue), icon: "cash" },
  ];

  const totalProductStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
  const outOfStockCount = products.filter((product) => product.stock === 0).length;

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

  async function handleResetData() {
    await resetStorage();
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

  function handleStartEditAdmin(user) {
    setAdminError("");
    setEditingAdmin({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
    });
  }

  function handleEditAdminField(field, value) {
    setEditingAdmin((current) => (current ? { ...current, [field]: value } : current));
  }

  function handleSaveEditAdmin(e) {
    e.preventDefault();
    if (!editingAdmin) return;
    const result = updateAdmin(currentUser, editingAdmin.id, {
      name: editingAdmin.name,
      email: editingAdmin.email,
      phone: editingAdmin.phone,
      password: editingAdmin.password,
    });
    if (applyAdminResult(result)) {
      setEditingAdmin(null);
    }
  }

  function handleDeleteAdmin(user) {
    if (!confirm(`ลบบัญชี admin "${user.name}" ถาวรใช่ไหม?`)) return;
    applyAdminResult(deleteAdmin(currentUser, user.id));
  }

  // ----- บัญชีของฉัน (แอดมินแก้ข้อมูล/รหัสผ่านตัวเอง) -----
  function handleSaveMyProfile(e) {
    e.preventDefault();
    const result = updateProfile(currentUser, { name: myName, email: myEmail, phone: myPhone });
    setMyProfileMessage({ ok: result.ok, text: result.message });
    if (result.ok) {
      setCurrentUser?.(result.user);
      refreshData();
    }
  }

  function handleChangeMyPassword(e) {
    e.preventDefault();
    if (myNewPassword !== myConfirmPassword) {
      setMyPasswordMessage({ ok: false, text: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน" });
      return;
    }
    const result = changePassword(currentUser, {
      currentPassword: myCurrentPassword,
      nextPassword: myNewPassword,
    });
    setMyPasswordMessage({ ok: result.ok, text: result.message });
    if (result.ok) {
      setCurrentUser?.(result.user);
      setMyCurrentPassword("");
      setMyNewPassword("");
      setMyConfirmPassword("");
    }
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
    if (Number(newMinPlayers) < 1 || Number(newMaxPlayers) < Number(newMinPlayers)) {
      alert("จำนวนผู้เล่นสูงสุดต้องไม่น้อยกว่าจำนวนผู้เล่นขั้นต่ำค่ะ");
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
    requestAnimationFrame(() => document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth" }));
  }

  function handleDeleteClick(id) {
    if (confirm("หนูแน่ใจใช่ไหมคะว่าจะลบสินค้าชิ้นนี้?")) {
      deleteProduct(id);
      refreshData();
    }
  }

  function clearForm() {
    setEditingId(null);
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
    const matchesStock =
      selectedStockFilter === "All" ||
      (selectedStockFilter === "available" && product.stock > 0) ||
      (selectedStockFilter === "low" && product.stock > 0 && product.stock <= 5) ||
      (selectedStockFilter === "out" && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
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

  // แบ่งหน้ารายการออเดอร์ หน้าละ 10 รายการ กันหน้ายาวเกินตอนออเดอร์เยอะ
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safeOrderPage = Math.min(orderPage, totalOrderPages);
  const paginatedOrders = filteredOrders.slice(
    (safeOrderPage - 1) * ORDERS_PER_PAGE,
    safeOrderPage * ORDERS_PER_PAGE
  );

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
              <button className={`list-group-item list-group-item-action ${currentTab === "account" ? "active" : ""}`} type="button" onClick={() => setCurrentTab("account")}>
                My Account
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
                    <p className="lead text-muted mb-0">ภาพรวมของร้าน BoardHouse</p>
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
                <div className="admin-product-heading">
                  <div>
                    <span className="admin-section-kicker">Product Management</span>
                    <h1 className="page-title mb-2">Products Management</h1>
                    <p className="text-muted mb-0">ดูแลข้อมูล ราคา และสต็อกสินค้าที่แสดงบนหน้าร้าน</p>
                  </div>
                  <button
                    className="btn btn-boardhouse admin-add-product"
                    type="button"
                    onClick={() => {
                      clearForm();
                      requestAnimationFrame(() => document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth" }));
                    }}
                  >
                    <span aria-hidden="true">＋</span> เพิ่มสินค้าใหม่
                  </button>
                </div>

                <div className="row row-cols-2 row-cols-xl-4 g-3 admin-product-stats">
                  <div className="col">
                    <div className="admin-product-stat">
                      <span className="admin-product-stat-icon">▦</span>
                      <div><strong>{products.length}</strong><span>สินค้าทั้งหมด</span></div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="admin-product-stat">
                      <span className="admin-product-stat-icon">□</span>
                      <div><strong>{totalProductStock}</strong><span>สินค้าในคลัง</span></div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="admin-product-stat is-warning">
                      <span className="admin-product-stat-icon">!</span>
                      <div><strong>{lowStockCount}</strong><span>ใกล้หมด</span></div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="admin-product-stat is-danger">
                      <span className="admin-product-stat-icon">×</span>
                      <div><strong>{outOfStockCount}</strong><span>หมดสต็อก</span></div>
                    </div>
                  </div>
                </div>

                <form id="product-editor" onSubmit={handleSaveProduct} className="admin-product-editor">
                  <div className="admin-editor-header">
                    <div>
                      <span className="admin-editor-step">Product Info</span>
                      <h2>{editingId ? `Edit Product #${editingId}` : "Add New Product"}</h2>
                    </div>
                    {editingId && <span className="admin-editing-badge">กำลังแก้ไข</span>}
                  </div>

                  <div className="row g-4">
                    <div className="col-lg-4">
                      <div className="admin-image-panel">
                        <div className="admin-image-preview">
                          {newImage ? (
                            <img src={newImage} alt="ตัวอย่างรูปสินค้า" />
                          ) : (
                            <div className="admin-image-empty">
                              <span aria-hidden="true">▧</span>
                              <strong>ตัวอย่างรูปสินค้า</strong>
                              <small>JPG, PNG หรือ WEBP</small>
                            </div>
                          )}
                        </div>
                        <label className="admin-upload-button" htmlFor="localImageUpload">
                          เลือกรูปภาพ
                        </label>
                        <input
                          id="localImageUpload"
                          type="file"
                          accept="image/*"
                          className="visually-hidden"
                          onChange={handleImageUpload}
                        />
                        <small>ขนาดไฟล์ไม่เกิน 1.5MB</small>
                      </div>
                    </div>

                    <div className="col-lg-8">
                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label">ชื่อบอร์ดเกม <span>*</span></label>
                          <input type="text" className="form-control" placeholder="เช่น Catan, Dixit, Azul" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">หมวดหมู่</label>
                          <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                            {categories.filter((cat) => cat !== "All").map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">ราคาขาย (บาท) <span>*</span></label>
                          <div className="admin-input-suffix">
                            <input type="number" className="form-control" placeholder="0" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
                            <span>฿</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">จำนวนในคลัง <span>*</span></label>
                          <div className="admin-input-suffix">
                            <input type="number" className="form-control" placeholder="0" min="0" value={newStock} onChange={(e) => setNewStock(e.target.value)} required />
                            <span>กล่อง</span>
                          </div>
                        </div>
                        <div className="col-12"><div className="admin-form-divider"><span>ข้อมูลการเล่น</span></div></div>
                        <div className="col-md-4">
                          <label className="form-label">อายุขั้นต่ำ</label>
                          <input type="number" className="form-control" min="0" value={newMinAge} onChange={(e) => setNewMinAge(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">ผู้เล่นต่ำสุด</label>
                          <input type="number" className="form-control" min="1" value={newMinPlayers} onChange={(e) => setNewMinPlayers(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">ผู้เล่นสูงสุด</label>
                          <input type="number" className="form-control" min="1" value={newMaxPlayers} onChange={(e) => setNewMaxPlayers(e.target.value)} />
                        </div>
                        <div className="col-12">
                          <label className="form-label">คำอธิบายสินค้า</label>
                          <textarea className="form-control" rows="3" placeholder="รายละเอียดกติกา อุปกรณ์ภายในกล่อง หรือจุดเด่นของเกม..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-editor-actions">
                    <button type="button" className="btn admin-cancel-button" onClick={clearForm}>{editingId ? "ยกเลิกการแก้ไข" : "ล้างข้อมูล"}</button>
                    <button type="submit" className="btn btn-boardhouse px-4">{editingId ? "บันทึกการแก้ไข" : "เพิ่มสินค้าเข้าร้าน"}</button>
                  </div>
                </form>

                <div className="admin-product-list">
                  <div className="admin-product-list-header">
                    <div>
                      <span className="admin-section-kicker">Inventory</span>
                      <h2>Product List</h2>
                      <p>แสดง {filteredProducts.length} จาก {products.length} รายการ</p>
                    </div>
                    <div className="admin-product-filters">
                      <label className="admin-product-search">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" placeholder="ค้นหาชื่อหรือหมวดหมู่..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                      </label>
                      <select aria-label="กรองตามหมวดหมู่" value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)}>
                        <option value="All">ทุกหมวดหมู่</option>
                        {categories.filter((cat) => cat !== "All").map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select aria-label="กรองตามสต็อก" value={selectedStockFilter} onChange={(e) => setSelectedStockFilter(e.target.value)}>
                        <option value="All">ทุกสถานะสต็อก</option>
                        <option value="available">มีสินค้า</option>
                        <option value="low">ใกล้หมด (ไม่เกิน 5)</option>
                        <option value="out">หมดสต็อก</option>
                      </select>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle mb-0 admin-product-table">
                      <thead>
                        <tr>
                          <th className="ps-4">สินค้า</th>
                          <th>หมวดหมู่</th>
                          <th>ข้อมูลการเล่น</th>
                          <th className="text-end">ราคา</th>
                          <th className="text-center">สต็อก</th>
                          <th className="pe-4 text-end">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan="6">
                              <div className="admin-products-empty"><span>⌕</span><strong>ไม่พบสินค้าที่ค้นหา</strong><small>ลองเปลี่ยนคำค้นหาหรือตัวกรองอีกครั้ง</small></div>
                            </td>
                          </tr>
                        ) : filteredProducts.map((product) => {
                          const stockTone = product.stock === 0 ? "out" : product.stock <= 5 ? "low" : "ready";
                          return (
                            <tr key={product.id}>
                              <td className="ps-4">
                                <div className="admin-product-name-cell">
                                  <img src={product.image || "https://placehold.co/300x200?text=No+Image"} alt={product.name} />
                                  <div><strong>{product.name}</strong><small>รหัสสินค้า #{product.id}</small></div>
                                </div>
                              </td>
                              <td><span className="admin-category-badge">{product.category || "General"}</span></td>
                              <td><div className="admin-game-info"><span>อายุ {product.minAge || 8}+</span><span>{product.minPlayers || 2}-{product.maxPlayers || 4} คน</span></div></td>
                              <td className="text-end admin-product-price">{money(product.price)}</td>
                              <td className="text-center"><span className={`admin-stock-badge ${stockTone}`}>{product.stock === 0 ? "หมด" : `${product.stock} กล่อง`}</span></td>
                              <td className="pe-4 text-end">
                                <div className="admin-product-actions">
                                  <button type="button" className="admin-edit-button" onClick={() => handleEditClick(product)}>แก้ไข</button>
                                  <button type="button" className="admin-delete-button" onClick={() => handleDeleteClick(product.id)}>ลบ</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                        <p className="mb-1 text-muted small">ลูกค้าที่เคยซื้อสินค้า</p>
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
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrderPage(1);
                      }}
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
                            paginatedOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="px-4 text-muted fw-mono">{order.id}</td>
                                <td className="fw-semibold">{getCustomerName(order.userId)}</td>
                                <td>{order.date}</td>
                                <td className="text-truncate" style={{ maxWidth: "200px" }}>{summarizeOrderItems(order.items)}</td>
                                <td className="text-end fw-bold">{money(order.total)}</td>
                                <td className="text-center">
                                  <span className={`badge rounded-pill status ${order.tone}`}>
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
                    {filteredOrders.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                        <span className="text-muted small">
                          หน้า {safeOrderPage} จาก {totalOrderPages} (ทั้งหมด {filteredOrders.length} รายการ)
                        </span>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={safeOrderPage <= 1}
                            onClick={() => setOrderPage((page) => Math.max(1, page - 1))}
                          >
                            ก่อนหน้า
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={safeOrderPage >= totalOrderPages}
                            onClick={() => setOrderPage((page) => Math.min(totalOrderPages, page + 1))}
                          >
                            ถัดไป
                          </button>
                        </div>
                      </div>
                    )}
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

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-3">
                    <h2 className="h6 mb-1">Add New Admin</h2>
                    <p className="text-muted small mb-3">
                      สร้างบัญชีแอดมินขึ้นมาใหม่โดยตรง (แยกจากบัญชีลูกค้า) เพื่อไม่ให้ข้อมูลการซื้อของปนกัน
                    </p>
                    <form className="row g-2" onSubmit={handleCreateAdmin}>
                      <div className="col-md-6">
                        <input className="form-control" placeholder="ชื่อ-นามสกุล" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <input className="form-control" type="email" placeholder="อีเมล" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <input className="form-control" type="password" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <input className="form-control" placeholder="เบอร์โทร (ไม่บังคับ)" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
                      </div>
                      <div className="col-12 col-md-4 ms-md-auto">
                        <button className="btn btn-boardhouse w-100" type="submit">เพิ่ม Admin</button>
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
                                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleStartEditAdmin(admin)}>แก้ไข</button>
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

            {/* ================= 6. หน้า บัญชีของฉัน (แอดมินทุกคน) ================= */}
            {currentTab === "account" && (
              <>
                <div className="mb-4">
                  <h1 className="page-title mb-2">My Account</h1>
                  <p className="lead text-muted mb-0">แก้ไขข้อมูลส่วนตัวและเปลี่ยนรหัสผ่านของบัญชีคุณเอง</p>
                </div>

                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h2 className="h6 mb-3">Personal Info</h2>
                        <form className="vstack gap-3" onSubmit={handleSaveMyProfile}>
                          <div>
                            <label className="form-label fw-semibold">ชื่อ-นามสกุล</label>
                            <input className="form-control" value={myName} onChange={(e) => setMyName(e.target.value)} required />
                          </div>
                          <div>
                            <label className="form-label fw-semibold">อีเมล</label>
                            <input className="form-control" type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} required />
                          </div>
                          <div>
                            <label className="form-label fw-semibold">เบอร์โทร (ไม่บังคับ)</label>
                            <input className="form-control" inputMode="tel" value={myPhone} onChange={(e) => setMyPhone(e.target.value)} />
                          </div>
                          {myProfileMessage && (
                            <p className={`mb-0 ${myProfileMessage.ok ? "text-success" : "text-danger"}`}>{myProfileMessage.text}</p>
                          )}
                          <button type="submit" className="btn btn-boardhouse">บันทึกข้อมูล</button>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h2 className="h6 mb-3">Change Password</h2>
                        <form className="vstack gap-3" onSubmit={handleChangeMyPassword}>
                          <div>
                            <label className="form-label fw-semibold">รหัสผ่านปัจจุบัน</label>
                            <input className="form-control" type="password" value={myCurrentPassword} onChange={(e) => setMyCurrentPassword(e.target.value)} required />
                          </div>
                          <div>
                            <label className="form-label fw-semibold">รหัสผ่านใหม่</label>
                            <input className="form-control" type="password" value={myNewPassword} onChange={(e) => setMyNewPassword(e.target.value)} required />
                          </div>
                          <div>
                            <label className="form-label fw-semibold">ยืนยันรหัสผ่านใหม่</label>
                            <input className="form-control" type="password" value={myConfirmPassword} onChange={(e) => setMyConfirmPassword(e.target.value)} required />
                          </div>
                          {myPasswordMessage && (
                            <p className={`mb-0 ${myPasswordMessage.ok ? "text-success" : "text-danger"}`}>{myPasswordMessage.text}</p>
                          )}
                          <button type="submit" className="btn btn-boardhouse">เปลี่ยนรหัสผ่าน</button>
                        </form>
                      </div>
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
          key={selectedOrder.id}
          order={selectedOrder}
          customerName={getCustomerName(selectedOrder.userId)}
          editable
          onClose={() => setSelectedOrder(null)}
          onSaveAddress={(updates) => handleOrderDetailsSave(selectedOrder.id, updates)}
          onSaveTracking={(updates) => handleOrderDetailsSave(selectedOrder.id, updates)}
          onComplete={() => handleOrderStatusChange(selectedOrder.id, "Completed")}
          onRevertToInTransit={() => handleOrderStatusChange(selectedOrder.id, "In Transit")}
        />
      )}

      {/* Modal แก้ไขข้อมูล Admin (เฉพาะ Super Admin) */}
      {editingAdmin && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit Admin</h5>
                <button type="button" className="btn-close" onClick={() => setEditingAdmin(null)}></button>
              </div>
              <form onSubmit={handleSaveEditAdmin}>
                <div className="modal-body">
                  {adminError && <div className="alert alert-danger border-0">{adminError}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">ชื่อ-นามสกุล</label>
                    <input className="form-control" value={editingAdmin.name} onChange={(e) => handleEditAdminField("name", e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">อีเมล</label>
                    <input className="form-control" type="email" value={editingAdmin.email} onChange={(e) => handleEditAdminField("email", e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">เบอร์โทร (ไม่บังคับ)</label>
                    <input className="form-control" value={editingAdmin.phone} onChange={(e) => handleEditAdminField("phone", e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">รหัสผ่านใหม่</label>
                    <input className="form-control" type="password" placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน" value={editingAdmin.password} onChange={(e) => handleEditAdminField("password", e.target.value)} />
                    <small className="text-muted">กรอกเฉพาะเมื่อต้องการตั้งรหัสผ่านใหม่ให้แอดมินคนนี้</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light border" onClick={() => setEditingAdmin(null)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-boardhouse">บันทึกการแก้ไข</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminRoute;

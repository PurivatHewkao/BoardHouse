import React, { useState } from "react";
import { getOrders } from "../utils/orderStorage.js";
import { getProducts } from "../utils/productStorage.js";
import { getUsers } from "../utils/userStorage.js";
import { money } from "../utils/format.js";
import { resetStorage } from "../utils/localStorageDb.js";

function AdminRoute() {
  const [message, setMessage] = useState("");
  const [dashboardData, setDashboardData] = useState(() => ({
    products: getProducts(),
    orders: getOrders(),
    users: getUsers(),
  }));
  const { products, orders, users } = dashboardData;
  const customers = users.filter((user) => user.role === "customer");
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const stats = [
    { label: "Total Products", value: products.length, icon: "box" },
    { label: "Total Orders", value: orders.length, icon: "bag" },
    { label: "Total Customers", value: customers.length, icon: "users" },
    { label: "Total Sales", value: money(revenue), icon: "cash" },
  ];

  function handleResetData() {
    resetStorage();
    setDashboardData({
      products: getProducts(),
      orders: getOrders(),
      users: getUsers(),
    });
    setMessage("Mock data has been reset.");
  }

  return (
    <section className="py-5">
      <div className="container-xxl">
        <div className="row g-4">
          <aside className="col-lg-3">
            <h2 className="h6 text-muted text-uppercase mb-3">Admin</h2>
            <div className="list-group shadow-sm">
              <button className="list-group-item list-group-item-action active" type="button">
                <span className="tiny-grid" />
                Dashboard
              </button>
              <button className="list-group-item list-group-item-action" type="button">
                <span className="tiny-box" />
                Products
              </button>
              <button className="list-group-item list-group-item-action" type="button">
                <span className="tiny-list" />
                Orders
              </button>
            </div>
          </aside>
          <div className="col-lg-9">
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminRoute;

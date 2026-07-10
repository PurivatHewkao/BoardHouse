import React from "react";

function AdminRoute() {
  const stats = [
    { label: "Total Products", value: "128", icon: "box" },
    { label: "Total Orders", value: "342", icon: "bag" },
    { label: "Total Customers", value: "89", icon: "users" },
    { label: "Total Sales", value: "$12,480", icon: "cash" },
  ];

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
            <h1 className="page-title mb-2">Dashboard</h1>
            <p className="lead text-muted mb-4">Overview of the BoardHouse store.</p>
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

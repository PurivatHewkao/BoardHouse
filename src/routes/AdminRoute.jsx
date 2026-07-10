import React from "react";

function AdminRoute() {
  const stats = [
    { label: "Total Products", value: "128", icon: "box" },
    { label: "Total Orders", value: "342", icon: "bag" },
    { label: "Total Customers", value: "89", icon: "users" },
    { label: "Total Sales", value: "$12,480", icon: "cash" },
  ];

  return (
    <section className="py-12 xl:py-16">
      <div className="mx-auto max-w-[1680px] px-4 xl:px-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-muted">Admin</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-board">
              <button className="flex w-full items-center gap-3 bg-brand px-5 py-4 text-left font-bold text-white" type="button">
                <span className="tiny-grid" />
                Dashboard
              </button>
              <button className="flex w-full items-center gap-3 border-t border-line px-5 py-4 text-left font-bold text-muted transition hover:bg-soft hover:text-ink" type="button">
                <span className="tiny-box" />
                Products
              </button>
              <button className="flex w-full items-center gap-3 border-t border-line px-5 py-4 text-left font-bold text-muted transition hover:bg-soft hover:text-ink" type="button">
                <span className="tiny-list" />
                Orders
              </button>
            </div>
          </aside>
          <div>
            <h1 className="mb-2 font-serif text-5xl font-bold">Dashboard</h1>
            <p className="mb-8 text-xl text-muted">Overview of the BoardHouse store.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <article className="h-full rounded-2xl border border-line bg-white shadow-board">
                    <div className="flex items-center gap-4 p-6">
                      <span className={`grid h-16 w-16 flex-none place-items-center rounded-2xl bg-[#f5ede7] text-2xl font-extrabold text-brand stat-icon ${stat.icon}`} />
                      <div>
                        <p className="mb-1 text-lg text-muted">{stat.label}</p>
                        <strong className="font-serif text-4xl">{stat.value}</strong>
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

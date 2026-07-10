import React from "react";
import { orders } from "../data/orders.js";
import { money } from "../utils/format.js";

function OrdersRoute() {
  return (
    <section className="py-12 xl:py-16">
      <div className="mx-auto max-w-[1680px] px-4 xl:px-12">
        <h1 className="mb-2 font-serif text-5xl font-bold">Order History</h1>
        <p className="mb-8 text-xl text-muted">Your recent orders on BoardHouse.</p>
        <div className="grid gap-4">
          {orders.map((order) => (
            <article className="rounded-2xl border border-line bg-white shadow-board" key={order.id}>
              <div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
                <div>
                  <h2 className="mb-1 text-2xl font-bold">{order.id}</h2>
                  <p className="text-lg text-muted">
                    {order.date} &middot; {order.items}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <strong className="text-xl text-brand">{money(order.total)}</strong>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                      order.tone === "primary" ? "bg-brand text-white" : "bg-[#f2e7d5] text-ink"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrdersRoute;

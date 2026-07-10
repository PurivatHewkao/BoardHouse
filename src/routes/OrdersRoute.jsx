import React from "react";
import { orders } from "../data/orders.js";
import { money } from "../utils/format.js";

function OrdersRoute() {
  return (
    <section className="py-5">
      <div className="container-xxl">
        <h1 className="page-title mb-2">Order History</h1>
        <p className="lead text-muted mb-4">Your recent orders on BoardHouse.</p>
        <div className="vstack gap-3">
          {orders.map((order) => (
            <article className="card shadow-sm" key={order.id}>
              <div className="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <h2 className="h4 mb-1">{order.id}</h2>
                  <p className="mb-0 text-muted">
                    {order.date} &middot; {order.items}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <strong className="fs-5 text-brand">{money(order.total)}</strong>
                  <span className={`badge rounded-pill status ${order.tone}`}>{order.status}</span>
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

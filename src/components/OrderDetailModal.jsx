import React from "react";
import { money } from "../utils/format.js";

function OrderDetailModal({ order, customerName, onClose }) {
  if (!order) {
    return null;
  }

  const address = order.shippingAddress;

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="card shadow order-modal-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="h4 mb-1">{order.id}</h2>
              <p className="text-muted mb-0">{order.date}</p>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className={`badge rounded-pill status ${order.tone}`}>{order.status}</span>
            <span className="badge rounded-pill bg-light border text-dark">{order.paymentMethod}</span>
            {customerName && (
              <span className="badge rounded-pill bg-light border text-dark">
                <i className="bi bi-person me-1" />
                {customerName}
              </span>
            )}
          </div>

          <h3 className="h6 text-muted text-uppercase mb-2">รายการสินค้า</h3>
          <div className="table-responsive mb-3">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>สินค้า</th>
                  <th className="text-end">ราคา</th>
                  <th className="text-end">จำนวน</th>
                  <th className="text-end">รวม</th>
                </tr>
              </thead>
              <tbody>
                {(order.orderItems || []).map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td className="text-end">{money(item.price)}</td>
                    <td className="text-end">{item.quantity}</td>
                    <td className="text-end">{money(item.price * item.quantity)}</td>
                  </tr>
                ))}
                {(!order.orderItems || order.orderItems.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      {order.items || "ไม่มีรายการสินค้า"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-baseline fs-5 mb-4">
            <strong>รวมทั้งหมด</strong>
            <strong className="text-brand">{money(order.total)}</strong>
          </div>

          <h3 className="h6 text-muted text-uppercase mb-2">ที่อยู่จัดส่ง</h3>
          {address ? (
            <p className="mb-0 text-muted">
              {address.recipientName && (
                <>
                  {address.recipientName}
                  <br />
                </>
              )}
              {address.phone && (
                <>
                  {address.phone}
                  <br />
                </>
              )}
              {[address.line1, address.district, address.province, address.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : (
            <p className="mb-0 text-muted">ไม่มีข้อมูลที่อยู่จัดส่ง</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
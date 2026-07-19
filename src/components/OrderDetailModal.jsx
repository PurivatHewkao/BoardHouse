import React, { useState } from "react";
import { money } from "../utils/format.js";

const carrierOptions = [
  "ไปรษณีย์ไทย (Thailand Post)",
  "Kerry Express",
  "Flash Express",
  "J&T Express",
  "DHL",
  "อื่นๆ",
];

const emptyAddress = {
  recipientName: "",
  phone: "",
  line1: "",
  district: "",
  province: "",
  postalCode: "",
};

// ใช้ทั้งฝั่ง Admin (editable=true แก้ไขได้) และฝั่งลูกค้า (editable=false ดูอย่างเดียว)
// สำคัญ: ให้ใส่ key={order.id} ตอนเรียกใช้คอมโพเนนต์นี้ เพื่อรีเซ็ต state เวลาเปลี่ยนออเดอร์
function OrderDetailModal({ order, customerName, onClose, editable = false, onSave }) {
  const [addressForm, setAddressForm] = useState({ ...emptyAddress, ...(order?.shippingAddress || {}) });
  const [carrier, setCarrier] = useState(order?.carrier || carrierOptions[0]);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [savedMessage, setSavedMessage] = useState("");

  if (!order) {
    return null;
  }

  function updateAddressField(field, value) {
    setAddressForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    onSave?.({
      shippingAddress: { ...addressForm },
      trackingNumber: trackingNumber.trim(),
      carrier: trackingNumber.trim() ? carrier : "",
    });
    setSavedMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  const displayAddress = editable ? addressForm : order.shippingAddress;

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

          {order.status === "Cancelled" && (
            <div className="alert alert-danger mb-3">
              <div>
                <strong>เหตุผลที่ยกเลิก:</strong> {order.cancelReason || "ไม่ได้ระบุเหตุผล"}
              </div>
              {order.cancelledBy && (
                <div>
                  <strong>ยกเลิกโดย:</strong> {order.cancelledBy}
                </div>
              )}
            </div>
          )}

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

          <h3 className="h6 text-muted text-uppercase mb-2">การจัดส่ง / เลขพัสดุ</h3>
          {editable ? (
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">
                  ผู้ให้บริการขนส่ง
                  <select
                    className="form-select mt-2"
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                  >
                    {carrierOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  เลขพัสดุ (Tracking Number)
                  <input
                    className="form-control mt-2"
                    placeholder="เช่น TH1234567890"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              {order.trackingNumber ? (
                <div className="alert alert-light border mb-4 mb-md-4">
                  <div>
                    <strong>ผู้ให้บริการขนส่ง:</strong> {order.carrier || "-"}
                  </div>
                  <div>
                    <strong>เลขพัสดุ:</strong> {order.trackingNumber}
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-4">ยังไม่มีข้อมูลเลขพัสดุ</p>
              )}
            </>
          )}

          <h3 className="h6 text-muted text-uppercase mb-2">ที่อยู่จัดส่ง</h3>
          {editable ? (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  ชื่อผู้รับ
                  <input
                    className="form-control mt-2"
                    value={addressForm.recipientName}
                    onChange={(event) => updateAddressField("recipientName", event.target.value)}
                  />
                </label>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  เบอร์โทร
                  <input
                    className="form-control mt-2"
                    value={addressForm.phone}
                    onChange={(event) => updateAddressField("phone", event.target.value)}
                  />
                </label>
              </div>
              <div className="col-12">
                <label className="form-label">
                  ที่อยู่ (บ้านเลขที่, ถนน)
                  <input
                    className="form-control mt-2"
                    value={addressForm.line1}
                    onChange={(event) => updateAddressField("line1", event.target.value)}
                  />
                </label>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  เขต/อำเภอ
                  <input
                    className="form-control mt-2"
                    value={addressForm.district}
                    onChange={(event) => updateAddressField("district", event.target.value)}
                  />
                </label>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  จังหวัด
                  <input
                    className="form-control mt-2"
                    value={addressForm.province}
                    onChange={(event) => updateAddressField("province", event.target.value)}
                  />
                </label>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  รหัสไปรษณีย์
                  <input
                    className="form-control mt-2"
                    value={addressForm.postalCode}
                    onChange={(event) => updateAddressField("postalCode", event.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : displayAddress ? (
            <p className="mb-0 text-muted">
              {displayAddress.recipientName && (
                <>
                  {displayAddress.recipientName}
                  <br />
                </>
              )}
              {displayAddress.phone && (
                <>
                  {displayAddress.phone}
                  <br />
                </>
              )}
              {[displayAddress.line1, displayAddress.district, displayAddress.province, displayAddress.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : (
            <p className="mb-0 text-muted">ไม่มีข้อมูลที่อยู่จัดส่ง</p>
          )}

          {editable && (
            <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
              <button type="button" className="btn btn-boardhouse" onClick={handleSave}>
                บันทึกการเปลี่ยนแปลง
              </button>
              {savedMessage && <span className="text-success small">{savedMessage}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
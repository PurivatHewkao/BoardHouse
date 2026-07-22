import React, { useMemo, useState } from "react";
import { paymentMethods } from "../data/seedData.js";
import { money } from "../utils/format.js";
import { getUserAddresses } from "../utils/userStorage.js";
import { validateAddress } from "../utils/validation.js";

// ดึงสมุดที่อยู่ของผู้ใช้ (source of truth เดียวกับหน้า Profile) โดยเรียงที่อยู่หลักไว้บนสุด
function getSavedAddresses(currentUser) {
  if (!currentUser) {
    return [];
  }

  const addresses = getUserAddresses(currentUser);
  return [...addresses].sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)));
}

function CheckoutRoute({ items, subtotal, currentUser, placeOrder, setPage, saveAddress }) {
  const savedAddresses = useMemo(() => getSavedAddresses(currentUser), [currentUser]);

  const [selectedAddressId, setSelectedAddressId] = useState(() =>
    savedAddresses.length > 0 ? savedAddresses[0].id : "new"
  );
  const [newAddress, setNewAddress] = useState({
    recipientName: currentUser?.name || "",
    phone: currentUser?.phone || "",
    label: "Home",
    line1: "",
    district: "",
    province: "",
    postalCode: "",
  });
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [message, setMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  function updateNewAddress(field, value) {
    setNewAddress((current) => ({ ...current, [field]: value }));
  }

  React.useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId !== "new") {
      const exists = savedAddresses.some(addr => addr.id === selectedAddressId);
      if (!exists) {
        setSelectedAddressId(savedAddresses[0].id);
      }
    }
  }, [savedAddresses, selectedAddressId]);

  function getShippingAddress() {
    if (selectedAddressId !== "new") {
      return savedAddresses.find((addr) => addr.id === selectedAddressId) || null;
    }
    return { ...newAddress };
  }

  function validate() {
    if (selectedAddressId === "new") {
      const check = validateAddress(newAddress);
      if (!check.ok) {
        return check.message;
      }
    } else if (!getShippingAddress()) {
      return "กรุณาเลือกที่อยู่จัดส่ง";
    }

    if (paymentMethod === "Credit Card") {
      const digitsOnly = cardNumber.replace(/\s+/g, "");

      if (!/^\d{13,19}$/.test(digitsOnly)) {
        return "Please enter a valid card number.";
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        return "Please enter card expiry as MM/YY.";
      }

      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        return "Please enter a valid CVV.";
      }
    }

    return "";
  }

  function handlePlaceOrder() {
    if (items.length === 0) {
      return;
    }

    const validationMessage = validate();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage("");
    setIsPlacingOrder(true);

    const shippingAddress = getShippingAddress();

    if (selectedAddressId === "new" && saveNewAddress && typeof saveAddress === "function") {
      saveAddress(newAddress);
    }

    placeOrder({
      paymentMethod,
      shippingAddress,
    });
  }

  return (
    <section className="py-5">
      <div className="container-xxl">
        <h1 className="page-title mb-4">Payment</h1>
        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <div className="vstack gap-4">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 mb-3">Shipping Address</h2>

                  {savedAddresses.length > 0 && (
                    <div className="vstack gap-2 mb-3">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`address-option ${selectedAddressId === addr.id ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="shipping-address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <span>
                            <strong>{addr.label}</strong>
                            <br />
                            <span className="text-muted small">
                              {addr.recipientName} &middot; {addr.phone}
                              <br />
                              {[addr.line1, addr.district, addr.province, addr.postalCode]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </span>
                        </label>
                      ))}
                      <label className={`address-option ${selectedAddressId === "new" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="shipping-address"
                          checked={selectedAddressId === "new"}
                          onChange={() => setSelectedAddressId("new")}
                        />
                        <span>
                          <strong>+ ใช้ที่อยู่ใหม่</strong>
                        </span>
                      </label>
                    </div>
                  )}

                  {selectedAddressId === "new" && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          Recipient Name
                          <input
                            className="form-control mt-2"
                            value={newAddress.recipientName}
                            onChange={(event) => updateNewAddress("recipientName", event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Phone Number
                          <input
                            className="form-control mt-2"
                            value={newAddress.phone}
                            onChange={(event) => updateNewAddress("phone", event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-12">
                        <label className="form-label">
                          Address
                          <input
                            className="form-control mt-2"
                            placeholder="House no., Street"
                            value={newAddress.line1}
                            onChange={(event) => updateNewAddress("line1", event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          District
                          <input
                            className="form-control mt-2"
                            value={newAddress.district}
                            onChange={(event) => updateNewAddress("district", event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          Province
                          <input
                            className="form-control mt-2"
                            value={newAddress.province}
                            onChange={(event) => updateNewAddress("province", event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          Postal Code
                          <input
                            className="form-control mt-2"
                            value={newAddress.postalCode}
                            onChange={(event) => updateNewAddress("postalCode", event.target.value)}
                          />
                        </label>
                      </div>
                      {currentUser && (
                        <div className="col-12">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="save-new-address"
                              checked={saveNewAddress}
                              onChange={(event) => setSaveNewAddress(event.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="save-new-address">
                              บันทึกที่อยู่นี้ไว้ใช้ในครั้งถัดไป
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 mb-3">Payment Method</h2>
                  <div className="list-group shadow-sm mb-3">
                    {paymentMethods.map((method) => (
                      <button
                        className={
                          method === paymentMethod
                            ? "list-group-item list-group-item-action active"
                            : "list-group-item list-group-item-action"
                        }
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "Credit Card" && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">
                          Card Number
                          <input
                            className="form-control mt-2"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(event) => setCardNumber(event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-6">
                        <label className="form-label">
                          Expiry (MM/YY)
                          <input
                            className="form-control mt-2"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(event) => setCardExpiry(event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="col-6">
                        <label className="form-label">
                          CVV
                          <input
                            className="form-control mt-2"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(event) => setCardCvv(event.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "Bank Transfer" && (
                    <p className="mb-0 text-muted">
                      Transfer the total amount to BoardHouse Bank account 123-4-56789-0, then your order will be
                      confirmed as paid.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <aside className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h3 mb-4">Order Summary</h2>
                <div className="vstack gap-2 mb-3">
                  {items.map((item) => (
                    <div className="d-flex justify-content-between" key={item.productId}>
                      <span className="text-muted">
                        {item.product.name} &times; {item.quantity}
                      </span>
                      <strong>{money(item.product.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Shipping</span>
                  <strong>Free</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-baseline mb-4 fs-4">
                  <span>Total</span>
                  <strong className="text-brand">{money(subtotal)}</strong>
                </div>
                {message && <p className="text-danger mb-3">{message}</p>}
                <button
                  className="btn btn-boardhouse btn-lg w-100 mb-2"
                  type="button"
                  disabled={items.length === 0 || isPlacingOrder}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
                <button
                  className="btn btn-outline-secondary w-100"
                  type="button"
                  onClick={() => setPage("Cart")}
                >
                  Back to Cart
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CheckoutRoute;
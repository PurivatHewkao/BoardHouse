import React, { useState } from "react";
import { paymentMethods } from "../data/seedData.js";
import { money } from "../utils/format.js";

const emptyAddress = {
  label: "Home",
  line1: "",
  district: "",
  province: "",
  postalCode: "",
};

function CheckoutRoute({ items, subtotal, currentUser, placeOrder, setPage }) {
  const [recipientName, setRecipientName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState({ ...emptyAddress, ...(currentUser?.address || {}) });
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [message, setMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (!recipientName.trim() || !phone.trim()) {
      return "Please provide a recipient name and phone number.";
    }

    if (!address.line1.trim() || !address.district.trim() || !address.province.trim() || !address.postalCode.trim()) {
      return "Please complete the full shipping address.";
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

    placeOrder({
      paymentMethod,
      shippingAddress: { ...address, recipientName, phone },
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
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Recipient Name
                        <input
                          className="form-control mt-2"
                          value={recipientName}
                          onChange={(event) => setRecipientName(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Phone Number
                        <input
                          className="form-control mt-2"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Address
                        <input
                          className="form-control mt-2"
                          placeholder="House no., Street"
                          value={address.line1}
                          onChange={(event) => updateAddress("line1", event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">
                        District
                        <input
                          className="form-control mt-2"
                          value={address.district}
                          onChange={(event) => updateAddress("district", event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">
                        Province
                        <input
                          className="form-control mt-2"
                          value={address.province}
                          onChange={(event) => updateAddress("province", event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">
                        Postal Code
                        <input
                          className="form-control mt-2"
                          value={address.postalCode}
                          onChange={(event) => updateAddress("postalCode", event.target.value)}
                        />
                      </label>
                    </div>
                  </div>
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

                  {paymentMethod === "Cash on Delivery" && (
                    <p className="mb-0 text-muted">Pay in cash when your order arrives at your door.</p>
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
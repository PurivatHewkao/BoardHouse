import React from "react";
import { money } from "../utils/format.js";

function CartRoute({ items, subtotal, changeQuantity, removeItem, checkout }) {
  return (
    <section className="py-5">
      <div className="container-xxl">
        <h1 className="page-title mb-4">Your Cart</h1>
        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <div className="vstack gap-3">
              {items.map((item) => (
                <article className="card shadow-sm" key={item.productId}>
                  <div className="card-body">
                    <div className="row g-3 align-items-center">
                      <div className="col-auto">
                        <div className="cart-thumb" />
                      </div>
                      <div className="col">
                        <h2 className="h4 mb-1">{item.product.name}</h2>
                        <p className="mb-0 text-muted">{money(item.product.price)}</p>
                      </div>
                      <div className="col-12 col-md-auto">
                        <div className="d-flex align-items-center gap-2">
                          <button className="btn btn-light border quantity-button" type="button" onClick={() => changeQuantity(item.productId, -1)}>
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button className="btn btn-light border quantity-button" type="button" onClick={() => changeQuantity(item.productId, 1)}>
                            +
                          </button>
                          <button className="btn btn-outline-danger ms-2" type="button" onClick={() => removeItem(item.productId)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <div className="card shadow-sm">
                  <div className="card-body text-center text-muted">Your cart is empty.</div>
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-4">
            <aside className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h3 mb-4">Order Summary</h2>
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
                <button
                  className="btn btn-boardhouse btn-lg w-100"
                  type="button"
                  disabled={items.length === 0}
                  onClick={checkout}
                >
                  Checkout
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartRoute;

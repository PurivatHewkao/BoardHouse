import React from "react";
import { money } from "../utils/format.js";

function CartRoute({ items, subtotal, changeQuantity, removeItem }) {
  return (
    <section className="py-12 xl:py-16">
      <div className="mx-auto max-w-[1680px] px-4 xl:px-12">
        <h1 className="mb-8 font-serif text-5xl font-bold">Your Cart</h1>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
          <div>
            <div className="grid gap-4">
              {items.map((item) => (
                <article className="rounded-2xl border border-line bg-white shadow-board" key={item.productId}>
                  <div className="p-5 md:p-6">
                    <div className="grid gap-4 md:grid-cols-[96px_1fr_auto] md:items-center">
                      <div>
                        <div className="h-24 w-24 rounded-xl bg-soft" />
                      </div>
                      <div>
                        <h2 className="mb-1 font-serif text-2xl font-bold">{item.product.name}</h2>
                        <p className="text-lg text-muted">{money(item.product.price)}</p>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-xl shadow-board transition hover:bg-soft" type="button" onClick={() => changeQuantity(item.productId, -1)}>
                            -
                          </button>
                          <span className="min-w-8 text-center text-xl font-bold">{item.quantity}</span>
                          <button className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-xl shadow-board transition hover:bg-soft" type="button" onClick={() => changeQuantity(item.productId, 1)}>
                            +
                          </button>
                          <button className="ml-2 rounded-xl border border-red-300 px-4 py-2 font-bold text-red-600 transition hover:bg-red-50" type="button" onClick={() => removeItem(item.productId)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div>
            <aside className="rounded-2xl border border-line bg-white shadow-board">
              <div className="p-6">
                <h2 className="mb-6 font-serif text-3xl font-bold">Order Summary</h2>
                <div className="mb-4 flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div className="mb-4 flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <strong>Free</strong>
                </div>
                <hr className="my-5 border-line" />
                <div className="mb-6 flex items-baseline justify-between text-2xl font-bold">
                  <span>Total</span>
                  <strong className="text-brand">{money(subtotal)}</strong>
                </div>
                <button className="w-full rounded-xl border border-brand bg-brand px-6 py-4 text-lg font-extrabold text-white shadow-board transition hover:bg-brand-dark" type="button">
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

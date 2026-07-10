import React, { useMemo, useState } from "react";
import DiceMark from "../components/DiceMark.jsx";
import { categories, products } from "../data/products.js";
import { money } from "../utils/format.js";

function HomeRoute({ addToCart }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1680px] px-4 py-16 xl:px-12 xl:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="mb-6 inline-flex rounded-full border border-line bg-surface px-4 py-2 text-sm font-extrabold text-ink shadow-board">
                University Project
              </span>
              <h1 className="mb-6 font-serif text-6xl leading-[1.08] text-ink md:text-7xl xl:text-8xl">
                Welcome to <span className="block text-brand">BoardHouse</span>
              </h1>
              <p className="max-w-3xl text-xl leading-8 text-muted md:text-2xl">
                Discover strategy, family, party, and card games. Roll the dice on your next favorite board game.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-xl border border-brand bg-brand px-8 py-4 text-lg font-extrabold text-white shadow-board transition hover:bg-brand-dark" type="button">
                  Shop Now
                </button>
                <button className="rounded-xl border border-line bg-surface px-8 py-4 text-lg font-extrabold text-ink shadow-board transition hover:bg-soft" type="button">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="grid aspect-square w-full max-w-[385px] place-items-center rounded-[2rem] bg-[#eadccf]" aria-hidden="true">
                <div className="large-dice grid aspect-square w-[42%] place-items-center rounded-3xl border-[1rem] border-brand text-brand">
                  <DiceMark />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 xl:py-16">
        <div className="mx-auto max-w-[1680px] px-4 xl:px-12">
          <div className="mb-10 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <label className="flex min-h-14 items-center overflow-hidden rounded-xl border border-line bg-surface shadow-board">
                <span className="border-r border-line px-4 font-bold text-muted" aria-hidden="true">
                  Search
                </span>
                <input
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-lg text-ink outline-none placeholder:text-muted/70"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search board games..."
                />
              </label>
            </div>
            <div>
              <div className="flex flex-wrap gap-2 lg:justify-end" aria-label="Product categories">
                {categories.map((item) => (
                  <button
                    className={`rounded-xl border border-line px-5 py-3 font-bold shadow-board transition ${
                      category === item ? "bg-soft text-ink" : "bg-surface text-ink hover:bg-soft"
                    }`}
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} addToCart={addToCart} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-board">
      <div className="grid min-h-[250px] place-items-center bg-soft text-muted">Product Image</div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex justify-between gap-3">
          <div>
            <h2 className="mb-1 font-serif text-3xl leading-tight">{product.name}</h2>
            <p className="text-xl font-extrabold text-brand">{money(product.price)}</p>
          </div>
          <div className="text-right text-sm text-muted">
            <span className="mb-2 inline-flex rounded-full bg-[#f2e7d5] px-3 py-1 font-extrabold text-ink">
              {product.category}
            </span>
            <div className="whitespace-nowrap">Stock: {product.stock}</div>
          </div>
        </div>
        <div className="mt-auto flex gap-2">
          <button className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 font-bold text-ink transition hover:bg-soft" type="button">
            View
          </button>
          <button
            className="flex-1 rounded-xl border border-brand bg-brand px-4 py-3 font-bold text-white transition hover:bg-brand-dark"
            type="button"
            onClick={() => addToCart(product.id)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default HomeRoute;

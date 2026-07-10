import React, { useMemo, useState } from "react";
import DiceMark from "../components/DiceMark.jsx";
import { categories } from "../data/products.js";
import { money } from "../utils/format.js";

function HomeRoute({ products, addToCart }) {
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
      <section className="hero-section border-bottom">
        <div className="container-xxl py-5">
          <div className="row align-items-center g-5 py-lg-5">
            <div className="col-lg-7">
              <span className="badge rounded-pill text-bg-light border px-3 py-2 mb-4">University Project</span>
              <h1 className="hero-title display-1 mb-4">
                Welcome to <span className="d-block text-brand">BoardHouse</span>
              </h1>
              <p className="lead text-muted mb-4">
                Discover strategy, family, party, and card games. Roll the dice on your next favorite board game.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <button className="btn btn-boardhouse btn-lg px-4" type="button">
                  Shop Now
                </button>
                <button className="btn btn-light btn-lg border px-4" type="button">
                  Learn More
                </button>
              </div>
            </div>
            <div className="col-lg-5 d-flex justify-content-lg-center">
              <div className="hero-art" aria-hidden="true">
                <div className="large-dice">
                  <DiceMark />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container-xxl">
          <div className="row g-3 align-items-center mb-5">
            <div className="col-lg-5">
              <label className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0" aria-hidden="true">
                  Search
                </span>
                <input
                  className="form-control border-start-0"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search board games..."
                />
              </label>
            </div>
            <div className="col-lg-7">
              <div className="d-flex flex-wrap justify-content-lg-end gap-2" aria-label="Product categories">
                {categories.map((item) => (
                  <button
                    className={category === item ? "btn btn-category active" : "btn btn-category"}
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

          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
            {visibleProducts.map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} addToCart={addToCart} />
              </div>
            ))}
            {visibleProducts.length === 0 && (
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body text-center text-muted">No products found.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="card product-card h-100 shadow-sm">
      <div className="product-image card-img-top">Product Image</div>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h3 mb-1">{product.name}</h2>
            <p className="price mb-0">{money(product.price)}</p>
          </div>
          <div className="text-end text-muted small">
            <span className="badge rounded-pill tag mb-2">{product.category}</span>
            <div>Stock: {product.stock}</div>
          </div>
        </div>
        <div className="d-flex gap-2 mt-auto">
          <button className="btn btn-light border flex-fill" type="button">
            View
          </button>
          <button
            className="btn btn-boardhouse flex-fill"
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product.id)}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default HomeRoute;

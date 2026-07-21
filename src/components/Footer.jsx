import React from "react";
import { categories } from "../data/products.js";

const footerCategories = categories.filter((category) => category !== "All");

function Footer({ onShopCategory, selectedCategory }) {
  return (
    <footer className="site-footer border-top">
      <div className="container-xxl py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <h2 className="h3 mb-3">BoardHouse</h2>
            <p className="mb-0 text-muted">Your friendly online board game shop.</p>
          </div>
          <div className="col-md-4">
            <h3 className="h5 mb-3">Shop</h3>
            <div className="d-grid gap-2 align-items-start">
              {footerCategories.map((category) => (
                <button
                  className={`footer-shop-link link-boardhouse p-0 text-start text-decoration-none ${
                    selectedCategory === category ? "fw-bold" : "text-muted"
                  }`}
                  key={category}
                  type="button"
                  onClick={() => onShopCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-4">
            <h3 className="h5 mb-3">About</h3>
            <p className="mb-2 text-muted">
              BoardHouse is an online board game store for discovering strategy games, family picks,
              party favorites, and card games in one place.
            </p>
            <p className="mb-0 text-muted">
              Browse products, add items to your cart, place orders, and track purchase history through
              a simple e-commerce shopping experience.
            </p>
          </div>
        </div>
      </div>
      <div className="border-top py-3 text-center text-muted">(c) 2026 BoardHouse</div>
    </footer>
  );
}

export default Footer;

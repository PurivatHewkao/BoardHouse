import React from "react";
import DiceMark from "./DiceMark.jsx";

const navItems = ["Home", "Cart", "Orders", "Login", "Register", "Admin"];

function Header({ page, setPage }) {
  return (
    <header className="site-header sticky-top">
      <nav className="container-xxl navbar navbar-expand-xl py-3">
        <button className="brand-button navbar-brand d-flex align-items-center gap-3 border-0 bg-transparent" type="button" onClick={() => setPage("Home")}>
          <span className="brand-icon d-inline-grid place-items-center">
            <DiceMark />
          </span>
          <span>BoardHouse</span>
        </button>
        <div className="nav-scroll ms-xl-auto" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={page === item ? "btn nav-button active" : "btn nav-button"}
              key={item}
              type="button"
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;

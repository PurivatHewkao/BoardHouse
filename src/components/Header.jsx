import React from "react";
import DiceMark from "./DiceMark.jsx";
import { ADMIN_NAV, getAccessLabel, getNavItems, isAdmin as checkAdmin } from "../utils/roles.js";

function Header({ page, setPage, currentUser, onLogout }) {
  const isAdmin = checkAdmin(currentUser);

  // แบ่งเมนูตาม role จากกติกากลางใน roles.js (admin เห็นแท็บ Admin เพิ่ม)
  const navItems = getNavItems(currentUser);

  return (
    <header className="site-header sticky-top">
      <nav className="container-xxl navbar navbar-expand-xl py-3">
        <button
          className="brand-button navbar-brand d-flex align-items-center gap-3 border-0 bg-transparent"
          type="button"
          onClick={() => setPage(isAdmin ? "Admin" : "Home")}
        >
          <span className="brand-icon d-inline-grid place-items-center">
            <DiceMark />
          </span>
          <span>BoardHouse</span>
        </button>

        <div className="nav-scroll ms-xl-auto align-items-center" aria-label="Main navigation">
          {navItems.map((item) => {
            const isAdminTab = item === ADMIN_NAV;
            const classes = [
              "btn",
              "nav-button",
              isAdminTab ? "admin-tab" : "",
              page === item ? "active" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button className={classes} key={item} type="button" onClick={() => setPage(item)}>
                {isAdminTab && <i className="bi bi-shield-lock me-1" />}
                {item}
              </button>
            );
          })}

          {currentUser ? (
            <>
              <span className={`user-chip ${isAdmin ? "is-admin" : "is-customer"}`}>
                <i className="bi bi-person-circle text-brand" />
                <span className="user-chip-name">{currentUser.name}</span>
                <span className={`role-badge ${currentUser.role}`}>{getAccessLabel(currentUser)}</span>
              </span>
              <button className="btn nav-button" type="button" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className={page === "Login" ? "btn nav-button active" : "btn nav-button"}
                type="button"
                onClick={() => setPage("Login")}
              >
                Login
              </button>
              <button
                className={page === "Register" ? "btn nav-button active" : "btn nav-button"}
                type="button"
                onClick={() => setPage("Register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

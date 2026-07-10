import React from "react";
import DiceMark from "./DiceMark.jsx";

const navItems = ["Home", "Cart", "Orders", "Login", "Register", "Admin"];

function Header({ page, setPage }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-[1680px] flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-12">
        <button
          className="flex items-center gap-3 border-0 bg-transparent p-0 font-serif text-[clamp(1.6rem,2vw,2rem)] font-bold text-ink"
          type="button"
          onClick={() => setPage("Home")}
        >
          <span className="grid h-[54px] w-[54px] flex-none place-items-center rounded-2xl bg-brand text-[#fffaf2]">
            <DiceMark />
          </span>
          <span>BoardHouse</span>
        </button>
        <div className="flex gap-2 overflow-x-auto py-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`whitespace-nowrap rounded-xl px-4 py-3 font-bold transition ${
                page === item ? "bg-soft text-ink" : "text-muted hover:bg-soft hover:text-ink"
              }`}
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

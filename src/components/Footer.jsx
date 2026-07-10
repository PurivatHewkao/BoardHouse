import React from "react";

function Footer() {
  return (
    <footer className="border-t border-line bg-[#f5efe4]">
      <div className="mx-auto max-w-[1680px] px-4 py-12 xl:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="mb-3 font-serif text-3xl font-bold">BoardHouse</h2>
            <p className="text-muted">Your friendly online board game shop.</p>
          </div>
          <div>
            <h3 className="mb-3 text-xl font-bold">Shop</h3>
            <p className="mb-2 text-muted">Strategy</p>
            <p className="mb-2 text-muted">Family</p>
            <p className="mb-2 text-muted">Party</p>
            <p className="text-muted">Card Games</p>
          </div>
          <div>
            <h3 className="mb-3 text-xl font-bold">About</h3>
            <p className="text-muted">University project scaffold. Data will be stored in localStorage.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-4 py-3 text-center text-muted">(c) 2026 BoardHouse - University Project</div>
    </footer>
  );
}

export default Footer;

import React from "react";

function Footer() {
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
            <p className="mb-2 text-muted">Strategy</p>
            <p className="mb-2 text-muted">Family</p>
            <p className="mb-2 text-muted">Party</p>
            <p className="mb-0 text-muted">Card Games</p>
          </div>
          <div className="col-md-4">
            <h3 className="h5 mb-3">About</h3>
            <p className="mb-0 text-muted">University project scaffold. Data will be stored in localStorage.</p>
          </div>
        </div>
      </div>
      <div className="border-top py-3 text-center text-muted">(c) 2026 BoardHouse - University Project</div>
    </footer>
  );
}

export default Footer;

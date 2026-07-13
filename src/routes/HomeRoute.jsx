import React, { useMemo, useState } from "react";
import DiceMark from "../components/DiceMark.jsx";
import { categories } from "../data/products.js";
import { money } from "../utils/format.js";

function HomeRoute({ products, addToCart }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  
  // 🔥 State สำหรับเก็บข้อมูลสินค้าที่ลูกค้ากำลังกดดู (สไตล์ Shopee Modal)
  const [selectedProduct, setSelectedProduct] = useState(null);

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
                {/* ส่งฟังก์ชันเปิดหน้าต่างรายละเอียดสินค้าไปให้การ์ดสินค้า */}
                <ProductCard product={product} addToCart={addToCart} onViewProduct={setSelectedProduct} />
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

      {/* 🔥 หน้าต่างป๊อปอัปรายละเอียดสินค้าสไตล์ Shopee (Bootstrap Modal) */}
      {selectedProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* ฝั่งซ้าย: รูปภาพใหญ่ชัดเจน */}
                  <div className="col-md-6">
                    <img 
                      src={selectedProduct.image || "https://placehold.co/400x300?text=No+Image"} 
                      alt={selectedProduct.name} 
                      className="img-fluid rounded w-100 shadow-sm"
                      style={{ height: "350px", objectFit: "cover" }}
                    />
                  </div>
                  {/* ฝั่งขวา: รายละเอียดสินค้า ราคา และปุ่มสั่งซื้อแบบ Shopee */}
                  <div className="col-md-6 d-flex flex-column justify-content-between">
                    <div>
                      <span className="badge bg-brand mb-2">{selectedProduct.category || "Board Game"}</span>
                      <h2 className="h3 fw-bold mb-3">{selectedProduct.name}</h2>
                      <div className="p-3 bg-light rounded mb-3">
                        <span className="display-6 fw-bold text-brand">{money(selectedProduct.price)}</span>
                      </div>
                      <h5 className="h6 fw-bold text-dark mb-2">รายละเอียดสินค้า</h5>
                      <p className="text-muted small" style={{ whiteSpace: "pre-line" }}>
                        {selectedProduct.description || "ไม่มีคำอธิบายเพิ่มเติมสำหรับสินค้าชิ้นนี้"}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-top">
                      <div className="d-flex justify-content-between text-muted small mb-3">
                        <span>สถานะสินค้า: {selectedProduct.stock > 0 ? "มีสินค้าในคลัง" : "สินค้าหมด"}</span>
                        <span>คงเหลือ: {selectedProduct.stock} ชิ้น</span>
                      </div>
                      <button 
                        className="btn btn-boardhouse btn-lg w-100" 
                        disabled={selectedProduct.stock <= 0}
                        onClick={() => {
                          addToCart(selectedProduct.id);
                          setSelectedProduct(null); // เพิ่มลงตะกร้าแล้วปิดหน้าต่างอัตโนมัติ
                        }}
                      >
                        {selectedProduct.stock > 0 ? "🛒 ใส่ตะกร้าสินค้า" : "❌ สินค้าหมดชั่วคราว"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProductCard({ product, addToCart, onViewProduct }) {
  return (
    <article className="card product-card h-100 shadow-sm overflow-hidden">
      <div className="product-image" style={{ height: "220px", width: "100%", background: "#f8f9fa" }}>
        <img 
          src={product.image || "https://placehold.co/300x200?text=No+Image"} 
          alt={product.name} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h3 mb-1" style={{ fontSize: "1.2rem" }}>{product.name}</h2>
            <p className="price mb-0">{money(product.price)}</p>
          </div>
          <div className="text-end text-muted small">
            <span className="badge rounded-pill tag mb-2 bg-light border text-dark">{product.category || "General"}</span>
            <div>Stock: {product.stock}</div>
          </div>
        </div>
        <div className="d-flex gap-2 mt-auto">
          {/* เวลากด View จะส่งข้อมูลสินค้าขึ้นไปเปิดตัวป๊อปอัป Shopee Modal */}
          <button className="btn btn-light border flex-fill" type="button" onClick={() => onViewProduct(product)}>
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
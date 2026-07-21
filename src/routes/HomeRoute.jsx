import React, { useMemo, useState } from "react";
import DiceMark from "../components/DiceMark.jsx";
import { categories } from "../data/products.js";
import { money } from "../utils/format.js";

function HomeRoute({ products, addToCart, selectedCategory, setSelectedCategory }) {
  const [query, setQuery] = useState("");
  const category = selectedCategory || "All";
  
  // 👶 State สำหรับตัวกรองอายุขั้นต่ำ (กี่ปีขึ้นไป)
  const [selectedAge, setSelectedAge] = useState("All");
  
  // 👥 State สำหรับตัวกรองจำนวนผู้เล่น
  const [selectedPlayers, setSelectedPlayers] = useState("All");
  
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔍 ฟังก์ชันจัดหมวดหมู่และกรองข้อมูลขั้นสูง
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");

    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const searchableText = `${product.name || ""} ${product.category || ""}`.toLocaleLowerCase("th-TH");
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const productAge = Number(product.minAge || 0); 
      const matchesAge = selectedAge === "All" || productAge >= Number(selectedAge);
      
      let matchesPlayers = true;
      if (selectedPlayers !== "All") {
        const minP = Number(product.minPlayers || 0);
        const maxP = Number(product.maxPlayers || 99);
        
        if (selectedPlayers === "2") {
          matchesPlayers = minP <= 2 && maxP >= 2;
        } else if (selectedPlayers === "3-4") {
          matchesPlayers = (minP <= 3 && maxP >= 3) || (minP <= 4 && maxP >= 4);
        } else if (selectedPlayers === "5+") {
          matchesPlayers = maxP >= 5;
        }
      }
      
      return matchesCategory && matchesQuery && matchesAge && matchesPlayers;
    });
  }, [category, query, selectedAge, selectedPlayers, products]);

  const ageFilters = [
    { label: "ทุกช่วงอายุ", value: "All" },
    { label: "3 ปีขึ้นไป", value: 3 },
    { label: "8 ปีขึ้นไป", value: 8 },
    { label: "10 ปีขึ้นไป", value: 10 },
    { label: "14 ปีขึ้นไป", value: 14 }
  ];

  const playerFilters = [
    { label: "ไม่จำกัด", value: "All" },
    { label: "สำหรับ 2 คน", value: "2" },
    { label: "3 - 4 คน", value: "3-4" },
    { label: "5 คนขึ้นไป", value: "5+" }
  ];

  const hasActiveFilters =
    query.trim() || category !== "All" || selectedAge !== "All" || selectedPlayers !== "All";

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setSelectedAge("All");
    setSelectedPlayers("All");
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="container-xxl position-relative py-5">
          <div className="row align-items-center g-5 py-lg-4">
            <div className="col-lg-7 py-lg-4">
              <span className="hero-eyebrow mb-4">
                <span className="hero-eyebrow-dot" /> บ้านของคนรักบอร์ดเกม
              </span>
              <h1 className="hero-title mb-4">
                <span className="text-brand">เริ่มต้นที่ BoardHouse</span>
              </h1>
              <p className="hero-copy mb-4">
                เลือกบอร์ดเกมสำหรับทุกวง ทุกวัย และทุกสไตล์การเล่น พร้อมค้นหาเกมที่เหมาะกับกลุ่มของคุณได้ง่ายในไม่กี่คลิก
              </p>
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <a className="btn btn-boardhouse btn-lg hero-cta" href="#products">
                  เลือกดูบอร์ดเกม <span aria-hidden="true">→</span>
                </a>
                <span className="hero-note">จัดส่งความสนุกถึงหน้าบ้าน</span>
              </div>
              <div className="hero-highlights">
                <span><strong>{products.length}+</strong> เกมน่าเล่น</span>
                <span><strong>{Math.max(0, categories.length - 1)}</strong> หมวดหมู่</span>
                <span><strong>100%</strong> เลือกได้ตามสไตล์คุณ</span>
              </div>
            </div>
            <div className="col-lg-5 d-flex justify-content-lg-center">
              <div className="hero-art" aria-hidden="true">
                <span className="hero-orbit hero-orbit-one">PARTY</span>
                <span className="hero-orbit hero-orbit-two">STRATEGY</span>
                <span className="hero-orbit hero-orbit-three">FAMILY</span>
                <div className="hero-art-ring" />
                <div className="large-dice"><DiceMark /></div>
                <span className="hero-piece hero-piece-circle" />
                <span className="hero-piece hero-piece-square" />
                <span className="hero-piece hero-piece-triangle" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-catalog pb-5" id="products">
        <div className="container-xxl">
          <div className="filter-panel">
            <div className="filter-panel-top">
              <label className="home-search">
                <span className="home-search-icon" aria-hidden="true">⌕</span>
                <span className="visually-hidden">ค้นหาบอร์ดเกม</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ค้นหาชื่อเกมหรือหมวดหมู่..."
                />
              </label>
              <div className="filter-result">
                พบ <strong>{visibleProducts.length}</strong> เกม
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label">ประเภทเกม</span>
              <div className="filter-options">
                {categories.map((item) => (
                  <button
                    className={category === item ? "filter-chip active" : "filter-chip"}
                    key={item}
                    type="button"
                    onClick={() => setSelectedCategory(item)}
                  >
                    {item === "All" ? "ทุกประเภท" : item}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label">อายุแนะนำ</span>
              <div className="filter-options">
              {ageFilters.map((age) => (
                <button
                  key={age.value}
                  type="button"
                  className={selectedAge === age.value ? "filter-chip active" : "filter-chip"}
                  onClick={() => setSelectedAge(age.value)}
                >
                  {age.label}
                </button>
              ))}
              </div>
            </div>

            <div className="filter-row filter-row-last">
              <span className="filter-label">จำนวนผู้เล่น</span>
              <div className="filter-options">
              {playerFilters.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={selectedPlayers === p.value ? "filter-chip active" : "filter-chip"}
                  onClick={() => setSelectedPlayers(p.value)}
                >
                  {p.label}
                </button>
              ))}
              </div>
              {hasActiveFilters && (
                <button className="filter-clear" type="button" onClick={clearFilters}>
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          <div className="catalog-heading">
            <div>
              <span className="catalog-kicker">เลือกเกมที่เข้ากับวงของคุณ</span>
              <h2 className="catalog-title">บอร์ดเกมทั้งหมด</h2>
            </div>
            <p>คัดสรรเกมยอดนิยม พร้อมข้อมูลผู้เล่น อายุ และสต็อกครบถ้วน</p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
            {visibleProducts.map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} addToCart={addToCart} onViewProduct={setSelectedProduct} />
              </div>
            ))}
            {visibleProducts.length === 0 && (
              <div className="col-12">
                <div className="empty-products">
                  <span className="empty-products-icon">⌕</span>
                  <h3>ยังไม่เจอเกมที่ตรงใจ</h3>
                  <p>ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองให้น้อยลงอีกนิด</p>
                  <button className="btn btn-boardhouse" type="button" onClick={clearFilters}>ดูเกมทั้งหมด</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shopee Style Modal */}
      {selectedProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <img 
                      src={selectedProduct.image || "https://placehold.co/400x300?text=No+Image"} 
                      alt={selectedProduct.name} 
                      className="img-fluid rounded w-100 shadow-sm"
                      style={{ height: "350px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-6 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge bg-brand">{selectedProduct.category || "Board Game"}</span>
                        <span className="badge bg-secondary">อายุ {selectedProduct.minAge || "ทั่วไป"}+ ปี</span>
                        <span className="badge bg-dark">👥 {selectedProduct.minPlayers}-{selectedProduct.maxPlayers} คน</span>
                      </div>
                      <h2 className="h3 fw-bold mb-3">{selectedProduct.name}</h2>
                      <div className="p-3 bg-light rounded mb-3">
                        <span className="display-6 fw-bold text-brand">{money(selectedProduct.price)}</span>
                      </div>
                      <h5 className="h6 fw-bold text-dark mb-2">รายละเอียดสินค้า</h5>
                      <p className="text-muted small" style={{ whiteSpace: "pre-line" }}>
                        {selectedProduct.description || "ไม่มีคำอธิบายเพิ่มเติม"}
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
                          setSelectedProduct(null);
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

// 🛠️ แก้ไขส่วนนี้แบบดักทุกทางเพื่อไม่ให้รูปล้นมาทับตัวหนังสือเด็ดขาด
function ProductCard({ product, addToCart, onViewProduct }) {
  return (
    <article className="product-card h-100">
      <div className="product-card-image">
        <img src={product.image || "https://placehold.co/300x200?text=No+Image"} alt={product.name} />
        <span className="product-category">{product.category || "General"}</span>
        <span className={product.stock > 0 ? "product-stock in-stock" : "product-stock out-stock"}>
          {product.stock > 0 ? `เหลือ ${product.stock}` : "สินค้าหมด"}
        </span>
      </div>
      <div className="product-card-body">
        <h3 title={product.name}>{product.name}</h3>
        <div className="product-meta">
          <span>👥 {product.minPlayers}-{product.maxPlayers} คน</span>
          <span>อายุ {product.minAge || "ทั่วไป"}+</span>
        </div>
        <div className="product-card-bottom">
          <p className="product-price">{money(product.price)}</p>
          <div className="product-actions">
            <button className="btn product-detail-button" type="button" onClick={() => onViewProduct(product)}>รายละเอียด</button>
            <button className="btn btn-boardhouse" type="button" disabled={product.stock <= 0} onClick={() => addToCart(product.id)}>
              {product.stock > 0 ? "ใส่ตะกร้า" : "หมด"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default HomeRoute;

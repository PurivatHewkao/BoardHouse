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

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section border-bottom">
        <div className="container-xxl py-5">
          <div className="row align-items-center g-5 py-lg-5">
            <div className="col-lg-7">
              <span className="badge rounded-pill text-bg-light border px-3 py-2 mb-4">University Project</span>
              <h1 className="hero-title display-1 mb-4">
                Welcome to <span className="d-block text-brand">BoardHouse</span>
              </h1>
              <p className="lead text-muted mb-4">
                ค้นหาบอร์ดเกมที่ใช่สำหรับคุณ กรองง่ายตามประเภท อายุ หรือจำนวนผู้เล่น ทอยลูกเต๋าแล้วสนุกไปด้วยกันเลย!
              </p>
            </div>
            <div className="col-lg-5 d-flex justify-content-lg-center">
              <div className="hero-art" aria-hidden="true">
                <div className="large-dice"><DiceMark /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section ค้นหาและตัวกรองทั้งหมด */}
      <section className="py-5">
        <div className="container-xxl">
          
          {/* แถวที่ 1: ค้นหาชื่อเกม & เลือกประเภทเกม */}
          <div className="row g-3 align-items-center mb-4">
            <div className="col-lg-4">
              <label className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0">ค้นหา</span>
                <input
                  className="form-control border-start-0"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ค้นหาชื่อเกมหรือหมวดหมู่..."
                />
              </label>
            </div>
            <div className="col-lg-8">
              <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                {categories.map((item) => (
                  <button
                    className={category === item ? "btn btn-category active" : "btn btn-category"}
                    key={item}
                    type="button"
                    onClick={() => setSelectedCategory(item)}
                  >
                    {item === "All" ? "ทุกประเภท" : item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* แถวที่ 2: ปุ่มกรองตามช่วงอายุผู้เล่นขั้นต่ำ */}
          <div className="row mb-3">
            <div className="col-12 d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted me-2 small fw-bold" style={{ width: "100px" }}>อายุบนกล่อง:</span>
              {ageFilters.map((age) => (
                <button
                  key={age.value}
                  type="button"
                  className={`btn btn-sm ${selectedAge === age.value ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedAge(age.value)}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* 👥 แถวที่ 3: ปุ่มกรองตามจำนวนผู้เล่น */}
          <div className="row mb-5">
            <div className="col-12 d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted me-2 small fw-bold" style={{ width: "100px" }}>จำนวนผู้เล่น:</span>
              {playerFilters.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`btn btn-sm ${selectedPlayers === p.value ? 'btn-brand text-white bg-brand' : 'btn-outline-secondary'}`}
                  style={selectedPlayers === p.value ? { backgroundColor: "var(--bs-primary)", border: "none" } : {}}
                  onClick={() => setSelectedPlayers(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* แสดงรายการการ์ดสินค้า */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
            {visibleProducts.map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} addToCart={addToCart} onViewProduct={setSelectedProduct} />
              </div>
            ))}
            {visibleProducts.length === 0 && (
              <div className="col-12 text-center text-muted py-5 card shadow-sm">
                ไม่พบสินค้าบอร์ดเกมที่ตรงตามเงื่อนไขการค้นหาของคุณในขณะนี้
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
    <article className="card product-card h-100 shadow-sm border-0 d-flex flex-column" style={{ overflow: "hidden" }}>
      
      {/* 🖼️ แก้กรอบรูปภาพ: บังคับความสูงตายตัว 200px และซ่อนทุกอย่างที่ล้นออกนอกกล่อง (overflow: "hidden") */}
      <div 
        className="product-image-container position-relative w-100" 
        style={{ 
          height: "200px", 
          maxHeight: "200px",
          overflow: "hidden", 
          background: "#f8f9fa" 
        }}
      >
        <img 
          src={product.image || "https://placehold.co/300x200?text=No+Image"} 
          alt={product.name} 
          style={{ 
            width: "100%", 
            height: "100%", 
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
            objectFit: "cover", 
            objectPosition: "center" 
          }}
        />
      </div>
      
      {/* 📝 ส่วนเนื้อหาและตัวหนังสือด้านล่าง */}
      <div className="card-body d-flex flex-column p-3 bg-white" style={{ flexGrow: 1 }}>
        
        {/* ประเภทเกม */}
        <div className="mb-2">
          <span className="badge rounded-pill bg-light border text-dark" style={{ fontSize: "0.75rem" }}>
            {product.category || "General"}
          </span>
        </div>

        {/* ชื่อเกม: มี text-truncate บังคับให้อยู่บรรทัดเดียวและตัดไข่ปลา ป้องกันชื่อยาวดันโครงสร้างพัง */}
        <h3 
          className="h6 mb-2 text-dark text-truncate fw-bold" 
          style={{ fontSize: "1.02rem", lineHeight: "1.4" }}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* ข้อมูลรายละเอียดจำกัดเนื้อหา */}
        <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
          <span>👥 {product.minPlayers}-{product.maxPlayers} คน</span>
          <span className={product.stock > 0 ? "text-success" : "text-danger"}>
            {product.stock > 0 ? `คงเหลือ ${product.stock} ชิ้น` : "สินค้าหมด"}
          </span>
        </div>

        {/* ปุ่มและราคาจะถูกดันให้อยู่แนบด้านล่างสุดเสมอ */}
        <div className="mt-auto">
          <div className="mb-3">
            <p className="price h5 mb-0 text-brand fw-bold">{money(product.price)}</p>
          </div>
          
          <div className="d-flex gap-2">
            <button className="btn btn-light border flex-fill btn-sm py-2" type="button" onClick={() => onViewProduct(product)}>
              รายละเอียด
            </button>
            <button
              className="btn btn-boardhouse flex-fill btn-sm py-2 text-white"
              type="button"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product.id)}
              style={product.stock > 0 ? {} : { backgroundColor: "#ccc", border: "none" }}
            >
              {product.stock > 0 ? "ใส่ตะกร้า" : "หมด"}
            </button>
          </div>
        </div>

      </div>
    </article>
  );
}

export default HomeRoute;

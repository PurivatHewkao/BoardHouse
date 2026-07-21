import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomeRoute from "./routes/HomeRoute.jsx";
import CartRoute from "./routes/CartRoute.jsx";
import CheckoutRoute from "./routes/CheckoutRoute.jsx";
import OrdersRoute from "./routes/OrdersRoute.jsx";
import { LoginRoute, RegisterRoute } from "./routes/AuthRoutes.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import ProfileRoute from "./routes/ProfileRoute.jsx";
import {
  addCartItem,
  clearCart,
  getInitialCart,
  removeCartItem,
  saveCart,
  updateCartQuantity,
} from "./utils/cartStorage.js";
import { createOrder } from "./utils/orderStorage.js";
import {
  getProducts,
  productsUpdatedEvent,
  reduceProductStock,
  saveProducts,
} from "./utils/productStorage.js";
import { addAddressToUser, getCurrentUser, logoutUser, setCurrentUser } from "./utils/userStorage.js";
import { canAccessAdmin, canAccessPage, isAdmin } from "./utils/roles.js";

function App() {
  // แอดมินเปิดแอปมาให้เข้าหน้าหลังบ้านเลย ลูกค้า/ผู้เยี่ยมชมเริ่มที่หน้า Home
  const [page, setPage] = useState(() => (isAdmin(getCurrentUser()) ? "Admin" : "Home"));
  const [products, setProducts] = useState(getProducts);
  const [cart, setCart] = useState(getInitialCart);
  const [currentUser, updateCurrentUser] = useState(getCurrentUser);
  const [homeCategory, setHomeCategory] = useState("All");

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    function syncProducts(event) {
      setProducts(Array.isArray(event.detail) ? event.detail : getProducts());
    }

    window.addEventListener(productsUpdatedEvent, syncProducts);
    return () => window.removeEventListener(productsUpdatedEvent, syncProducts);
  }, []);

  function handleCurrentUser(user) {
    updateCurrentUser(user);
    setCurrentUser(user);
    setPage("Home");
  }

  function handleLogout() {
    logoutUser();
    updateCurrentUser(null);
    setPage("Login");
  }

  function handleShopCategory(category) {
    setHomeCategory(category);
    setPage("Home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // บันทึกที่อยู่จัดส่งใหม่ที่กรอกตอนจ่ายเงินลงในโปรไฟล์ผู้ใช้ เพื่อให้เลือกใช้ได้ในครั้งถัดไป
  function saveAddressForUser(address) {
    if (!currentUser) {
      return null;
    }

    const updatedUser = addAddressToUser(currentUser.id, address);

    if (updatedUser) {
      updateCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
    }

    return updatedUser;
  }

  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item) => item.product);

  function addToCart(productId) {
    const product = products.find((item) => item.id === productId);
    const cartItem = cart.find((item) => item.productId === productId);

    if (!product || product.stock <= 0) {
      alert("สินค้านี้หมดสต็อกแล้ว");
      return;
    }

    if ((cartItem?.quantity || 0) >= product.stock) {
      alert(`สินค้า "${product.name}" ในตะกร้าครบตามจำนวนที่มีในสต็อกแล้ว`);
      return;
    }

    setCart((items) => addCartItem(items, productId, products));
    alert(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  }

  function changeQuantity(productId, amount) {
    setCart((items) => updateCartQuantity(items, productId, amount, products));
  }

  function removeItem(productId) {
    setCart((items) => removeCartItem(items, productId));
  }

  function goToCheckout() {
    if (cartItems.length === 0) {
      return;
    }

    setPage("Checkout");
  }

  function placeOrder({ paymentMethod, shippingAddress }) {
    if (cartItems.length === 0) {
      return;
    }

    createOrder({ user: currentUser, cartItems, paymentMethod, shippingAddress });
    // ตัด stock เพียงครั้งเดียวเมื่อยืนยันคำสั่งซื้อสำเร็จ
    const nextProducts = reduceProductStock(products, cartItems);
    saveProducts(nextProducts);
    setCart(clearCart());
    setPage("Orders");
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (page === "Checkout" && cartItems.length === 0) {
      setPage("Cart");
    }
  }, [page, cartItems.length]);

  useEffect(() => {
    if (page === "Profile" && !currentUser) {
      setPage("Login");
    }
  }, [page, currentUser]);

  // กันไม่ให้แอดมินหลุดเข้าหน้าบ้าน (Home/Cart/Orders/Profile/Checkout) — เด้งกลับหน้า Admin
  useEffect(() => {
    if (currentUser && !canAccessPage(currentUser, page)) {
      setPage(isAdmin(currentUser) ? "Admin" : "Home");
    }
  }, [page, currentUser]);

  return (
    <div className="app-shell">
      <Header page={page} setPage={setPage} currentUser={currentUser} onLogout={handleLogout} />
      <main>
        {page === "Home" && (
          <HomeRoute
            products={products}
            addToCart={addToCart}
            selectedCategory={homeCategory}
            setSelectedCategory={setHomeCategory}
          />
        )}
        {page === "Cart" && (
          <CartRoute
            items={cartItems}
            subtotal={subtotal}
            changeQuantity={changeQuantity}
            removeItem={removeItem}
            checkout={goToCheckout}
          />
        )}
        {page === "Checkout" && (
          <CheckoutRoute
            items={cartItems}
            subtotal={subtotal}
            currentUser={currentUser}
            placeOrder={placeOrder}
            setPage={setPage}
            saveAddress={saveAddressForUser}
          />
        )}
        {page === "Orders" && <OrdersRoute currentUser={currentUser} />}
        {page === "Profile" && (
          <ProfileRoute
            currentUser={currentUser}
            setCurrentUser={updateCurrentUser}
            setPage={setPage}
          />
        )}
        {page === "Login" && <LoginRoute setPage={setPage} setCurrentUser={handleCurrentUser} />}
        {page === "Register" && <RegisterRoute setPage={setPage} setCurrentUser={handleCurrentUser} />}
        {page === "Admin" && canAccessAdmin(currentUser) && (
          <AdminRoute currentUser={currentUser} setCurrentUser={updateCurrentUser} />
        )}
      </main>
      <Footer onShopCategory={handleShopCategory} selectedCategory={homeCategory} />
    </div>
  );
}

export default App;

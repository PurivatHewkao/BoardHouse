import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomeRoute from "./routes/HomeRoute.jsx";
import CartRoute from "./routes/CartRoute.jsx";
import CheckoutRoute from "./routes/CheckoutRoute.jsx";
import OrdersRoute from "./routes/OrdersRoute.jsx";
import { LoginRoute, RegisterRoute } from "./routes/AuthRoutes.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import {
  addCartItem,
  clearCart,
  getInitialCart,
  removeCartItem,
  saveCart,
  updateCartQuantity,
} from "./utils/cartStorage.js";
import { createOrder } from "./utils/orderStorage.js";
import { getProducts, reduceProductStock, saveProducts } from "./utils/productStorage.js";
import { getCurrentUser, logoutUser, setCurrentUser } from "./utils/userStorage.js";
import { canAccessAdmin } from "./utils/roles.js";

function App() {
  const [page, setPage] = useState("Home");
  const [products, setProducts] = useState(getProducts);
  const [cart, setCart] = useState(getInitialCart);
  const [currentUser, updateCurrentUser] = useState(getCurrentUser);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

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

  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item) => item.product);

  function addToCart(productId) {
    const product = products.find((item) => item.id === productId);

    if (!product || product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setCart((items) => addCartItem(items, productId, products));

    const nextProducts = products.map((item) =>
      item.id === productId ? { ...item, stock: Math.max(0, item.stock - 1) } : item
    );
    saveProducts(nextProducts);
    setProducts(nextProducts);

    alert(`Added "${product.name}" to your cart.`);
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
    const nextProducts = reduceProductStock(products, cartItems);
    saveProducts(nextProducts);
    setProducts(nextProducts);
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
    if (page === "Admin" && !canAccessAdmin(currentUser)) {
      setPage("Home");
    }
  }, [page, currentUser]);

  return (
    <div className="app-shell">
      <Header page={page} setPage={setPage} currentUser={currentUser} onLogout={handleLogout} />
      <main>
        {page === "Home" && <HomeRoute products={products} addToCart={addToCart} />}
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
          />
        )}
        {page === "Orders" && <OrdersRoute currentUser={currentUser} />}
        {page === "Login" && <LoginRoute setPage={setPage} setCurrentUser={handleCurrentUser} />}
        {page === "Register" && <RegisterRoute setPage={setPage} setCurrentUser={handleCurrentUser} />}
        {page === "Admin" && canAccessAdmin(currentUser) && <AdminRoute currentUser={currentUser} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;

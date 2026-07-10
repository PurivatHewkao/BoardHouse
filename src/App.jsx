import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomeRoute from "./routes/HomeRoute.jsx";
import CartRoute from "./routes/CartRoute.jsx";
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
import { seedStorage } from "./utils/localStorageDb.js";
import { createOrder } from "./utils/orderStorage.js";
import { getProducts, reduceProductStock, saveProducts } from "./utils/productStorage.js";
import { getCurrentUser, setCurrentUser } from "./utils/userStorage.js";

function App() {
  const [page, setPage] = useState("Home");
  const [products, setProducts] = useState(getProducts);
  const [cart, setCart] = useState(getInitialCart);
  const [currentUser, updateCurrentUser] = useState(getCurrentUser);

  useEffect(() => {
    seedStorage();
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  function handleCurrentUser(user) {
    updateCurrentUser(user);
    setCurrentUser(user);
  }

  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item) => item.product);

  function addToCart(productId) {
    setCart((items) => addCartItem(items, productId, products));
  }

  function changeQuantity(productId, amount) {
    setCart((items) => updateCartQuantity(items, productId, amount, products));
  }

  function removeItem(productId) {
    setCart((items) => removeCartItem(items, productId));
  }

  function checkout() {
    if (cartItems.length === 0) {
      return;
    }

    createOrder({ user: currentUser, cartItems });
    const nextProducts = reduceProductStock(products, cartItems);
    saveProducts(nextProducts);
    setProducts(nextProducts);
    setCart(clearCart());
    setPage("Orders");
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="app-shell">
      <Header page={page} setPage={setPage} />
      <main>
        {page === "Home" && <HomeRoute products={products} addToCart={addToCart} />}
        {page === "Cart" && (
          <CartRoute
            items={cartItems}
            subtotal={subtotal}
            changeQuantity={changeQuantity}
            removeItem={removeItem}
            checkout={checkout}
          />
        )}
        {page === "Orders" && <OrdersRoute currentUser={currentUser} />}
        {page === "Login" && <LoginRoute setPage={setPage} setCurrentUser={handleCurrentUser} />}
        {page === "Register" && <RegisterRoute setPage={setPage} setCurrentUser={handleCurrentUser} />}
        {page === "Admin" && <AdminRoute />}
      </main>
      <Footer />
    </div>
  );
}

export default App;

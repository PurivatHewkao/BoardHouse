import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { products } from "./data/products.js";
import HomeRoute from "./routes/HomeRoute.jsx";
import CartRoute from "./routes/CartRoute.jsx";
import OrdersRoute from "./routes/OrdersRoute.jsx";
import { LoginRoute, RegisterRoute } from "./routes/AuthRoutes.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import { getInitialCart, saveCart } from "./utils/cartStorage.js";

function App() {
  const [page, setPage] = useState("Home");
  const [cart, setCart] = useState(getInitialCart);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item) => item.product);

  function addToCart(productId) {
    setCart((items) => {
      const existing = items.find((item) => item.productId === productId);

      if (existing) {
        return items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...items, { productId, quantity: 1 }];
    });
  }

  function changeQuantity(productId, amount) {
    setCart((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  }

  function removeItem(productId) {
    setCart((items) => items.filter((item) => item.productId !== productId));
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Header page={page} setPage={setPage} />
      <main className="flex-1">
        {page === "Home" && <HomeRoute addToCart={addToCart} />}
        {page === "Cart" && (
          <CartRoute
            items={cartItems}
            subtotal={subtotal}
            changeQuantity={changeQuantity}
            removeItem={removeItem}
          />
        )}
        {page === "Orders" && <OrdersRoute />}
        {page === "Login" && <LoginRoute setPage={setPage} />}
        {page === "Register" && <RegisterRoute setPage={setPage} />}
        {page === "Admin" && <AdminRoute />}
      </main>
      <Footer />
    </div>
  );
}

export default App;

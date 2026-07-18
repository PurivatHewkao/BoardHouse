import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { seedStorage } from "./utils/localStorageDb.js";
import "./styles.css";

// ต้อง seed ให้เสร็จก่อน render เพราะ state ตั้งต้นใน App อ่าน localStorage ทันทีตอน useState
seedStorage();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React, { useState } from "react";
import { loginUser, registerUser } from "../utils/userStorage.js";
import { getAccessLabel, isAdmin } from "../utils/roles.js";
import { resetStorage } from "../utils/localStorageDb.js";
import { users as seedUsers } from "../data/seedData.js";

// ดึงบัญชีเดโมจาก seed data ตรงๆ เวลามีคนแก้อีเมล/รหัสใน seedData.js หน้านี้จะตามให้เอง
const demoAccounts = seedUsers.map((user) => ({
  role: user.role,
  label: getAccessLabel(user),
  email: user.email,
  password: user.password,
}));

export function LoginRoute({ setPage, setCurrentUser }) {
  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("password");
  const [message, setMessage] = useState("");

  function handleFillDemoAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setMessage(`Filled in the ${account.label} account. Press Login to continue.`);
  }

  function handleLogin() {
    const user = loginUser(email, password);

    if (!user) {
      setMessage("Email or password is incorrect.");
      return;
    }

    setCurrentUser(user);
    setMessage(`Logged in as ${user.name}.`);
    setPage(isAdmin(user) ? "Admin" : "Home");
  }

  async function handleResetData() {
    if (!confirm("Reset mock data and reload the app?")) {
      return;
    }

    await resetStorage();
    window.location.reload();
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back to BoardHouse."
      action={
        <button className="btn btn-outline-danger" type="button" onClick={handleResetData}>
          Reset Mock Data
        </button>
      }
    >
      <div className="demo-accounts vstack gap-2">
        <p className="mb-0 small fw-semibold text-muted">Demo accounts (click to fill in)</p>
        {demoAccounts.map((account) => (
          <button
            key={account.role}
            className="btn btn-outline-secondary btn-sm text-start"
            type="button"
            onClick={() => handleFillDemoAccount(account)}
          >
            <span className="fw-semibold">{account.label}</span>
            <span className="d-block small opacity-75">
              {account.email} / {account.password}
            </span>
          </button>
        ))}
      </div>
      <label className="form-label">
        Email or Username
        <input
          className="form-control form-control-lg mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="form-label">
        Password
        <input
          className="form-control form-control-lg mt-2"
          value={password}
          type="password"
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {message && <p className="mb-0 text-center text-muted">{message}</p>}
      <button className="btn btn-boardhouse btn-lg w-100" type="button" onClick={handleLogin}>
        Login
      </button>
      <p className="mb-0 text-center text-muted">
        No account?{" "}
        <button className="btn btn-link p-0 align-baseline link-boardhouse" type="button" onClick={() => setPage("Register")}>
          Register
        </button>
      </p>
    </AuthLayout>
  );
}

export function RegisterRoute({ setPage, setCurrentUser }) {
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("new-user@example.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister() {
    if (!name || !email || !password) {
      setMessage("Please fill in name, email, and password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const result = registerUser({ name, email, password });
    setMessage(result.message);

    if (result.ok) {
      setCurrentUser(result.user);
      setPage("Home");
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join the BoardHouse community.">
      <label className="form-label">
        Name
        <input
          className="form-control form-control-lg mt-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="form-label">
        Email / Username
        <input
          className="form-control form-control-lg mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="form-label">
        Password
        <input
          className="form-control form-control-lg mt-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="form-label">
        Confirm Password
        <input
          className="form-control form-control-lg mt-2"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>
      {message && <p className="mb-0 text-center text-muted">{message}</p>}
      <button className="btn btn-boardhouse btn-lg w-100" type="button" onClick={handleRegister}>
        Register
      </button>
      <p className="mb-0 text-center text-muted">
        Already have an account?{" "}
        <button className="btn btn-link p-0 align-baseline link-boardhouse" type="button" onClick={() => setPage("Login")}>
          Login
        </button>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, action, children }) {
  return (
    <section className="py-5">
      <div className="container">
        <div className="auth-wrap mx-auto">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-3 mb-4">
            <div>
              <h1 className="page-title mb-2">{title}</h1>
              <p className="lead text-muted mb-0">{subtitle}</p>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
          <form className="card shadow-sm p-4 vstack gap-3">{children}</form>
        </div>
      </div>
    </section>
  );
}

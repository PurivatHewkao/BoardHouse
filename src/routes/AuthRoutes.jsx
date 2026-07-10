import React from "react";

export function LoginRoute({ setPage }) {
  return (
    <AuthLayout title="Login" subtitle="Welcome back to BoardHouse.">
      <label className="form-label">
        Email or Username
        <input className="form-control form-control-lg mt-2" defaultValue="you@example.com" />
      </label>
      <label className="form-label">
        Password
        <input className="form-control form-control-lg mt-2" defaultValue="password" type="password" />
      </label>
      <button className="btn btn-boardhouse btn-lg w-100" type="button">
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

export function RegisterRoute({ setPage }) {
  return (
    <AuthLayout title="Create Account" subtitle="Join the BoardHouse community.">
      <label className="form-label">
        Name
        <input className="form-control form-control-lg mt-2" defaultValue="Jane Doe" />
      </label>
      <label className="form-label">
        Email / Username
        <input className="form-control form-control-lg mt-2" defaultValue="you@example.com" />
      </label>
      <label className="form-label">
        Password
        <input className="form-control form-control-lg mt-2" type="password" />
      </label>
      <label className="form-label">
        Confirm Password
        <input className="form-control form-control-lg mt-2" type="password" />
      </label>
      <button className="btn btn-boardhouse btn-lg w-100" type="button">
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

function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="py-5">
      <div className="container">
        <div className="auth-wrap mx-auto">
          <h1 className="page-title mb-2">{title}</h1>
          <p className="lead text-muted mb-4">{subtitle}</p>
          <form className="card shadow-sm p-4 vstack gap-3">{children}</form>
        </div>
      </div>
    </section>
  );
}

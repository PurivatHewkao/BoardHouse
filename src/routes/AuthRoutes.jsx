import React from "react";

export function LoginRoute({ setPage }) {
  return (
    <AuthLayout title="Login" subtitle="Welcome back to BoardHouse.">
      <label className="grid gap-2 text-lg font-bold">
        Email or Username
        <input className="min-h-14 rounded-xl border border-line bg-surface px-4 text-lg text-muted shadow-board outline-none focus:border-brand" defaultValue="you@example.com" />
      </label>
      <label className="grid gap-2 text-lg font-bold">
        Password
        <input className="min-h-14 rounded-xl border border-line bg-surface px-4 text-lg text-muted shadow-board outline-none focus:border-brand" defaultValue="password" type="password" />
      </label>
      <button className="w-full rounded-xl border border-brand bg-brand px-6 py-4 text-lg font-extrabold text-white shadow-board transition hover:bg-brand-dark" type="button">
        Login
      </button>
      <p className="text-center text-muted">
        No account?{" "}
        <button className="font-bold text-brand" type="button" onClick={() => setPage("Register")}>
          Register
        </button>
      </p>
    </AuthLayout>
  );
}

export function RegisterRoute({ setPage }) {
  return (
    <AuthLayout title="Create Account" subtitle="Join the BoardHouse community.">
      <label className="grid gap-2 text-lg font-bold">
        Name
        <input className="min-h-14 rounded-xl border border-line bg-surface px-4 text-lg text-muted shadow-board outline-none focus:border-brand" defaultValue="Jane Doe" />
      </label>
      <label className="grid gap-2 text-lg font-bold">
        Email / Username
        <input className="min-h-14 rounded-xl border border-line bg-surface px-4 text-lg text-muted shadow-board outline-none focus:border-brand" defaultValue="you@example.com" />
      </label>
      <label className="grid gap-2 text-lg font-bold">
        Password
        <input className="min-h-14 rounded-xl border border-line bg-surface px-4 text-lg text-muted shadow-board outline-none focus:border-brand" type="password" />
      </label>
      <label className="grid gap-2 text-lg font-bold">
        Confirm Password
        <input className="min-h-14 rounded-xl border border-line bg-surface px-4 text-lg text-muted shadow-board outline-none focus:border-brand" type="password" />
      </label>
      <button className="w-full rounded-xl border border-brand bg-brand px-6 py-4 text-lg font-extrabold text-white shadow-board transition hover:bg-brand-dark" type="button">
        Register
      </button>
      <p className="text-center text-muted">
        Already have an account?{" "}
        <button className="font-bold text-brand" type="button" onClick={() => setPage("Login")}>
          Login
        </button>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="py-12 xl:py-16">
      <div className="mx-auto max-w-[1680px] px-4 xl:px-12">
        <div className="mx-auto max-w-[624px]">
          <h1 className="mb-2 font-serif text-5xl font-bold">{title}</h1>
          <p className="mb-8 text-xl text-muted">{subtitle}</p>
          <form className="grid gap-5 rounded-2xl border border-line bg-white p-6 shadow-board md:p-8">{children}</form>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Basic query param parsing to avoid needing Suspense boundary
    const search = window.location.search;
    if (search.includes("verified=true")) {
      setSuccess("Your email has been successfully verified! You can now sign in.");
    } else if (search.includes("registered=1")) {
      setSuccess("Account created successfully. Please check your email to verify your account.");
    } else if (search.includes("reset=true")) {
      setSuccess("Your password has been successfully reset! You can now sign in.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        // This will capture our "Please verify your email address to log in." custom error
        setError(res.error);
      }
    } else {
      router.push("/directory");
    }
  }

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      {/* Logo */}
      <Link href="/" className="auth-logo">
        <span className="auth-logo-icon">⚡</span>
        <span className="auth-logo-text">SkillSync</span>
      </Link>

      <div className="auth-card glass animate-fade-in-up">
        <div className="auth-card-header">
          <h1>Welcome back 👋</h1>
          <p>Sign in to find your teammates</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {success && (
            <div className="auth-success" style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)", color: "#6ee7b7", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✅</span> {success}
            </div>
          )}

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "13px" }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link href="/register">Create one free</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          position: relative;
          background: var(--color-bg-primary);
        }

        .auth-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .auth-blob-1 {
          width: 400px; height: 400px;
          background: rgba(124, 58, 237, 0.15);
          top: -100px; left: -100px;
        }
        .auth-blob-2 {
          width: 300px; height: 300px;
          background: rgba(59, 130, 246, 0.12);
          bottom: -50px; right: -50px;
        }

        .auth-logo {
          position: fixed;
          top: 24px; left: 32px;
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          z-index: 10;
        }
        .auth-logo-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .auth-logo-text {
          font-weight: 800;
          font-size: 1.1rem;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: var(--space-6);
          position: relative;
          z-index: 1;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .auth-card-header {
          margin-bottom: 28px;
        }
        .auth-card-header h1 {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .auth-card-header p {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-error {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #fca5a5;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-switch {
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .auth-switch a {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-switch a:hover { text-decoration: underline; }

        .spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

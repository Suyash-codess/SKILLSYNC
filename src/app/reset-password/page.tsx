"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Avoid Suspense issues by using window.location
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("token");
    if (t) {
      setToken(t);
    } else {
      setError("Invalid or missing reset token.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing reset token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        router.push("/login?reset=true");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-card glass animate-fade-in-up">
      <div className="auth-card-header">
        <h1>Set New Password 🔑</h1>
        <p>Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="input-label" htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="Min 8 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={!token}
          />
        </div>

        <div className="form-group">
          <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="input-field"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={!token}
          />
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !token}
          style={{ width: "100%", justifyContent: "center", padding: "13px" }}
        >
          {loading ? <span className="spinner" /> : "Reset Password →"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <Link href="/" className="auth-logo">
        <span className="auth-logo-icon">⚡</span>
        <span className="auth-logo-text">SkillSync</span>
      </Link>

      <Suspense fallback={<div className="spinner" style={{ width: 40, height: 40 }} />}>
        <ResetPasswordForm />
      </Suspense>

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
        .auth-blob { position: absolute; border-radius: 50%; filter: blur(80px); }
        .auth-blob-1 { width: 400px; height: 400px; background: rgba(124, 58, 237, 0.15); top: -100px; left: -100px; }
        .auth-blob-2 { width: 300px; height: 300px; background: rgba(59, 130, 246, 0.12); bottom: -50px; right: -50px; }

        .auth-logo {
          position: fixed; top: 24px; left: 32px;
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; z-index: 10;
        }
        .auth-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .auth-logo-text {
          font-weight: 800; font-size: 1.1rem;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .auth-card {
          width: 100%; max-width: 440px; padding: var(--space-6); position: relative; z-index: 1;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .auth-card-header { margin-bottom: 28px; }
        .auth-card-header h1 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; }
        .auth-card-header p { color: var(--color-text-secondary); font-size: 0.9rem; }

        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }

        .auth-error {
          padding: 12px 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md); color: #fca5a5; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
        }

        .spinner {
          display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

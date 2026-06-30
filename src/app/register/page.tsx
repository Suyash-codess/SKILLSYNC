"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "PhD"];

// ─── Animated background orbs ────────────────────────────────────────────────
function AnimatedOrbs() {
  return (
    <div className="orbs-wrapper" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </div>
  );
}

// ─── Floating skill tags on the left panel ───────────────────────────────────
const FLOAT_TAGS = [
  { label: "React", cat: "frontend",  x: "12%",  y: "18%", delay: "0s"   },
  { label: "PyTorch", cat: "ai",      x: "62%",  y: "12%", delay: "0.4s" },
  { label: "Docker",  cat: "devops",  x: "8%",   y: "55%", delay: "0.8s" },
  { label: "Figma",   cat: "design",  x: "68%",  y: "42%", delay: "0.2s" },
  { label: "Node.js", cat: "backend", x: "28%",  y: "78%", delay: "1s"   },
  { label: "Flutter", cat: "mobile",  x: "72%",  y: "72%", delay: "0.6s" },
  { label: "Next.js", cat: "frontend",x: "40%",  y: "22%", delay: "1.2s" },
  { label: "AWS",     cat: "devops",  x: "18%",  y: "85%", delay: "0.3s" },
];

const CAT_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  frontend: { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.35)",  color: "#93c5fd" },
  backend:  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.35)",  color: "#6ee7b7" },
  ai:       { bg: "rgba(124,58,237,0.15)",  border: "rgba(124,58,237,0.35)",  color: "#c4b5fd" },
  devops:   { bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.35)",  color: "#fcd34d" },
  mobile:   { bg: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.35)",  color: "#f9a8d4" },
  design:   { bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.35)",  color: "#fdba74" },
};

function FloatingTags() {
  return (
    <>
      {FLOAT_TAGS.map(({ label, cat, x, y, delay }) => {
        const c = CAT_COLORS[cat];
        return (
          <div
            key={label}
            className="float-tag"
            style={{
              left: x, top: y,
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.color,
              animationDelay: delay,
            }}
          >
            {label}
          </div>
        );
      })}
    </>
  );
}

// ─── Stat counter on the left panel ──────────────────────────────────────────
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-item">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ─── Input field with icon ────────────────────────────────────────────────────
function InputField({
  id, type, label, placeholder, value, onChange, icon, error, autoComplete,
}: {
  id: string; type: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; icon: string;
  error?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className={`field-wrap ${error ? "field-error" : ""}`}>
        <span className="field-icon">{icon}</span>
        <input
          id={id}
          type={inputType}
          className="field-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        {isPassword && (
          <button
            type="button"
            className="field-eye"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && <p className="field-err-msg">{error}</p>}
    </div>
  );
}

// ─── Select field with icon ──────────────────────────────────────────────────
function SelectField({
  id, label, value, onChange, icon, error, options
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; icon: string;
  error?: string; options: string[];
}) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className={`field-wrap ${error ? "field-error" : ""}`}>
        <span className="field-icon">{icon}</span>
        <select
          id={id}
          className="field-input select-styled"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        >
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ color: "#000" }}>{opt}</option>
          ))}
        </select>
      </div>
      {error && <p className="field-err-msg">{error}</p>}
    </div>
  );
}

// ─── Main Register Page ──────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    college: "", major: "", year: "3rd Year",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: [] }));
  }

  function fe(field: string) {
    return fieldErrors[field]?.[0];
  }

  // Subtle mouse-parallax on left panel
  const leftRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;
    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = panel.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 12;
      const y = ((e.clientY - top)  / height - 0.5) * 12;
      panel.style.setProperty("--mx", `${x}px`);
      panel.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      if (data.issues) {
        setFieldErrors(data.issues);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
      return;
    }

    setLoading(false);
    setSuccess(true);
  }

  return (
    <>
      <AnimatedOrbs />

      <div className="login-layout">

        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <div className="left-panel" ref={leftRef}>
          <div className="left-inner">
            {/* Logo */}
            <Link href="/" className="logo">
              <div className="logo-icon">⚡</div>
              <span className="logo-text">SkillSync</span>
            </Link>

            {/* Floating tags */}
            <div className="tags-scene">
              <FloatingTags />

              {/* Center graphic */}
              <div className="center-graphic">
                <div className="graphic-ring ring-outer">
                  <div className="ring-dot ring-dot-1" />
                </div>
                <div className="graphic-ring ring-mid">
                  <div className="ring-dot ring-dot-2" />
                </div>
                <div className="graphic-ring ring-inner" />
                <div className="graphic-core">⚡</div>
              </div>
            </div>

            {/* Headline */}
            <div className="left-copy">
              <h1 className="left-headline">
                Your next<br />
                <span className="left-headline-accent">dream team</span><br />
                is one click away.
              </h1>
              <p className="left-sub">
                Connect with engineers who have exactly the skills your project needs.
              </p>
            </div>

            {/* Stats */}
            <div className="stats-row">
              <StatItem value="500+" label="Students" />
              <div className="stats-divider" />
              <StatItem value="120+" label="Teams Formed" />
              <div className="stats-divider" />
              <StatItem value="25+"  label="Colleges" />
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────── */}
        <div className="right-panel">
          <div className={`form-card glass ${shake ? "shake" : ""}`}>
            {/* Header */}
            <div className="form-header">
              <div className="form-avatar">🚀</div>
              <h2 className="form-title">Create your account</h2>
              <p className="form-subtitle">Join hundreds of students finding great teammates</p>
            </div>

            {success ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 12 }}>
                  Check your email
                </h2>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: 30, lineHeight: 1.6 }}>
                  We've sent a verification link to <strong>{form.email}</strong>.<br />
                  Please check your inbox (and spam folder) to activate your account.
                </p>
                <Link href="/login" className="btn-primary" style={{ display: "inline-block", padding: "12px 24px" }}>
                  Go to Login →
                </Link>
              </div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="form-body" noValidate>
                  
                  <div className="form-row">
                    <InputField
                      id="name" type="text" label="Full Name" placeholder="Priya Sharma"
                      value={form.name} onChange={(v) => set("name", v)}
                      icon="👤" error={fe("name")} autoComplete="name"
                    />
                    <SelectField
                      id="year" label="Year" options={YEARS}
                      value={form.year} onChange={(v) => set("year", v)}
                      icon="🎓" error={fe("year")}
                    />
                  </div>

                  <InputField
                    id="email" type="email" label="College Email" placeholder="you@college.edu"
                    value={form.email} onChange={(v) => set("email", v)}
                    icon="✉️" error={fe("email")} autoComplete="email"
                  />

                  <div className="form-row">
                    <InputField
                      id="college" type="text" label="College" placeholder="IIT Bombay"
                      value={form.college} onChange={(v) => set("college", v)}
                      icon="🏫" error={fe("college")}
                    />
                    <InputField
                      id="major" type="text" label="Major / Branch" placeholder="Computer Science"
                      value={form.major} onChange={(v) => set("major", v)}
                      icon="📚" error={fe("major")}
                    />
                  </div>

                  <InputField
                    id="password" type="password" label="Password" placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password} onChange={(v) => set("password", v)}
                    icon="🔑" error={fe("password")} autoComplete="new-password"
                  />

                  {/* Error banner */}
                  {error && (
                    <div className="error-banner">
                      <span className="error-icon">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="submit-spinner" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <span className="submit-arrow">→</span>
                      </>
                    )}
                  </button>
                  
                  <p className="privacy-note">
                    🔐 By registering, you agree to our privacy policy. Your contact details are
                    protected and only shared upon mutual connection.
                  </p>
                </form>

                {/* Divider */}
                <div className="or-divider">
                  <span className="or-line" />
                  <span className="or-text">Already have an account?</span>
                  <span className="or-line" />
                </div>

                {/* Login link */}
                <Link href="/login" className="register-link">
                  Sign in to your account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ALL STYLES ───────────────────────────────────────────── */}
      <style>{`
        /* ── Layout ─────────────────────────────── */
        .login-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        /* ── Global animated orbs ───────────────── */
        .orbs-wrapper {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.6;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%);
          top: -150px; left: -100px;
          animation: orbFloat1 12s ease-in-out infinite;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%);
          bottom: -100px; left: 20%;
          animation: orbFloat2 15s ease-in-out infinite;
        }
        .orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%);
          top: 30%; right: 10%;
          animation: orbFloat3 10s ease-in-out infinite;
        }
        .orb-4 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
          bottom: 10%; right: 5%;
          animation: orbFloat1 18s ease-in-out infinite reverse;
        }

        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-30px) scale(1.05); }
          66%      { transform: translate(-20px,20px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-30px,40px) scale(1.08); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(20px,-25px); }
        }

        /* ── Left panel ─────────────────────────── */
        .left-panel {
          flex: 1;
          display: flex;
          align-items: stretch;
          position: relative;
          overflow: hidden;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg-primary);
        }
        .left-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 40px 48px;
          position: relative;
          transform: translate(var(--mx, 0px), var(--my, 0px));
          transition: transform 0.1s ease-out;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          z-index: 2;
        }
        .logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 24px rgba(124,58,237,0.5);
        }
        .logo-text {
          font-weight: 800;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Tags scene */
        .tags-scene {
          flex: 1;
          position: relative;
          margin: 20px 0;
        }

        .float-tag {
          position: absolute;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 700;
          backdrop-filter: blur(12px);
          animation: tagFloat 4s ease-in-out infinite;
          white-space: nowrap;
          cursor: default;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          z-index: 2;
        }
        .float-tag:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
        }

        @keyframes tagFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        /* Center graphic */
        .center-graphic {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .graphic-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(124,58,237,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ring-outer { width: 220px; height: 220px; animation: spin 25s linear infinite; }
        .ring-mid   { width: 160px; height: 160px; animation: spin 18s linear infinite reverse; }
        .ring-inner { width: 100px; height: 100px; animation: spin 12s linear infinite; }

        .ring-dot {
          position: absolute;
          width: 10px; height: 10px;
          border-radius: 50%;
          top: -5px; left: 50%;
          margin-left: -5px;
        }
        .ring-dot-1 { background: #a78bfa; box-shadow: 0 0 12px #a78bfa; }
        .ring-dot-2 { background: #60a5fa; box-shadow: 0 0 12px #60a5fa; }

        .graphic-core {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3));
          border: 1px solid rgba(124,58,237,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 40px rgba(124,58,237,0.3);
          z-index: 1;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Left copy */
        .left-copy { z-index: 2; }
        .left-headline {
          font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
          color: var(--color-text-primary);
        }
        .left-headline-accent {
          background: var(--headline-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-sub {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          max-width: 360px;
        }

        /* Stats */
        .stats-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-top: var(--space-6);
          padding: var(--space-3) var(--space-4);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(12px);
          z-index: 2;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .stat-value {
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin-top: 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stats-divider {
          width: 1px;
          height: 32px;
          background: var(--color-border);
        }

        /* ── Right panel ────────────────────────── */
        .right-panel {
          width: 580px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) var(--space-5);
          position: relative;
          overflow-y: auto;
          background: var(--color-bg-primary);
        }

        /* Form card */
        .form-card {
          width: 100%;
          max-width: 500px;
          padding: 36px 40px 30px;
          border-radius: 24px;
          background: var(--color-bg-card) !important;
          border: 1px solid var(--color-border) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .form-card:hover {
          box-shadow: 0 14px 40px rgba(0,0,0,0.08) !important;
        }

        /* Form header */
        .form-header { text-align: center; margin-bottom: 24px; }
        .form-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2));
          border: 1px solid rgba(124,58,237,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          margin: 0 auto 16px;
          box-shadow: 0 0 24px rgba(124,58,237,0.2);
          animation: avatarPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        @keyframes avatarPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .form-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--color-text-primary);
          margin-bottom: 6px;
        }
        .form-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        /* Form body */
        .form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Field */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .field-wrap {
          display: flex;
          align-items: center;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .field-wrap:focus-within {
          border-color: var(--color-accent);
          background: var(--color-bg-card);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }
        .field-wrap.field-error {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .field-icon {
          padding: 0 12px 0 14px;
          font-size: 16px;
          opacity: 0.7;
          flex-shrink: 0;
        }
        .field-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-primary);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          padding: 12px 0;
        }
        .select-styled {
          appearance: none;
          cursor: pointer;
        }
        .field-input::placeholder { color: var(--color-text-muted); }
        .field-eye {
          padding: 0 14px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.6;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .field-eye:hover { opacity: 1; }
        .field-err-msg {
          font-size: 0.75rem;
          color: #f87171;
          margin-top: 2px;
        }

        /* Error banner */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.85rem;
          animation: slideIn 0.3s ease;
        }
        .error-icon { font-size: 16px; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Submit button */
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-top: 4px;
          box-shadow: 0 4px 24px rgba(124,58,237,0.45);
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 36px rgba(124,58,237,0.65);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .submit-arrow {
          font-size: 1.1rem;
          transition: transform 0.2s ease;
        }
        .submit-btn:hover .submit-arrow { transform: translateX(4px); }

        .submit-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* OR divider */
        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0 14px;
        }
        .or-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(124,58,237,0.25), transparent);
        }
        .or-text {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        /* Register link */
        .register-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(124,58,237,0.25);
          color: #a78bfa;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.25s ease;
          background: rgba(124,58,237,0.04);
        }
        .register-link:hover {
          background: rgba(124,58,237,0.12);
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 20px rgba(124,58,237,0.15);
          transform: translateY(-1px);
        }

        /* Privacy note */
        .privacy-note {
          text-align: center;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin-top: 10px;
          line-height: 1.5;
        }

        /* Shake animation on error */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px);  }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px);  }
        }
        .shake { animation: shake 0.5s ease; }

        /* ── Responsive ─────────────────────────── */
        @media (max-width: 960px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100%;
            min-height: 100vh;
            padding: 24px 20px;
          }
          .form-card { padding: 36px 28px 30px; }
          .form-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .form-card { padding: 28px 20px 24px; }
          .form-title { font-size: 1.4rem; }
        }
      `}</style>
    </>
  );
}

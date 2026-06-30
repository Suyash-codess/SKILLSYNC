"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/directory", icon: "🔍", label: "Directory" },
  { href: "/projects", icon: "🏆", label: "Projects" },
  { href: "/connections", icon: "🤝", label: "Connections" },
  { href: "/messages", icon: "💬", label: "Messages" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`sidebar glass ${mobileOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <Link href="/" className="sidebar-logo" onClick={() => setMobileOpen(false)}>
          <div className="sidebar-logo-icon">⚡</div>
          <span className="sidebar-logo-text">SkillSync</span>
        </Link>

        <div className="divider" style={{ margin: "var(--space-3) 0" }} />

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-link-icon">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />
        <div className="divider" style={{ margin: "var(--space-3) 0" }} />

        {/* Profile Footer */}
        <Link
          href={`/profile/edit`}
          className="sidebar-profile"
          onClick={() => setMobileOpen(false)}
        >
          <div className="sidebar-avatar">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session?.user?.name ?? "My Profile"}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Edit profile
            </div>
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "flex-start", marginTop: "var(--space-1)", padding: "var(--space-2)", border: "none" }}
        >
          <span style={{ fontSize: "1.2rem" }}>🚪</span> Sign Out
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="dashboard-main">
        {/* Mobile topbar */}
        <header className="mobile-topbar glass">
          <button className="btn-secondary" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" style={{ border: "none", padding: "var(--space-1)" }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="gradient-text" style={{ fontWeight: 800, fontSize: "var(--text-md)" }}>⚡ SkillSync</span>
          </Link>
          <Link href={`/profile/edit`} className="sidebar-avatar">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </Link>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: var(--space-4) var(--space-3);
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          z-index: 50;
          flex-shrink: 0;
          background: var(--color-bg-card);
        }

        .sidebar-logo {
          display: flex; align-items: center; gap: var(--space-2);
          text-decoration: none; padding: var(--space-1);
        }
        
        .sidebar-logo-icon {
          width: 40px; height: 40px;
          border-radius: var(--radius-md);
          background: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-md);
          box-shadow: 0 0 20px var(--color-accent-glow);
        }
        
        .sidebar-logo-text {
          font-weight: 800; font-size: var(--text-lg);
          color: var(--color-text-primary);
        }

        .sidebar-nav {
          display: flex; flex-direction: column; gap: var(--space-1);
        }

        .sidebar-link {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--color-text-secondary);
          font-weight: 600; font-size: var(--text-sm);
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.05);
          color: var(--color-text-primary);
        }
        .sidebar-link-active {
          background: var(--color-accent-glow) !important;
          color: white !important;
          border: 1px solid var(--color-accent);
        }
        .sidebar-link-icon { font-size: var(--text-base); }

        .sidebar-profile {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--color-text-primary);
          transition: background 0.2s ease;
        }
        .sidebar-profile:hover { background: rgba(255,255,255,0.05); }

        .sidebar-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--text-sm); color: white;
          flex-shrink: 0;
        }

        .dashboard-main {
          flex: 1; display: flex; flex-direction: column; min-width: 0;
        }

        .dashboard-content {
          flex: 1;
          padding: var(--space-6) var(--space-4);
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .mobile-topbar {
          display: none;
          align-items: center; justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          position: sticky; top: 0; z-index: 40;
          border-radius: 0; border-left: none; border-right: none; border-top: none;
        }

        .sidebar-overlay {
          position: fixed; inset: 0;
          background: rgba(5,8,22,0.8);
          backdrop-filter: blur(4px);
          z-index: 45; display: none;
        }

        @media (max-width: 992px) {
          .sidebar { position: fixed; left: -300px; transition: left 0.3s ease; }
          .sidebar.sidebar-open { left: 0; }
          .sidebar-overlay { display: block; }
          .mobile-topbar { display: flex; }
          .dashboard-content { padding: var(--space-4) var(--space-2); }
        }
      `}</style>
    </div>
  );
}

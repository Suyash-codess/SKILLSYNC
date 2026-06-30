"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Skill { id: string; name: string; category: string; }
interface User {
  id: string; name: string; college: string; major: string;
  year: string; bio?: string; avatarUrl?: string;
  githubUrl?: string; portfolioUrl?: string;
  isAvailable: boolean; skills: Skill[];
}

const SKILL_CATEGORIES = [
  "All", "Frontend", "Backend", "AI/ML", "DevOps", "Mobile", "Database", "Design"
];

const CATEGORY_MAP: Record<string, string> = {
  "All": "", "Frontend": "React", "Backend": "Node.js", "AI/ML": "PyTorch",
  "DevOps": "Docker", "Mobile": "Flutter", "Database": "PostgreSQL", "Design": "Figma",
};

function SkillTag({ name }: Skill) {
  return (
    <span style={{
      fontSize: "var(--text-xs)",
      padding: "4px 12px",
      borderRadius: "var(--radius-full)",
      background: "rgba(124, 58, 237, 0.12)",
      border: "1px solid rgba(124, 58, 237, 0.3)",
      color: "#c4b5fd",
      fontWeight: 600
    }}>
      {name}
    </span>
  );
}

function StudentCardSkeleton() {
  return (
    <div className="glass" style={{ padding: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: "var(--space-1)" }} />
          <div className="skeleton" style={{ height: 12, width: "80%" }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, width: "100%", marginBottom: "var(--space-1)" }} />
      <div className="skeleton" style={{ height: 12, width: "70%", marginBottom: "var(--space-2)" }} />
      <div style={{ display: "flex", gap: "var(--space-1)" }}>
        <div className="skeleton" style={{ height: 24, width: 60, borderRadius: "var(--radius-full)" }} />
        <div className="skeleton" style={{ height: 24, width: 72, borderRadius: "var(--radius-full)" }} />
      </div>
    </div>
  );
}

function ConnectModal({
  user, onClose, onSent,
}: { user: User; onClose: () => void; onSent: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: user.id, message }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to send"); return; }
    onSent();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
          <h3 style={{ margin: 0 }}>Connect with {user.name}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: "4px 8px" }}>✕</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)",
          padding: "var(--space-2)", background: "rgba(124,58,237,0.06)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--color-accent)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white"
          }}>
            {user.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
              {user.major} · {user.college}
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "var(--space-2)" }}>
          <label className="input-label">
            Add a message <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
          </label>
          <textarea
            className="input-field"
            style={{ resize: "vertical", minHeight: 80 }}
            placeholder={`Hi ${user.name.split(" ")[0]}, I'd love to team up for...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={300}
          />
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textAlign: "right", marginTop: "var(--space-1)" }}>
            {message.length}/300
          </div>
        </div>

        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "var(--space-2)",
          padding: "var(--space-2)", background: "rgba(16,185,129,0.05)", borderRadius: "var(--radius-md)",
          border: "1px solid rgba(16,185,129,0.15)" }}>
          🔐 Their contact details will only be shared after they accept your request.
        </p>

        {error && <div style={{ color: "#f87171", fontSize: "var(--text-sm)", marginBottom: "var(--space-2)" }}>⚠️ {error}</div>}

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" onClick={send} disabled={loading} style={{ flex: 2 }}>
            {loading ? <span className="spinner" /> : "🚀 Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentCard({
  user, onConnect,
}: { user: User; onConnect: (u: User) => void }) {
  return (
    <div className="glass glass-hover" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: "var(--color-accent)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "var(--text-base)",
        }}>
          {user.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-base)", lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
                {user.major}
              </div>
            </div>
            <span className={user.isAvailable ? "badge-available" : "badge-busy"}>
              <span className="dot-pulse" />
              {user.isAvailable ? "Open" : "Busy"}
            </span>
          </div>
        </div>
      </div>

      {/* College + Year */}
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "var(--space-2)",
        display: "flex", alignItems: "center", gap: 6 }}>
        <span>🎓</span> {user.college} · {user.year}
      </div>

      {/* Bio */}
      {user.bio && (
        <p style={{
          fontSize: "var(--text-sm)",
          marginBottom: "var(--space-2)",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {user.bio}
        </p>
      )}

      {/* Skills */}
      <div style={{ flex: 1 }} />
      {user.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
          {user.skills.slice(0, 5).map((s) => (
            <SkillTag key={s.id} {...s} />
          ))}
          {user.skills.length > 5 && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", alignSelf: "center" }}>
              +{user.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Links + Actions */}
      <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap", alignItems: "center" }}>
        <Link href={`/profile/${user.id}`} className="btn-ghost" style={{ padding: "6px 12px" }}>
          View Profile
        </Link>
        <button
          className="btn-primary"
          onClick={() => onConnect(user)}
          style={{ marginLeft: "auto", padding: "6px 16px" }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [connectTarget, setConnectTarget] = useState<User | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (skillFilter) params.set("skill", skillFilter);
    if (availableOnly) params.set("available", "true");

    const res = await fetch(`/api/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    }
    setLoading(false);
  }, [search, skillFilter, availableOnly, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleCategoryFilter(cat: string) {
    setCategoryFilter(cat);
    setSkillFilter(cat === "All" ? "" : CATEGORY_MAP[cat] ?? "");
    setPage(1);
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h1>Student Directory <span className="gradient-text">🔍</span></h1>
        <p>Find engineers with the exact skills your team needs</p>
      </div>

      {/* Filters */}
      <div className="glass" style={{ padding: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
          <input
            className="input-field"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search by name, major, or bio..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <label style={{
            display: "flex", alignItems: "center", gap: "var(--space-1)",
            cursor: "pointer", padding: "12px 16px",
            background: availableOnly ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${availableOnly ? "rgba(16,185,129,0.3)" : "rgba(148,163,184,0.15)"}`,
            borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)",
            transition: "all 0.2s ease", userSelect: "none",
          }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => { setAvailableOnly(e.target.checked); setPage(1); }}
              style={{ accentColor: "#10b981" }}
            />
            <span style={{ color: availableOnly ? "#6ee7b7" : "var(--color-text-secondary)" }}>
              Available only
            </span>
          </label>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                border: "1px solid",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: categoryFilter === cat ? "var(--color-accent-glow)" : "transparent",
                borderColor: categoryFilter === cat ? "var(--color-accent)" : "var(--color-border)",
                color: categoryFilter === cat ? "white" : "var(--color-text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid-system">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-4">
              <StudentCardSkeleton />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-10) var(--space-4)" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-2)" }}>🤷</div>
          <h3>No students found</h3>
          <p>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid-system">
          {users.map((user, i) => (
            <div key={user.id} className="col-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <StudentCard user={user} onConnect={(u) => setConnectTarget(u)} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-2)", marginTop: "var(--space-5)" }}>
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Prev
          </button>
          <span style={{ padding: "10px 16px", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Connection Modal */}
      {connectTarget && (
        <ConnectModal
          user={connectTarget}
          onClose={() => setConnectTarget(null)}
          onSent={() => setSentIds(prev => new Set([...prev, connectTarget.id]))}
        />
      )}

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(5,8,22,0.8);
          backdrop-filter: blur(8px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: var(--space-3);
        }
        .modal-box { width: 100%; max-width: 480px; padding: var(--space-4); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

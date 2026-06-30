"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const CAT_CSS: Record<string, string> = {
  frontend: "skill-tag-frontend", backend: "skill-tag-backend",
  "ai/ml": "skill-tag-ai", ai: "skill-tag-ai",
  devops: "skill-tag-devops", mobile: "skill-tag-mobile",
  database: "skill-tag-database", design: "skill-tag-design",
};

interface Skill { id: string; name: string; category: string; }
interface UserProfile {
  id: string; name: string; college: string; major: string;
  year: string; bio?: string; avatarUrl?: string;
  githubUrl?: string; portfolioUrl?: string; linkedinUrl?: string;
  isAvailable: boolean; email?: string; phone?: string;
  showEmail: boolean; showPhone: boolean; skills: Skill[];
  connectionStatus?: string; connectionDirection?: string;
  createdAt: string;
}

function ConnectModal({ userId, userName, onClose, onSent }: {
  userId: string; userName: string; onClose: () => void; onSent: () => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setLoading(true);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: userId, message }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSent();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700 }}>Connect with {userName}</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="input-label">Message <span style={{ color: "var(--color-text-muted)" }}>(optional)</span></label>
            <textarea
              className="input-field"
              style={{ marginTop: 6, resize: "vertical", minHeight: 80 }}
              placeholder={`Hi ${userName.split(" ")[0]}, I'd love to collaborate on...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
            />
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", padding: "10px 12px",
            background: "rgba(16,185,129,0.05)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.15)" }}>
            🔐 Contact details will only be shared after they accept.
          </p>
          {error && <p style={{ color: "#f87171", fontSize: "0.85rem" }}>⚠️ {error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-primary" onClick={send} disabled={loading} style={{ flex: 2 }}>
              {loading ? <span className="spinner" /> : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setConnectionStatus(data.user?.connectionStatus ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="glass" style={{ padding: 36 }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 22, width: "40%", marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "50%" }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: 60, width: "100%", marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 80, 55, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 24, width: w, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🤔</div>
      <h2 style={{ fontWeight: 700 }}>User not found</h2>
      <Link href="/directory" className="btn-primary" style={{ display: "inline-flex", marginTop: 20 }}>
        Back to Directory
      </Link>
    </div>
  );

  const isConnected = connectionStatus === "ACCEPTED";
  const isPending = connectionStatus === "PENDING";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Profile Card */}
      <div className="glass" style={{ padding: 36, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", fontWeight: 800,
            boxShadow: "0 0 30px rgba(124,58,237,0.4)",
          }}>
            {user.name[0]}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                {user.name}
              </h1>
              <span className={user.isAvailable ? "badge-available" : "badge-busy"}>
                <span className="dot-pulse" />
                {user.isAvailable ? "Available" : "Busy"}
              </span>
            </div>

            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 4 }}>
              🎓 {user.major} · {user.college}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              {user.year} · Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Action */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "flex-start" }}>
            {isConnected ? (
              <span className="badge-available" style={{ padding: "8px 16px" }}>
                ✓ Connected
              </span>
            ) : isPending ? (
              <span className="badge-busy" style={{ padding: "8px 16px" }}>
                ⏳ Request Pending
              </span>
            ) : (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                🤝 Connect
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <>
            <div className="divider" />
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
              {user.bio}
            </p>
          </>
        )}
      </div>

      {/* Skills */}
      {user.skills.length > 0 && (
        <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>
            🛠️ Skills & Technologies
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {user.skills.map((s) => (
              <span key={s.id} className={`skill-tag ${CAT_CSS[s.category?.toLowerCase()] ?? "skill-tag-other"}`}
                style={{ fontSize: "0.8rem", padding: "5px 13px" }}>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {(user.githubUrl || user.portfolioUrl || user.linkedinUrl) && (
        <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 14 }}>
            🔗 Links
          </h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                GitHub ↗
              </a>
            )}
            {user.portfolioUrl && (
              <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Portfolio ↗
              </a>
            )}
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Contact (only if connected or public) */}
      {isConnected && (user.email || user.phone) && (
        <div className="glass" style={{ padding: 24,
          background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 14, color: "#6ee7b7" }}>
            ✅ Contact Details (Connected)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {user.email && (
              <div style={{ fontSize: "0.875rem" }}>
                📧 <a href={`mailto:${user.email}`} style={{ color: "#6ee7b7" }}>{user.email}</a>
              </div>
            )}
            {user.phone && (
              <div style={{ fontSize: "0.875rem" }}>
                📱 <span style={{ color: "var(--color-text-primary)" }}>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="glass" style={{ padding: 20, textAlign: "center",
          background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
            🔐 Connect with {user.name.split(" ")[0]} to see their contact information
          </p>
        </div>
      )}

      {showModal && (
        <ConnectModal
          userId={user.id}
          userName={user.name}
          onClose={() => setShowModal(false)}
          onSent={() => setConnectionStatus("PENDING")}
        />
      )}

      <style>{`
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px; }
        .modal-box { width:100%;max-width:480px;padding:28px; }
        .spinner { display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

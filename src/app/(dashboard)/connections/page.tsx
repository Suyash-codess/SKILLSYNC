"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Skill { name: string; category: string; }
interface User {
  id: string; name: string; college: string; major: string;
  avatarUrl?: string; isAvailable: boolean; skills: Skill[];
}
interface Connection {
  id: string; status: string; message?: string; createdAt: string;
  sender?: User; receiver?: User;
}

function PersonMini({ user }: { user: User }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "var(--color-accent)", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, flexShrink: 0, fontSize: "var(--text-base)"
      }}>
        {user.name[0]}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: "var(--text-base)" }}>{user.name}</div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
          {user.major} · {user.college}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginTop: "var(--space-1)" }}>
          {user.skills.slice(0, 3).map((s) => (
            <span key={s.name}
              style={{
                fontSize: "var(--text-xs)",
                padding: "2px 10px",
                borderRadius: "var(--radius-full)",
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#c4b5fd",
                fontWeight: 600
              }}>
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectionCard({
  conn, type, onAccept, onReject, onWithdraw,
}: {
  conn: Connection; type: "received" | "sent";
  onAccept?: () => void; onReject?: () => void; onWithdraw?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const person = type === "received" ? conn.sender : conn.receiver;
  if (!person) return null;

  const statusColor = {
    PENDING:  { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", color: "#fcd34d", label: "Pending" },
    ACCEPTED: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", color: "#6ee7b7", label: "Connected" },
    REJECTED: { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  color: "#fca5a5", label: "Declined" },
  }[conn.status] ?? { bg: "", border: "", color: "", label: conn.status };

  async function act(fn?: () => void) {
    setLoading(true);
    fn?.();
    setLoading(false);
  }

  return (
    <div className="glass" style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <PersonMini user={person} />

      {conn.message && (
        <div style={{
          padding: "var(--space-2)",
          background: "var(--color-bg-primary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
          fontStyle: "italic",
        }}>
          &ldquo;{conn.message}&rdquo;
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          padding: "4px 12px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 700,
          background: statusColor.bg, border: `1px solid ${statusColor.border}`,
          color: statusColor.color,
        }}>
          {statusColor.label}
        </span>

        <div style={{ display: "flex", gap: "var(--space-1)" }}>
          {type === "received" && conn.status === "PENDING" && (
            <>
              <button disabled={loading}
                onClick={() => act(onReject)} 
                style={{ fontSize: "var(--text-xs)", padding: "6px 14px", borderRadius: "var(--radius-full)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", fontWeight: 600 }}>
                Decline
              </button>
              <button disabled={loading}
                onClick={() => act(onAccept)} 
                style={{ fontSize: "var(--text-xs)", padding: "6px 14px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", fontWeight: 600 }}>
                ✓ Accept
              </button>
            </>
          )}
          {type === "sent" && conn.status === "PENDING" && (
            <button disabled={loading}
              onClick={() => act(onWithdraw)} 
              style={{ fontSize: "var(--text-xs)", padding: "6px 14px", borderRadius: "var(--radius-full)", background: "var(--color-bg-primary)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", cursor: "pointer", fontWeight: 600 }}>
              Withdraw
            </button>
          )}
          {conn.status === "ACCEPTED" && (
            <div className="card-actions" style={{ display: "flex", gap: "var(--space-1)" }}>
              <Link href={`/profile/${person.id}`} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "var(--text-xs)", textDecoration: "none" }}>
                View Profile
              </Link>
              <Link href={`/messages?userId=${person.id}`} className="btn-primary" style={{ padding: "6px 14px", fontSize: "var(--text-xs)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "1rem" }}>💬</span> Message
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const [received, setReceived] = useState<Connection[]>([]);
  const [sent, setSent] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"received" | "sent">("received");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/connections");
    if (res.ok) {
      const data = await res.json();
      setReceived(data.received ?? []);
      setSent(data.sent ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function accept(id: string) {
    await fetch(`/api/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACCEPTED" }),
    });
    load();
  }

  async function reject(id: string) {
    await fetch(`/api/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    load();
  }

  async function withdraw(id: string) {
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    load();
  }

  const pendingReceived = received.filter((c) => c.status === "PENDING").length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h1>Connections <span className="gradient-text">🤝</span></h1>
        <p>Manage your connection requests and teammates</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--space-1)", marginBottom: "var(--space-4)",
        background: "var(--color-bg-primary)", padding: "var(--space-1)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)" }}>
        {(["received", "sent"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "var(--space-2)", borderRadius: "var(--radius-md)", border: "none",
            cursor: "pointer", fontWeight: 600, fontSize: "var(--text-sm)",
            transition: "all 0.2s ease",
            background: tab === t ? "var(--color-accent-glow)" : "transparent",
            color: tab === t ? "var(--color-accent)" : "var(--color-text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-1)",
          }}>
            {t === "received" ? "Received" : "Sent"}
            {t === "received" && pendingReceived > 0 && (
              <span style={{
                background: "var(--color-accent)", color: "white",
                borderRadius: "50%", width: 24, height: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--text-xs)", fontWeight: 800,
              }}>
                {pendingReceived}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass" style={{ padding: "var(--space-4)", height: 120 }}>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 16, width: "50%", marginBottom: "var(--space-1)" }} />
                  <div className="skeleton" style={{ height: 14, width: "70%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {(tab === "received" ? received : sent).length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-10) var(--space-4)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--space-2)" }}>
                {tab === "received" ? "📭" : "📤"}
              </div>
              <h3 style={{ marginBottom: "var(--space-1)" }}>
                {tab === "received" ? "No incoming requests" : "No sent requests"}
              </h3>
              <p>
                {tab === "received"
                  ? "When someone sends you a request, it'll appear here."
                  : "Browse the directory to find teammates!"}
              </p>
            </div>
          ) : (
            (tab === "received" ? received : sent).map((conn) => (
              <ConnectionCard
                key={conn.id}
                conn={conn}
                type={tab}
                onAccept={() => accept(conn.id)}
                onReject={() => reject(conn.id)}
                onWithdraw={() => withdraw(conn.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

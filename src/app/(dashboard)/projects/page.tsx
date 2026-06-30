"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PROJECT_TYPES = ["All", "Hackathon", "Contest", "Startup", "Research", "Open Source"];

interface Project {
  id: string; title: string; description: string; type: string;
  techStack: string[]; neededSkills: string[]; teamSize: number;
  currentSize: number; deadline?: string; isOpen: boolean; createdAt: string;
  owner: { id: string; name: string; college: string; major: string; avatarUrl?: string };
}

function TypeBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    Hackathon: "⚡", Contest: "🏆", Startup: "🚀",
    Research: "🔬", "Open Source": "🌐",
  };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: "var(--radius-full)",
      fontSize: "var(--text-xs)", fontWeight: 700,
      background: "rgba(124, 58, 237, 0.12)",
      border: "1px solid rgba(124, 58, 237, 0.3)",
      color: "#c4b5fd",
    }}>
      {icons[type] ?? "📁"} {type}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const spotsLeft = project.teamSize - project.currentSize;
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="glass glass-hover" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-1)" }}>
        <div>
          <TypeBadge type={project.type} />
          <h3 style={{ marginTop: "var(--space-1)", marginBottom: 0 }}>
            {project.title}
          </h3>
        </div>
        {project.isOpen && (
          <span className="badge-available" style={{ flexShrink: 0 }}>
            <span className="dot-pulse" /> Open
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: "var(--text-sm)",
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        marginBottom: 0
      }}>
        {project.description}
      </p>

      {/* Team info */}
      <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
        <span>👥 {project.currentSize}/{project.teamSize} members</span>
        <span style={{ color: spotsLeft > 0 ? "#6ee7b7" : "#f87171" }}>
          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} open` : "Team full"}
        </span>
        {daysLeft !== null && (
          <span style={{ color: daysLeft < 3 ? "#f87171" : "inherit" }}>
            🕒 {daysLeft}d left
          </span>
        )}
      </div>

      {/* Stack */}
      <div style={{ marginTop: "var(--space-1)" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
          We Have
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {project.techStack.map((t) => (
            <span key={t} style={{
              padding: "4px 12px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 600,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--color-text-secondary)",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Needed */}
      <div style={{ marginBottom: "var(--space-2)" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
          Looking for
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {project.neededSkills.map((s) => (
            <span key={s} style={{
              padding: "4px 12px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 600,
              background: "var(--color-accent-glow)", border: "1px solid var(--color-accent)",
              color: "white",
            }}>
              🔍 {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div className="divider" style={{ margin: "0 0 var(--space-2) 0" }} />

      {/* Owner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href={`/profile/${project.owner.id}`} style={{
          display: "flex", alignItems: "center", gap: "var(--space-1)", textDecoration: "none",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--color-accent)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "var(--text-sm)",
          }}>
            {project.owner.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>{project.owner.name}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{project.owner.college}</div>
          </div>
        </Link>
        <Link href={`/profile/${project.owner.id}`} className="btn-primary" style={{ fontSize: "var(--text-xs)", padding: "6px 16px" }}>
          Apply →
        </Link>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), open: "true" });
    if (typeFilter !== "All") params.set("type", typeFilter);

    fetch(`/api/projects?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects ?? []);
        setTotalPages(data.pagination?.pages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [typeFilter, page]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <div>
          <h1>Project Board <span className="gradient-text">🏆</span></h1>
          <p>Find projects that need your skills — or post your own idea</p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          + Post Project
        </Link>
      </div>

      {/* Type Filter */}
      <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        {PROJECT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1); }}
            style={{
              padding: "8px 16px", borderRadius: "var(--radius-full)", border: "1px solid",
              fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              background: typeFilter === t ? "var(--color-accent-glow)" : "transparent",
              borderColor: typeFilter === t ? "var(--color-accent)" : "var(--color-border)",
              color: typeFilter === t ? "white" : "var(--color-text-secondary)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid-system">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-6">
              <div className="glass" style={{ padding: "var(--space-3)", height: 320 }}>
                <div className="skeleton" style={{ height: 24, width: "40%", marginBottom: "var(--space-2)" }} />
                <div className="skeleton" style={{ height: 16, width: "80%", marginBottom: "var(--space-1)" }} />
                <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: "var(--space-3)" }} />
                <div className="skeleton" style={{ height: 60, width: "100%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-10) var(--space-4)" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-2)" }}>📋</div>
          <h3>No projects yet</h3>
          <p style={{ marginBottom: "var(--space-3)" }}>Be the first to post a project idea!</p>
          <Link href="/projects/new" className="btn-primary">Post Project</Link>
        </div>
      ) : (
        <div className="grid-system">
          {projects.map((p, i) => (
            <div key={p.id} className="col-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-1)", marginTop: "var(--space-5)" }}>
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: "10px 16px", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

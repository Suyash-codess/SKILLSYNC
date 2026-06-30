"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROJECT_TYPES = ["Hackathon", "Contest", "Startup", "Research", "Open Source"];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [techInput, setTechInput] = useState("");
  const [neededInput, setNeededInput] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", type: "Hackathon",
    teamSize: 4, deadline: "",
    techStack: [] as string[],
    neededSkills: [] as string[],
  });

  function addTag(field: "techStack" | "neededSkills", value: string) {
    const v = value.trim();
    if (!v || form[field].includes(v)) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], v] }));
  }

  function removeTag(field: "techStack" | "neededSkills", idx: number) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const msgs = data.issues
        ? Object.values(data.issues).flat().join(", ")
        : data.error;
      setError(msgs ?? "Failed to create project");
      return;
    }

    router.push("/projects");
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Post a Project <span className="gradient-text">🚀</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 6 }}>
          Tell the community what you&apos;re building and who you need
        </p>
      </div>

      <div className="glass" style={{ padding: 36 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="input-label">Project Title</label>
            <input
              className="input-field"
              placeholder="e.g., AI-powered campus food delivery app"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="input-label">Project Type</label>
              <select
                className="select-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="input-label">Team Size</label>
              <input
                type="number"
                className="input-field"
                min={2} max={20}
                value={form.teamSize}
                onChange={(e) => setForm({ ...form, teamSize: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="input-label">Description</label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Describe your project idea, what problem it solves, and what you've built so far..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              style={{ resize: "vertical", minHeight: 100 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="input-label">Deadline (optional)</label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          {/* Tech Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="input-label">Tech Stack (what you already have)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                placeholder="e.g., React, Node.js..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag("techStack", techInput);
                    setTechInput("");
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => { addTag("techStack", techInput); setTechInput(""); }}
              >
                + Add
              </button>
            </div>
            {form.techStack.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {form.techStack.map((t, i) => (
                  <span key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem",
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "var(--color-text-primary)",
                  }}>
                    {t}
                    <button type="button" onClick={() => removeTag("techStack", i)}
                      style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", lineHeight: 1, fontSize: "0.85rem" }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Needed Skills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="input-label">Skills You Need</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                placeholder="e.g., PyTorch, Figma..."
                value={neededInput}
                onChange={(e) => setNeededInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag("neededSkills", neededInput);
                    setNeededInput("");
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => { addTag("neededSkills", neededInput); setNeededInput(""); }}
              >
                + Add
              </button>
            </div>
            {form.neededSkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {form.neededSkills.map((s, i) => (
                  <span key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem",
                    background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
                    color: "#c4b5fd",
                  }}>
                    🔍 {s}
                    <button type="button" onClick={() => removeTag("neededSkills", i)}
                      style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", lineHeight: 1, fontSize: "0.85rem" }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)",
              color: "#fca5a5", fontSize: "0.85rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "🚀 Post Project"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
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

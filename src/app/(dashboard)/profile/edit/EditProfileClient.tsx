"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileClient({ user, allSkills }: { user: any, allSkills: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    college: user.college || "",
    major: user.major || "",
    year: user.year || "1st Year",
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    portfolioUrl: user.portfolioUrl || "",
    isAvailable: user.isAvailable ?? true,
    skills: user.skills.map((s: any) => s.skill.id),
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  // Gamification logic: Calculate profile completeness
  const completeness = useMemo(() => {
    let score = 0;
    const max = 8;
    if (form.name) score++;
    if (form.bio && form.bio.length > 10) score++;
    if (form.college) score++;
    if (form.major) score++;
    if (form.githubUrl || form.portfolioUrl) score++;
    if (form.linkedinUrl) score++;
    if (form.skills.length > 0) score++;
    if (form.skills.length > 2) score++; // Bonus for adding multiple skills
    return Math.round((score / max) * 100);
  }, [form]);

  // Group skills by category for the selector
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    allSkills.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    return grouped;
  }, [allSkills]);

  const toggleSkill = (id: string) => {
    setForm(f => {
      const exists = f.skills.includes(id);
      if (exists) return { ...f, skills: f.skills.filter((s: string) => s !== id) };
      if (f.skills.length >= 10) return f; // Limit to 10
      return { ...f, skills: [...f.skills, id] };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccessMsg("Profile saved successfully! 🎉");
        router.refresh();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert("Failed to save profile. Please check all fields.");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="edit-container animate-fade-in-up">
      {/* ── HEADER & GAMIFICATION ── */}
      <div className="header-card glass">
        <div className="header-info">
          <div className="avatar-placeholder">
            {form.name ? form.name[0].toUpperCase() : "👋"}
          </div>
          <div>
            <h1 className="header-title">Build Your Profile</h1>
            <p className="header-sub">Help teammates find you by showing off your best self.</p>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-text">Profile Completeness</span>
            <span className="progress-percent">{completeness}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="progress-tip">
            {completeness < 50 ? "Add your skills and bio to get noticed!" : 
             completeness < 100 ? "Looking good! Add a link to your work to hit 100%." : 
             "Rockstar profile! You're ready to find a team. 🚀"}
          </p>
        </div>
      </div>

      {/* ── FORM SECTIONS ── */}
      <div className="form-grid">
        
        {/* Left Column */}
        <div className="form-col">
          {/* Basics */}
          <div className="section-card glass">
            <h2 className="section-title"><span>👤</span> Basic Info</h2>
            
            <div className="field-group">
              <label>Full Name</label>
              <input 
                className="input-field" 
                value={form.name} 
                onChange={e => set("name", e.target.value)} 
                placeholder="How should people call you?"
              />
            </div>
            
            <div className="field-group">
              <label>The Elevator Pitch (Bio)</label>
              <textarea 
                className="input-field textarea" 
                value={form.bio} 
                onChange={e => set("bio", e.target.value)} 
                placeholder="I'm a 1st year CS student who loves building Discord bots and learning React. Looking for hackathon teammates!"
                rows={4}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>College / Uni</label>
                <input 
                  className="input-field" 
                  value={form.college} 
                  onChange={e => set("college", e.target.value)} 
                  placeholder="e.g. Stanford"
                />
              </div>
              <div className="field-group">
                <label>Major</label>
                <input 
                  className="input-field" 
                  value={form.major} 
                  onChange={e => set("major", e.target.value)} 
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>
            
            <div className="field-group">
              <label>Current Year</label>
              <select 
                className="input-field select-styled" 
                value={form.year} 
                onChange={e => set("year", e.target.value)}
              >
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgrad", "PhD"].map(y => (
                  <option key={y} value={y} className="dropdown-option">{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="section-card glass availability-card">
            <div>
              <h2 className="section-title" style={{margin:0}}><span>🟢</span> Open to Teams?</h2>
              <p style={{fontSize:"var(--text-xs)", color:"var(--color-text-muted)", marginTop:"var(--space-1)"}}>
                Turn this off if you aren't looking to join new projects right now.
              </p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={form.isAvailable} 
                onChange={e => set("isAvailable", e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Right Column */}
        <div className="form-col">
          {/* Skills */}
          <div className="section-card glass">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
              <h2 className="section-title"><span>⚡</span> Your Superpowers</h2>
              <span style={{fontSize:"var(--text-xs)", color:"var(--color-text-muted)"}}>
                {form.skills.length}/10 Selected
              </span>
            </div>
            <p style={{fontSize:"var(--text-sm)", color:"var(--color-text-secondary)", marginBottom:"var(--space-2)"}}>
              Pick the tools you know or are actively learning right now.
            </p>

            <div className="skills-scroll-area">
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={cat} className="skill-category">
                  <h3 className="cat-title">{cat}</h3>
                  <div className="skill-tags">
                    {skills.map(skill => {
                      const active = form.skills.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={`skill-tag ${active ? "active" : ""}`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="section-card glass">
            <h2 className="section-title"><span>🔗</span> Links</h2>
            <p style={{fontSize:"var(--text-sm)", color:"var(--color-text-secondary)", marginBottom:"var(--space-2)"}}>
              Don't have a portfolio? No problem! Just linking your GitHub is a great start.
            </p>
            
            <div className="field-group">
              <label>GitHub</label>
              <div className="input-with-icon">
                <span className="icon">🐙</span>
                <input 
                  className="input-field" 
                  value={form.githubUrl} 
                  onChange={e => set("githubUrl", e.target.value)} 
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            
            <div className="field-group">
              <label>LinkedIn</label>
              <div className="input-with-icon">
                <span className="icon">💼</span>
                <input 
                  className="input-field" 
                  value={form.linkedinUrl} 
                  onChange={e => set("linkedinUrl", e.target.value)} 
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            
            <div className="field-group">
              <label>Portfolio / Website</label>
              <div className="input-with-icon">
                <span className="icon">🌐</span>
                <input 
                  className="input-field" 
                  value={form.portfolioUrl} 
                  onChange={e => set("portfolioUrl", e.target.value)} 
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SAVE BAR ── */}
      <div className="save-bar glass animate-fade-in-up" style={{animationDelay: "0.2s"}}>
        <div className="save-msg">{successMsg}</div>
        <button 
          className="btn-primary save-btn" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : "Save Profile Changes →"}
        </button>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        .edit-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: 0 var(--space-2) 120px; /* space for sticky save bar */
        }
        
        .header-card {
          padding: var(--space-5);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
          flex-wrap: wrap;
          background: var(--color-bg-card) !important;
          border: 1px solid var(--color-border) !important;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .avatar-placeholder {
          width: 72px; height: 72px;
          border-radius: var(--radius-md);
          background: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-2xl); font-weight: 800; color: white;
          box-shadow: 0 8px 32px var(--color-accent-glow);
        }
        
        .header-title { margin-bottom: var(--space-1); }
        .header-sub { color: var(--color-text-secondary); font-size: var(--text-base); }

        .progress-section {
          flex: 1;
          min-width: 250px;
          max-width: 400px;
          background: var(--color-bg-primary);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .progress-header {
          display: flex; justify-content: space-between; margin-bottom: var(--space-2);
        }
        .progress-text { font-weight: 700; font-size: var(--text-xs); color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.05em; }
        .progress-percent { font-weight: 800; color: var(--color-text-primary); }
        
        .progress-bar-bg {
          height: 8px;
          background: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--space-2);
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: var(--radius-full);
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 10px var(--color-accent-glow);
        }
        .progress-tip {
          font-size: var(--text-xs); color: var(--color-text-muted);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        @media(max-width: 860px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .section-card {
          padding: var(--space-5);
          border-radius: var(--radius-lg);
          background: var(--color-bg-card) !important;
        }
        .section-title {
          font-size: var(--text-lg); font-weight: 800; margin-bottom: var(--space-4);
          display: flex; align-items: center; gap: var(--space-1);
        }

        .field-group { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
        .field-group label { font-size: var(--text-xs); font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }

        .input-field {
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 14px 16px;
          color: var(--color-text-primary); font-family: var(--font-sans);
          transition: all 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          background: var(--color-bg-card);
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }
        .input-field::placeholder { color: var(--color-text-muted); }
        .textarea { resize: vertical; line-height: 1.5; }

        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 16px; top: 14px; opacity: 0.5; color: var(--color-text-primary); }
        .input-with-icon .input-field { padding-left: 44px; width: 100%; }

        .select-styled { appearance: none; cursor: pointer; }
        .dropdown-option { color: var(--color-text-primary); background: var(--color-bg-primary); }

        /* Skills Selector */
        .skills-scroll-area {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .skills-scroll-area::-webkit-scrollbar { width: 6px; }
        .skills-scroll-area::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: var(--radius-full); }

        .skill-category { margin-bottom: var(--space-3); }
        .cat-title { font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-2); font-weight: 600; text-transform: uppercase; }
        
        .skill-tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }
        .skill-tag {
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          font-size: var(--text-sm); font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .skill-tag:hover { background: var(--color-bg-card-hover); }
        .skill-tag.active {
          background: rgba(124,58,237,0.12);
          border-color: rgba(124,58,237,0.4);
          color: var(--color-accent);
        }

        /* Toggle */
        .availability-card { display: flex; align-items: center; justify-content: space-between; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border); transition: .3s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: var(--color-text-muted); transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); }
        input:checked + .slider:before { transform: translateX(22px); background-color: #34d399; box-shadow: 0 0 10px #34d399; }

        /* Save Bar */
        .save-bar {
          position: sticky;
          bottom: 32px; 
          margin-top: var(--space-4);
          margin-left: auto;
          margin-right: auto;
          width: fit-content;
          gap: var(--space-4);
          padding: 16px 24px;
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: space-between;
          background: var(--color-bg-card) !important;
          border: 1px solid var(--color-border) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
          z-index: 50;
          backdrop-filter: blur(20px);
        }
        .save-msg { color: #10b981; font-weight: 600; font-size: var(--text-sm); }
        .save-btn {
          padding: 12px 28px;
          border-radius: var(--radius-full);
          box-shadow: 0 8px 24px var(--color-accent-glow);
        }

        .spinner {
          display: inline-block; width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

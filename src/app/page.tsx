"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: "80px",
        display: "flex",
        alignItems: "center",
        background: scrolled ? "var(--color-bg-card)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 40, height: 40,
              borderRadius: "10px",
              background: "var(--color-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", boxShadow: "0 0 20px var(--color-accent-glow)",
            }}
          >
            ⚡
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Link href="/login" className="btn-secondary hide-mobile">Log In</Link>
          <Link href="/register" className="btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Testimonial Card ────────────────────────────────────────────────────────
function TestimonialCard({ text, author, role, image }: { text: string, author: string, role: string, image: string }) {
  return (
    <div className="glass glass-hover" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", height: "100%" }}>
      <p style={{ fontSize: "var(--text-base)", fontWeight: 500, color: "var(--color-text-primary)", fontStyle: "italic", flex: 1 }}>
        "{text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
          {image}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "white" }}>{author}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "120px" }}>
        
        {/* ── HERO SECTION ── */}
        <section className="container" style={{ paddingBottom: "var(--space-12)", paddingTop: "var(--space-6)" }}>
          <div className="grid-system" style={{ alignItems: "center" }}>
            
            {/* Left Content */}
            <div className="col-8 animate-fade-in-up">
              <div 
                style={{
                  display: "inline-flex", padding: "6px 16px", borderRadius: "var(--radius-full)",
                  background: "rgba(124,58,237,0.1)", border: "1px solid var(--color-border)",
                  color: "#a78bfa", fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em",
                  marginBottom: "var(--space-4)"
                }}
              >
                FOR ENGINEERING STUDENTS
              </div>
              <h1>
                Build your next <span className="gradient-text">Hackathon Team</span> in seconds.
              </h1>
              <p style={{ fontSize: "var(--text-base)", maxWidth: 600, marginBottom: "var(--space-5)" }}>
                Tired of doing all the work in group projects? Find teammates on your campus who actually know how to code, design, and build cool stuff.
              </p>
              
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <Link href="/register" className="btn-primary" style={{ padding: "var(--space-3) var(--space-5)", fontSize: "var(--text-base)" }}>
                  Join the Network 🚀
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", paddingLeft: "var(--space-3)" }}>
                  <div style={{ display: "flex" }}>
                    {["👩‍💻", "👨‍🔬", "🧑‍🎨", "🕵️‍♂️"].map((e, i) => (
                      <span key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-border)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: i > 0 ? -12 : 0, border: "2px solid var(--color-bg-primary)" }}>{e}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Join 500+ students</span>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="col-4 hide-mobile animate-fade-in-up delay-200">
              <div className="glass">
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👩‍💻</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>Priya Sharma</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Needs a Frontend Dev</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
                  <span style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", padding: "4px 12px", borderRadius: 20, fontSize: "var(--text-xs)", fontWeight: 600 }}>React</span>
                  <span style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", padding: "4px 12px", borderRadius: 20, fontSize: "var(--text-xs)", fontWeight: 600 }}>TypeScript</span>
                </div>
                <button className="btn-primary" style={{ width: "100%" }}>Connect</button>
              </div>
            </div>
            
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="container" style={{ paddingBottom: "var(--space-12)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <h2>Stop settling for bad teams</h2>
            <p style={{ margin: "0 auto", maxWidth: 600 }}>We built this platform to fix the biggest problem in college: finding reliable people who have the skills you lack.</p>
          </div>
          
          <div className="grid-system">
            <div className="col-4">
              <div className="glass glass-hover" style={{ height: "100%" }}>
                <div style={{ fontSize: "32px", marginBottom: "var(--space-3)" }}>🎯</div>
                <h3>Smart Matching</h3>
                <p>Filter by specific skills (e.g. PyTorch, React, Figma). No more vague "I know some coding" bios.</p>
              </div>
            </div>
            <div className="col-4">
              <div className="glass glass-hover" style={{ height: "100%" }}>
                <div style={{ fontSize: "32px", marginBottom: "var(--space-3)" }}>⚡</div>
                <h3>Verified Work</h3>
                <p>Profiles connect directly to GitHub and Portfolios. See what people have actually built before teaming up.</p>
              </div>
            </div>
            <div className="col-4">
              <div className="glass glass-hover" style={{ height: "100%" }}>
                <div style={{ fontSize: "32px", marginBottom: "var(--space-3)" }}>🎓</div>
                <h3>Campus Focused</h3>
                <p>Find people in your own college first. Easier meetups, same timezones, and shared context.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF / TESTIMONIALS ── */}
        <section style={{ background: "var(--color-bg-card)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", padding: "var(--space-10) 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
              <h2>Hear from students like you</h2>
            </div>
            
            <div className="grid-system">
              <div className="col-6">
                <TestimonialCard 
                  text="I had a great ML model but my frontend was terrible. Found a React dev on SkillSync in 10 minutes and we ended up winning the college hackathon."
                  author="Arjun Mehta"
                  role="2nd Year, AI & Data Science"
                  image="👨‍🎓"
                />
              </div>
              <div className="col-6">
                <TestimonialCard 
                  text="Usually I end up doing 90% of the work in group projects. Through this platform, I finally found a backend partner who actually pushed code."
                  author="Priya Sharma"
                  role="1st Year, Comp Sci"
                  image="👩‍💻"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="container" style={{ padding: "var(--space-16) 0", textAlign: "center" }}>
          <div className="glass" style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-8) var(--space-4)" }}>
            <h2>No more solo-carrying hackathons 🏆</h2>
            <p style={{ margin: "0 auto var(--space-5)", maxWidth: 500 }}>Create your profile, select your skills, and find the perfect team today. It takes 30 seconds.</p>
            <Link href="/register" className="btn-primary" style={{ padding: "var(--space-3) var(--space-6)", fontSize: "var(--text-base)" }}>
              Create Your Free Profile
            </Link>
          </div>
        </section>

      </main>
      
      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-6) 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
        <p>© 2026 SkillSync. Built by students, for students.</p>
      </footer>
    </>
  );
}

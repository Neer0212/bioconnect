"use client";
import { useEffect, useRef, useState } from "react";

// ── Tiny animation hook: fade+slide up on scroll ──
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Feature card data ──
const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    title: "Learning Hub",
    desc: "Access courses, resources, and educational content tailored for biotech professionals.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    title: "Jobs & Internships",
    desc: "Discover opportunities specifically in biotechnology and life sciences.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: "Research Papers",
    desc: "Explore the latest publications and stay current with cutting-edge research.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Events Calendar",
    desc: "Stay updated on conferences, webinars, and networking events.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Role-Based Profiles",
    desc: "Customized experiences for students, educators, researchers, and industry.",
  },
];

// ── Role card data ──
const roles = [
  {
    label: "Students",
    color: "#5B4FD8",
    bg: "#EEEDFE",
    desc: "Access learning resources, find internships, connect with mentors, and build your professional foundation.",
    points: ["Career guidance", "Internship matching", "Skill development", "Peer community"],
  },
  {
    label: "Educators",
    color: "#0F6E56",
    bg: "#E1F5EE",
    desc: "Share knowledge, develop courses, connect with students, and collaborate with fellow educators.",
    points: ["Course creation tools", "Student engagement", "Resource sharing", "Professional network"],
  },
  {
    label: "Researchers",
    color: "#854F0B",
    bg: "#FAEEDA",
    desc: "Collaborate on projects, publish findings, network with peers, and advance your research.",
    points: ["Project collaboration", "Research sharing", "Grant opportunities", "Conference connections"],
  },
];

// ── Stat data ──
const stats = [
  { value: "2", label: "Students enrolled" },
  { value: "0", label: "Biotech companies" },
  { value: "0", label: "Courses & resources" },
  { value: "0", label: "Events monthly" },
];

// ── Reusable fade wrapper ──
function Fade({ children, delay = 0, className = "" }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false); // For mobile nav toggle (not fully implemented in this snippet, but state is set up for it)

  return (
    <main style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F5F4FB", minHeight: "100vh", color: "#1a1a2e" }}> 

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap'); // Importing DM Sans and DM Serif Display for typography
      
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } // Resetting default margins and paddings, and setting box-sizing to border-box for easier layout control
        html { scroll-behavior: smooth; }
        body { background: #F5F4FB; }
        ::selection { background: #C8C4F6; } // Custom selection color for better aesthetics
        a { text-decoration: none; color: inherit; } // Ensuring links inherit color and have no default underline

        .nav-link {
          font-size: 14px; color: #4a4a6a; padding: 6px 12px;
          border-radius: 8px; transition: background 0.2s, color 0.2s;
          font-weight: 400;s
        }
        .nav-link:hover { background: #EEEDFE; color: #5B4FD8; }

        .btn-primary {
          background: #5B4FD8; color: #fff; border: none;
          padding: 11px 24px; border-radius: 10px; font-size: 14px;
          font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.15s;
          font-family: inherit;
        }
        .btn-primary:hover { background: #4A3FC0; transform: translateY(-1px); }

        .btn-outline {
          background: transparent; color: #5B4FD8;
          border: 1.5px solid #C8C4F6; padding: 11px 24px;
          border-radius: 10px; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
          font-family: inherit;
        }
        .btn-outline:hover { background: #EEEDFE; border-color: #5B4FD8; }

        .feature-card {
          background: #fff; border: 1px solid #E8E6F8;
          border-radius: 16px; padding: 28px 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(91,79,216,0.10); }

        .role-card {
          background: #fff; border: 1px solid #E8E6F8;
          border-radius: 16px; padding: 32px 28px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .role-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(91,79,216,0.08); }

        .stat-card {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 14px; padding: 24px 20px; text-align: center;
        }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .hero-img { width: 100% !important; margin-top: 32px; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .roles-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { flex-direction: column !important; gap: 32px !important; }
          .nav-links { display: none; }
          .hero-title { font-size: 36px !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(245,244,251,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E8E6F8",
        padding: "0 max(24px, calc((100vw - 1160px)/2))",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo.jpg" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e", letterSpacing: "-0.3px" }}>
            BioConnect
          </span>
        </div>

        {/* Nav links */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <a className="nav-link" href="#features">Features</a>
          <a className="nav-link" href="#roles">For you</a>
          <a className="nav-link" href="#stats">About</a>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a className="nav-link" href="/login">Login</a>
          <a className="btn-primary" href="/signup" style={{ padding: "9px 20px" }}>Get Started</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "80px max(24px, calc((100vw - 1160px)/2)) 80px" }}>
        <div className="hero-grid" style={{ display: "flex", alignItems: "center", gap: "60px" }}>

          {/* Left */}
          <div style={{ flex: "1", minWidth: 0 }}>
            <Fade delay={0}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                background: "#EEEDFE", border: "1px solid #C8C4F6",
                borderRadius: "100px", padding: "6px 14px",
                fontSize: "13px", color: "#5B4FD8", fontWeight: "500",
                marginBottom: "24px",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4FD8" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                The Future of Biotech Collaboration
              </div>
            </Fade>

            <Fade delay={80}>
              <h1 className="hero-title" style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "52px", lineHeight: "1.1", letterSpacing: "-1px",
                color: "#1a1a2e", marginBottom: "20px",
              }}>
                Learn.<br />Connect.<br />Innovate.
              </h1>
            </Fade>

            <Fade delay={160}>
              <p style={{ fontSize: "17px", color: "#5a5a7a", lineHeight: "1.7", marginBottom: "36px", maxWidth: "460px" }}>
                The unified platform connecting biotech students, educators, researchers, and industry professionals. Accelerate innovation through collaboration, learning, and professional growth.
              </p>
            </Fade>

            <Fade delay={240}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a className="btn-primary" href="/signup" style={{ fontSize: "15px", padding: "13px 28px", display: "inline-block", textAlign: "center" }}>
                  Join BioConnect
                </a>
                <a className="btn-outline" href="#features" style={{ fontSize: "15px", padding: "13px 28px", display: "inline-block", textAlign: "center" }}>
                  Learn More
                </a>
              </div>
            </Fade>
          </div>

          {/* Right — hero image */}
          <Fade delay={300} className="hero-img" style={{ flex: "1", minWidth: 0 }}>
            <div style={{
              borderRadius: "20px", overflow: "hidden",
              background: "#ddd", aspectRatio: "4/3",
              border: "1px solid #E8E6F8",
              position: "relative",
            }}>
              {/* Placeholder image — replace src with your actual lab photo */}
              <img
                src="https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=800&q=80"
                alt="Biotech researchers in a lab"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* Subtle overlay badge */}
              <div style={{
                position: "absolute", bottom: "16px", left: "16px",
                background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
                borderRadius: "12px", padding: "10px 16px",
                display: "flex", alignItems: "center", gap: "10px",
                border: "1px solid #E8E6F8",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1a1a2e" }}>2 students active</span>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px max(24px, calc((100vw - 1160px)/2))", background: "#fff" }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "38px", color: "#1a1a2e", letterSpacing: "-0.5px", marginBottom: "12px" }}>
              Everything You Need in One Platform
            </h2>
            <p style={{ fontSize: "16px", color: "#5a5a7a" }}>Comprehensive tools designed specifically for the biotech community</p>
          </div>
        </Fade>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {features.map((f, i) => (
            <Fade key={f.title} delay={i * 70}>
              <div className="feature-card">
                <div style={{
                  width: 44, height: 44, background: "#EEEDFE", borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#5B4FD8", marginBottom: "16px",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a2e", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", color: "#5a5a7a", lineHeight: "1.6" }}>{f.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ padding: "80px max(24px, calc((100vw - 1160px)/2))", background: "#F5F4FB" }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "38px", color: "#1a1a2e", letterSpacing: "-0.5px", marginBottom: "12px" }}>
              Built for Every Role in Biotech
            </h2>
            <p style={{ fontSize: "16px", color: "#5a5a7a" }}>Tailored experiences that meet you where you are</p>
          </div>
        </Fade>

        <div className="roles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {roles.map((r, i) => (
            <Fade key={r.label} delay={i * 80}>
              <div className="role-card">
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  background: r.bg, borderRadius: "100px",
                  padding: "5px 14px", marginBottom: "20px",
                }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: r.color }}>{r.label}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#5a5a7a", lineHeight: "1.65", marginBottom: "20px" }}>{r.desc}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {r.points.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#3a3a5a" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── STATS / CTA BANNER ── */}
      <section id="stats" style={{
        background: "linear-gradient(135deg, #5B4FD8 0%, #7B6FE8 100%)",
        padding: "80px max(24px, calc((100vw - 1160px)/2))",
      }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "38px", color: "#fff", letterSpacing: "-0.5px", marginBottom: "12px",
            }}>
              Ready to Transform Your Biotech Journey?
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", marginBottom: "32px" }}>
              Join thousands of biotech students, educators, and researchers across India
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{
                background: "#fff", color: "#5B4FD8", border: "none",
                padding: "13px 30px", borderRadius: "10px",
                fontSize: "15px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", transition: "transform 0.15s",
              }}
                onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.target.style.transform = "translateY(0)"}
              >
                Get Started Free
              </button>
              <button style={{
                background: "transparent", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.45)",
                padding: "13px 30px", borderRadius: "10px",
                fontSize: "15px", fontWeight: "500", cursor: "pointer",
                fontFamily: "inherit", transition: "background 0.2s",
              }}
                onMouseOver={e => e.target.style.background = "rgba(255,255,255,0.1)"}
                onMouseOut={e => e.target.style.background = "transparent"}
              >
                Talk to us
              </button>
            </div>
          </div>
        </Fade>

        {/* Stats grid */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {stats.map((s, i) => (
            <Fade key={s.label} delay={i * 60}>
              <div className="stat-card">
                <div style={{ fontSize: "30px", fontWeight: "700", color: "#fff", fontFamily: "'DM Serif Display', serif", marginBottom: "6px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{s.label}</div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#12102A", padding: "56px max(24px, calc((100vw - 1160px)/2)) 32px" }}>
        <div className="footer-grid" style={{ display: "flex", gap: "60px", marginBottom: "48px" }}>
          {/* Brand */}
          <div style={{ flex: "1.2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: 30, height: 30, background: "#5B4FD8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#fff" }}>BioConnect</span>
            </div>
            <p style={{ fontSize: "14px", color: "#6a6a8a", lineHeight: "1.7", maxWidth: "260px" }}>
              Connecting India's biotech community — students, educators, researchers, and industry.
            </p>
          </div>

          {/* Links */}
          {[
            { heading: "Platform", links: ["Learning Hub", "Jobs & Internships", "Research Papers", "Events Calendar"] },
            { heading: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
            { heading: "Support", links: ["Help Center", "Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "16px", letterSpacing: "0.5px" }}>{col.heading}</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: "14px", color: "#6a6a8a", transition: "color 0.2s" }}
                      onMouseOver={e => e.target.style.color = "#C8C4F6"}
                      onMouseOut={e => e.target.style.color = "#6a6a8a"}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #2a2a4a", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "#4a4a6a" }}>© 2026 BioConnect. Made with care for India's biotech community.</p>
          <p style={{ fontSize: "13px", color: "#4a4a6a" }}>Built in India 🇮🇳</p>
        </div>
      </footer>

    </main>
  );
}
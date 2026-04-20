"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/* ── Scroll-triggered fade ── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Fade({ children, delay = 0, className = "", dir = "up" }) {
  const ref = useFadeIn();
  const transforms = { up: "translateY(40px)", left: "translateX(-40px)", right: "translateX(40px)" };
  return (
    <div ref={ref} className={`fade-in ${className}`} style={{ "--delay": `${delay}ms`, "--from": transforms[dir] || transforms.up }}>
      {children}
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const num = parseInt(target) || 0;
        const duration = 1500;
        const step = Math.max(1, Math.floor(num / (duration / 16)));
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= num) { current = num; clearInterval(timer); }
          setCount(current);
        }, 16);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Typing effect ── */
function TypeWriter({ words, speed = 100, pause = 2000 }) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.substring(0, charIdx + 1));
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(charIdx + 1);
        }
      } else {
        setText(word.substring(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setWordIdx((wordIdx + 1) % words.length);
        } else {
          setCharIdx(charIdx - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return <span>{text}<span className="cursor">|</span></span>;
}

/* ── Data ── */
const features = [
  { icon: "🧬", title: "Learning Hub", desc: "Subject-wise PDF notes and study materials uploaded by educators.", size: "large", color: "#0D9488" },
  { icon: "📄", title: "Research Papers", desc: "Browse and share scientific publications.", size: "small", color: "#F59E0B" },
  { icon: "📅", title: "Events", desc: "Conferences, webinars, and workshops.", size: "small", color: "#8B5CF6" },
  { icon: "👤", title: "Role-Based Profiles", desc: "Tailored for students, educators, researchers.", size: "small", color: "#EC4899" },
  { icon: "🔬", title: "Academic Ecosystem", desc: "One platform connecting India's entire biotech community.", size: "large", color: "#3B82F6" },
];

const roles = [
  { label: "Students", color: "#0D9488", bg: "rgba(13,148,136,0.1)", border: "rgba(13,148,136,0.25)", desc: "Access learning resources, find study materials, and build your academic foundation.", points: ["Subject-wise notes", "Research access", "Event discovery", "Peer community"] },
  { label: "Educators", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", desc: "Upload content, share knowledge, and connect with students across universities.", points: ["Upload study materials", "Publish research", "Host events", "Track engagement"] },
  { label: "Researchers", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", desc: "Share findings, collaborate on projects, and stay updated with the latest publications.", points: ["Share papers", "Find collaborators", "Conference updates", "Grant opportunities"] },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Sign up in 30 seconds. Choose your role — student, educator, or researcher." },
  { num: "02", title: "Explore the platform", desc: "Browse study materials, research papers, and upcoming events." },
  { num: "03", title: "Start contributing", desc: "Upload notes, share research, or register for events." },
];

export default function Home() {
  const [stats, setStats] = useState({ users: 0, papers: 0, events: 0, subjects: 6 });

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const [u, p, e] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("research_papers").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
      ]);
      setStats({ users: u.count || 0, papers: p.count || 0, events: e.count || 0, subjects: 6 });
    }
    loadStats();
  }, []);

  return (
    <main>
      <style>{CSS}</style>

      {/* ── NAVBAR ── */}
      <nav className="nav">
        <a href="/" className="logo">
          <img src="/logo.jpg" alt="BioConnect" style={{ width: 34, height: 34, borderRadius: "10px", objectFit: "cover" }} />
          <span>BioConnect</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#roles">For you</a>
          <a href="#how">How it works</a>
        </div>
        <div className="nav-cta">
          <a href="/login" className="nav-login">Login</a>
          <a href="/signup" className="nav-btn">Get Started</a>
        </div>
      </nav>

      {/* ── HERO (Dark) ── */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid">
          <div className="hero-left">
            <Fade delay={0}>
              <div className="hero-badge">
                <span className="badge-dot"></span>
                India's Biotech Academic Platform
              </div>
            </Fade>
            <Fade delay={100}>
              <h1 className="hero-title">
                <TypeWriter words={["Learn.", "Connect.", "Innovate.", "Discover.", "Collaborate."]} speed={120} pause={1800} />
              </h1>
              <p className="hero-subtitle">
                The unified platform where biotech students, educators, and researchers come together to learn, share, and grow.
              </p>
            </Fade>
            <Fade delay={200}>
              <div className="hero-btns">
                <a href="/signup" className="btn-primary">Join BioConnect — it's free</a>
                <a href="#features" className="btn-ghost">See features ↓</a>
              </div>
            </Fade>
            <Fade delay={300}>
              <div className="hero-stats">
                <div className="hero-stat"><strong><Counter target={stats.users} suffix="+" /></strong><span>Users</span></div>
                <div className="hero-stat-divider"></div>
                <div className="hero-stat"><strong><Counter target={stats.papers} suffix="+" /></strong><span>Papers</span></div>
                <div className="hero-stat-divider"></div>
                <div className="hero-stat"><strong><Counter target={stats.subjects} /></strong><span>Subjects</span></div>
              </div>
            </Fade>
          </div>
          <Fade delay={250} dir="right" className="hero-right">
            <div className="hero-visual">
              <div className="hero-glow"></div>
              <div className="hero-card hc1">
                <span className="hc-icon">🧬</span>
                <div><strong>Molecular Biology</strong><span>12 notes uploaded</span></div>
              </div>
              <div className="hero-card hc2">
                <span className="hc-icon">📄</span>
                <div><strong>New Research Paper</strong><span>CRISPR-Cas9 Variants</span></div>
              </div>
              <div className="hero-card hc3">
                <span className="hc-icon">📅</span>
                <div><strong>Upcoming Event</strong><span>Biotech Conference 2026</span></div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── FEATURES (Bento Grid) ── */}
      <section id="features" className="section-light">
        <Fade><h2 className="section-title">Everything you need, in one place</h2></Fade>
        <Fade delay={50}><p className="section-sub">Built specifically for India's biotech academic community</p></Fade>
        <div className="bento">
          {features.map((f, i) => (
            <Fade key={f.title} delay={i * 80}>
              <div className={`bento-card ${f.size === "large" ? "bento-large" : ""}`} style={{ "--accent": f.color }}>
                <span className="bento-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="section-dark">
        <Fade><h2 className="section-title light">How it works</h2></Fade>
        <Fade delay={50}><p className="section-sub light">Get started in 3 simple steps</p></Fade>
        <div className="steps">
          {steps.map((s, i) => (
            <Fade key={s.num} delay={i * 100}>
              <div className="step-card">
                <span className="step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="section-light">
        <Fade><h2 className="section-title">Built for every role in biotech</h2></Fade>
        <Fade delay={50}><p className="section-sub">Tailored experiences that meet you where you are</p></Fade>
        <div className="roles-grid">
          {roles.map((r, i) => (
            <Fade key={r.label} delay={i * 100}>
              <div className="role-card" style={{ "--rc": r.color, "--rcbg": r.bg, "--rcbr": r.border }}>
                <span className="role-badge">{r.label}</span>
                <p className="role-desc">{r.desc}</p>
                <ul className="role-points">
                  {r.points.map((p) => (
                    <li key={p}><span className="role-dot"></span>{p}</li>
                  ))}
                </ul>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-section">
        <Fade>
          <h2>Ready to transform your biotech journey?</h2>
          <p>Join students, educators, and researchers across India</p>
          <div className="cta-btns">
            <a href="/signup" className="btn-primary">Get Started Free</a>
            <a href="/login" className="btn-ghost-light">Already have an account?</a>
          </div>
        </Fade>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <img src="/logo.jpg" alt="BioConnect" style={{ width: 28, height: 28, borderRadius: "8px", objectFit: "cover" }} />
              <span>BioConnect</span>
            </div>
            <p>Connecting India's biotech community — students, educators, researchers, and industry.</p>
          </div>
          {[
            { heading: "Platform", links: [{ n: "Learning Hub", h: "/learning" }, { n: "Research Papers", h: "/research" }, { n: "Events", h: "/event" }] },
            { heading: "Account", links: [{ n: "Sign Up", h: "/signup" }, { n: "Login", h: "/login" }, { n: "Dashboard", h: "/dashboard" }] },
            { heading: "Support", links: [{ n: "Help Center", h: "#" }, { n: "Privacy Policy", h: "#" }, { n: "Terms of Service", h: "#" }] },
          ].map((col) => (
            <div key={col.heading} className="footer-col">
              <h4>{col.heading}</h4>
              {col.links.map((l) => <a key={l.n} href={l.h}>{l.n}</a>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 BioConnect. Made with care for India's biotech community.</span>
          <span>Built in India 🇮🇳</span>
        </div>
      </footer>
    </main>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Instrument+Serif&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: #fafaf9; font-family: 'Outfit', sans-serif; color: #1c1917; overflow-x: hidden; }
::selection { background: rgba(13,148,136,0.3); }
a { text-decoration: none; color: inherit; }

/* ── Fade animation ── */
.fade-in { opacity: 0; transform: var(--from, translateY(40px)); transition: opacity 0.7s ease var(--delay, 0ms), transform 0.7s ease var(--delay, 0ms); }
.fade-in.visible { opacity: 1; transform: translate(0); }

/* ── Cursor blink ── */
.cursor { animation: blink 0.8s infinite; font-weight: 300; color: #0D9488; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Nav ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 68px;
  background: rgba(10,10,10,0.7); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.logo { display: flex; align-items: center; gap: 10px; }
.logo span { font-family: 'Instrument Serif', serif; font-size: 22px; color: #fff; }
.nav-links { display: flex; gap: 8px; }
.nav-links a { font-size: 14px; color: rgba(255,255,255,0.6); padding: 7px 14px; border-radius: 8px; transition: all 0.2s; font-weight: 400; }
.nav-links a:hover { color: #fff; background: rgba(255,255,255,0.08); }
.nav-cta { display: flex; align-items: center; gap: 10px; }
.nav-login { font-size: 14px; color: rgba(255,255,255,0.6); padding: 7px 14px; border-radius: 8px; transition: all 0.2s; }
.nav-login:hover { color: #fff; }
.nav-btn { font-size: 14px; font-weight: 500; color: #0a0a0a; background: #0D9488; padding: 9px 22px; border-radius: 10px; transition: all 0.2s; }
.nav-btn:hover { background: #0f766e; transform: translateY(-1px); }

/* ── Hero ── */
.hero {
  position: relative; min-height: 100vh; display: flex; align-items: center;
  padding: 100px 48px 80px; background: #0a0a0a; overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(13,148,136,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.1) 0%, transparent 50%);
}
.hero-grid { position: relative; display: flex; align-items: center; gap: 80px; width: 100%; max-width: 1280px; margin: 0 auto; }
.hero-left { flex: 1; min-width: 0; }
.hero-right { flex: 1; min-width: 0; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(13,148,136,0.12); border: 1px solid rgba(13,148,136,0.25);
  border-radius: 100px; padding: 8px 18px; font-size: 13px; color: #5eead4;
  font-weight: 500; margin-bottom: 28px;
}
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #0D9488; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(13,148,136,0.4)} 50%{box-shadow:0 0 0 8px rgba(13,148,136,0)} }
.hero-title {
  font-family: 'Instrument Serif', serif; font-size: 64px; line-height: 1.1;
  color: #fff; margin-bottom: 20px; min-height: 80px;
}
.hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 36px; max-width: 480px; font-weight: 300; }
.hero-btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
.btn-primary {
  background: #0D9488; color: #fff; padding: 14px 32px; border-radius: 12px;
  font-size: 15px; font-weight: 600; transition: all 0.2s; border: none; cursor: pointer; font-family: inherit;
}
.btn-primary:hover { background: #0f766e; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(13,148,136,0.3); }
.btn-ghost { color: rgba(255,255,255,0.6); padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 400; border: 1px solid rgba(255,255,255,0.12); transition: all 0.2s; }
.btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
.hero-stats { display: flex; align-items: center; gap: 24px; }
.hero-stat { display: flex; flex-direction: column; }
.hero-stat strong { font-size: 28px; font-weight: 700; color: #fff; font-family: 'Instrument Serif', serif; }
.hero-stat span { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 400; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
.hero-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.1); }

/* ── Hero visual (floating cards) ── */
.hero-visual { position: relative; height: 420px; }
.hero-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 70%);
  filter: blur(40px); animation: glowPulse 4s ease-in-out infinite;
}
@keyframes glowPulse { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)} }
.hero-card {
  position: absolute; display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px); border-radius: 14px; padding: 16px 20px;
  animation: float 6s ease-in-out infinite;
}
.hero-card strong { display: block; font-size: 14px; color: #fff; font-weight: 500; }
.hero-card span { font-size: 12px; color: rgba(255,255,255,0.45); }
.hc-icon { font-size: 28px; }
.hc1 { top: 40px; left: 20px; animation-delay: 0s; }
.hc2 { top: 180px; right: 0px; animation-delay: 1.5s; }
.hc3 { bottom: 40px; left: 40px; animation-delay: 3s; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

/* ── Sections ── */
.section-light { padding: 100px 48px; background: #fafaf9; }
.section-dark { padding: 100px 48px; background: #0a0a0a; }
.section-title { font-family: 'Instrument Serif', serif; font-size: 40px; text-align: center; margin-bottom: 12px; letter-spacing: -0.5px; }
.section-title.light { color: #fff; }
.section-sub { font-size: 16px; color: #78716c; text-align: center; margin-bottom: 56px; font-weight: 300; }
.section-sub.light { color: rgba(255,255,255,0.45); }

/* ── Bento grid ── */
.bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
.bento-card {
  background: #fff; border: 1px solid #e7e5e4; border-radius: 18px; padding: 32px 28px;
  transition: all 0.3s; cursor: default; position: relative; overflow: hidden;
}
.bento-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--accent, #0D9488); opacity: 0; transition: opacity 0.3s;
}
.bento-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.08); }
.bento-card:hover::before { opacity: 1; }
.bento-large { grid-column: span 2; }
.bento-icon { font-size: 32px; display: block; margin-bottom: 16px; }
.bento-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1c1917; }
.bento-card p { font-size: 14px; color: #78716c; line-height: 1.6; }

/* ── Steps ── */
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
.step-card {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px; padding: 36px 28px; transition: all 0.3s;
}
.step-card:hover { border-color: rgba(13,148,136,0.3); background: rgba(13,148,136,0.05); }
.step-num { font-family: 'Instrument Serif', serif; font-size: 48px; color: rgba(13,148,136,0.3); display: block; margin-bottom: 16px; }
.step-card h3 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 8px; }
.step-card p { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.6; font-weight: 300; }

/* ── Roles ── */
.roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
.role-card {
  background: #fff; border: 1px solid #e7e5e4; border-radius: 18px; padding: 36px 28px;
  transition: all 0.3s;
}
.role-card:hover { border-color: var(--rcbr); background: var(--rcbg); transform: translateY(-4px); }
.role-badge {
  display: inline-block; font-size: 13px; font-weight: 600; color: var(--rc);
  background: var(--rcbg); border: 1px solid var(--rcbr); border-radius: 100px;
  padding: 5px 16px; margin-bottom: 20px;
}
.role-desc { font-size: 14px; color: #78716c; line-height: 1.65; margin-bottom: 20px; }
.role-points { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.role-points li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #44403c; }
.role-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rc); flex-shrink: 0; }

/* ── CTA ── */
.cta-section {
  padding: 100px 48px; text-align: center;
  background: linear-gradient(135deg, #0D9488 0%, #0f766e 40%, #115e59 100%);
}
.cta-section h2 { font-family: 'Instrument Serif', serif; font-size: 40px; color: #fff; margin-bottom: 12px; }
.cta-section p { font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: 36px; font-weight: 300; }
.cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.cta-section .btn-primary { background: #fff; color: #0D9488; }
.cta-section .btn-primary:hover { background: #f0fdfa; box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
.btn-ghost-light { color: rgba(255,255,255,0.7); padding: 14px 28px; font-size: 15px; border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; transition: all 0.2s; }
.btn-ghost-light:hover { border-color: rgba(255,255,255,0.5); color: #fff; }

/* ── Footer ── */
.footer { background: #0a0a0a; padding: 64px 48px 32px; }
.footer-top { display: flex; gap: 60px; margin-bottom: 48px; max-width: 1100px; margin-left: auto; margin-right: auto; margin-bottom: 48px; }
.footer-brand { flex: 1.3; }
.footer-brand .logo span { color: #fff; }
.footer-brand p { font-size: 14px; color: #57534e; line-height: 1.7; margin-top: 14px; max-width: 260px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col h4 { font-size: 13px; font-weight: 600; color: #fff; letter-spacing: 0.5px; margin-bottom: 6px; }
.footer-col a { font-size: 14px; color: #57534e; transition: color 0.2s; }
.footer-col a:hover { color: #5eead4; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px;
  display: flex; justify-content: space-between; font-size: 13px; color: #44403c;
  max-width: 1100px; margin: 0 auto;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .nav { padding: 0 20px; }
  .nav-links { display: none; }
  .nav-cta .nav-login { display: none; }
  .hero { padding: 100px 20px 60px; }
  .hero-grid { flex-direction: column; gap: 40px; }
  .hero-title { font-size: 40px; }
  .hero-right { display: none; }
  .section-light, .section-dark { padding: 60px 20px; }
  .bento { grid-template-columns: 1fr; }
  .bento-large { grid-column: span 1; }
  .steps { grid-template-columns: 1fr; }
  .roles-grid { grid-template-columns: 1fr; }
  .cta-section { padding: 60px 20px; }
  .footer { padding: 40px 20px 24px; }
  .footer-top { flex-direction: column; gap: 32px; }
  .section-title { font-size: 30px; }
  .cta-section h2 { font-size: 30px; }
  .hero-stats { gap: 16px; }
  .hero-stat strong { font-size: 22px; }
}
`;
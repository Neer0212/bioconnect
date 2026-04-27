"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/* ── Scroll reveal ── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("vis"); }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function F({ children, d = 0, className = "" }) {
  const ref = useFadeIn();
  return <div ref={ref} className={`fi ${className}`} style={{ "--d": `${d}ms` }}>{children}</div>;
}

/* ── Counter ── */
function Counter({ target, suffix = "" }) {
  const [c, setC] = useState(0);
  const ref = useRef(null);
  const go = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !go.current) {
        go.current = true;
        const n = parseInt(target) || 0;
        const s = Math.max(1, Math.floor(n / 90));
        let cur = 0;
        const t = setInterval(() => { cur += s; if (cur >= n) { cur = n; clearInterval(t); } setC(cur); }, 16);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{c.toLocaleString()}{suffix}</span>;
}

/* ── Typewriter ── */
function Typer({ words }) {
  const [txt, setTxt] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[wi];
    const t = setTimeout(() => {
      if (!del) { setTxt(w.substring(0, ci + 1)); if (ci + 1 === w.length) setTimeout(() => setDel(true), 1800); else setCi(ci + 1); }
      else { setTxt(w.substring(0, ci)); if (ci === 0) { setDel(false); setWi((wi + 1) % words.length); } else setCi(ci - 1); }
    }, del ? 50 : 110);
    return () => clearTimeout(t);
  }, [ci, del, wi, words]);
  return <>{txt}<span className="caret">|</span></>;
}

export default function Home() {
  const [stats, setStats] = useState({ users: 0, papers: 0, events: 0 });
  useEffect(() => {
    async function load() {
      const sb = createClient();
      const [u, p, e] = await Promise.all([
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb.from("research_papers").select("id", { count: "exact", head: true }),
        sb.from("events").select("id", { count: "exact", head: true }),
      ]);
      setStats({ users: u.count || 0, papers: p.count || 0, events: e.count || 0 });
    }
    load();
  }, []);

  return (
    <main>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <a href="/" className="n-logo">
          <img src="/logo.jpg" alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
          <span>BioConnect</span>
        </a>
        <div className="n-links">
          <a href="#features">Features</a>
          <a href="#roles">For you</a>
          <a href="#how">How it works</a>
        </div>
        <div className="n-cta">
          <a href="/login" className="n-login">Login</a>
          <a href="/signup" className="n-btn">Get Started</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-orb orb1"></div>
        <div className="hero-orb orb2"></div>
        <div className="hero-orb orb3"></div>

        <F><div className="hero-badge"><span className="hb-dot"></span>India's Biotech Academic Platform</div></F>
        <F d={80}>
          <h1 className="hero-h1">
            The Platform Where<br />Biotech Students<br />
            <span className="hero-accent"><Typer words={["Learn Together.", "Grow Faster.", "Build Futures.", "Share Knowledge."]} /></span>
          </h1>
        </F>
        <F d={160}><p className="hero-p">Access study materials, explore research papers, and connect with educators and researchers — all in one platform built for India's biotech community.</p></F>
        <F d={240}>
          <div className="hero-btns">
            <a href="/signup" className="btn-solid">Join BioConnect — it's free</a>
            <a href="#features" className="btn-outline">Explore Features ↓</a>
          </div>
        </F>

        <F d={320}>
          <div className="stats-bar">
            <div className="sb"><strong><Counter target={stats.users} suffix="+" /></strong><span>Students & Educators</span></div>
            <div className="sb-div"></div>
            <div className="sb"><strong><Counter target={stats.papers} suffix="+" /></strong><span>Research Papers</span></div>
            <div className="sb-div"></div>
            <div className="sb"><strong><Counter target={6} /></strong><span>Subjects</span></div>
            <div className="sb-div"></div>
            <div className="sb"><strong><Counter target={stats.events} suffix="+" /></strong><span>Events</span></div>
          </div>
        </F>

        <F d={400}>
          <div className="hero-cards">
            <div className="hc hc1"><span>🧬</span><div><strong>Molecular Biology</strong><small>12 notes available</small></div></div>
            <div className="hc hc2"><span>📄</span><div><strong>New Paper Published</strong><small>CRISPR-Cas9 Variants</small></div></div>
            <div className="hc hc3"><span>📅</span><div><strong>Upcoming Event</strong><small>Biotech Conference 2026</small></div></div>
          </div>
        </F>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee">
          {["Molecular Biology", "Biochemistry", "Genetics", "Microbiology", "Bioinformatics", "Bioprocess Engineering", "CRISPR", "Genomics", "Proteomics", "Immunology", "Molecular Biology", "Biochemistry", "Genetics", "Microbiology", "Bioinformatics", "Bioprocess Engineering"].map((t, i) => (
            <span key={i} className="marquee-item">✦ {t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="sec">
        <F><h2 className="sec-h2">Everything you need,<br /><span className="accent">in one place</span></h2></F>
        <F d={50}><p className="sec-p">Comprehensive tools designed specifically for India's biotech community</p></F>
        <div className="feat-grid">
          {[
            { icon: "🧬", t: "Learning Hub", d: "Subject-wise PDF notes and study materials uploaded by educators. Access content anytime, anywhere.", tag: "Most Popular" },
            { icon: "📄", t: "Research Papers", d: "Browse and share scientific publications with metadata, abstracts, and direct links." },
            { icon: "📅", t: "Events & Conferences", d: "Stay updated on webinars, workshops, hackathons, and conferences happening across India." },
            { icon: "👤", t: "Role-Based Profiles", d: "Tailored dashboards and experiences for students, educators, and researchers." },
            { icon: "🔬", t: "Academic Ecosystem", d: "One platform connecting India's entire biotech community — from classrooms to labs." },
            { icon: "🔒", t: "Secure & Private", d: "Your data stays yours. Role-based access control on all content and uploads." },
          ].map((f, i) => (
            <F key={f.t} d={i * 70}>
              <div className="feat-card">
                {f.tag && <span className="feat-tag">{f.tag}</span>}
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="sec">
        <F><h2 className="sec-h2">Get started in<br /><span className="accent">3 simple steps</span></h2></F>
        <div className="steps">
          {[
            { n: "01", t: "Create your account", d: "Sign up in 30 seconds. Choose your role — student, educator, or researcher.", icon: "✍️" },
            { n: "02", t: "Explore the platform", d: "Browse study materials, research papers, and upcoming biotech events.", icon: "🔍" },
            { n: "03", t: "Start contributing", d: "Upload notes, share research, register for events, and grow your network.", icon: "🚀" },
          ].map((s, i) => (
            <F key={s.n} d={i * 120}>
              <div className="step-card">
                <div className="step-top">
                  <span className="step-icon">{s.icon}</span>
                  <span className="step-n">{s.n}</span>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="sec">
        <F><h2 className="sec-h2">Built for <span className="accent">every role</span><br />in biotech</h2></F>
        <F d={50}><p className="sec-p">Tailored experiences that meet you where you are</p></F>
        <div className="roles-grid">
          {[
            { l: "Students", emoji: "🎓", c: "#F97316", pts: ["Subject-wise notes", "Research access", "Event discovery", "Peer community"], d: "Access learning resources, find study materials, and build your academic foundation." },
            { l: "Educators", emoji: "📚", c: "#06B6D4", pts: ["Upload materials", "Publish research", "Host events", "Track engagement"], d: "Upload content, share knowledge, and connect with students across universities." },
            { l: "Researchers", emoji: "🔬", c: "#A855F7", pts: ["Share papers", "Find collaborators", "Conference updates", "Grant opportunities"], d: "Share findings, collaborate on projects, and stay updated with the latest publications." },
          ].map((r, i) => (
            <F key={r.l} d={i * 100}>
              <div className="role-card" style={{ "--rc": r.c }}>
                <div className="role-emoji">{r.emoji}</div>
                <span className="role-badge">{r.l}</span>
                <p className="role-d">{r.d}</p>
                <ul>{r.pts.map(p => <li key={p}><span className="role-dot"></span>{p}</li>)}</ul>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="cta-orb"></div>
        <F>
          <h2>Ready to start your<br />biotech journey?</h2>
          <p>Join students, educators, and researchers across India</p>
          <div className="cta-btns">
            <a href="/signup" className="btn-solid-light">Get Started Free →</a>
            <a href="/login" className="btn-outline-light">Already have an account?</a>
          </div>
        </F>
      </section>

      {/* ── FOOTER ── */}
      <footer className="foot">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="n-logo"><img src="/logo.jpg" alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover" }} /><span>BioConnect</span></div>
            <p>Connecting India's biotech community — students, educators, researchers, and industry.</p>
          </div>
          {[
            { h: "Platform", links: [["Learning Hub", "/learning"], ["Research Papers", "/research"], ["Events", "/event"]] },
            { h: "Account", links: [["Sign Up", "/signup"], ["Login", "/login"], ["Dashboard", "/dashboard"]] },
            { h: "Support", links: [["Help Center", "#"], ["Privacy Policy", "#"], ["Terms of Service", "#"]] },
          ].map(col => (
            <div key={col.h} className="foot-col">
              <h4>{col.h}</h4>
              {col.links.map(([n, h]) => <a key={n} href={h}>{n}</a>)}
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <span>© 2026 BioConnect. Made with care for India's biotech community.</span>
          <span>Built in India 🇮🇳</span>
        </div>
      </footer>
    </main>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;color:#e2e8f0;overflow-x:hidden;background:#080B16}
::selection{background:rgba(249,115,22,0.3)}
a{text-decoration:none;color:inherit}

/* ── Fade ── */
.fi{opacity:0;transform:translateY(32px);transition:opacity .7s ease var(--d,0ms),transform .7s ease var(--d,0ms)}
.fi.vis{opacity:1;transform:translateY(0)}

.caret{color:#F97316;animation:blink .8s infinite;font-weight:300}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

.accent{color:#F97316}

/* ── Nav ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:68px;
  background:rgba(8,11,22,0.75);backdrop-filter:blur(24px);
  border-bottom:1px solid rgba(255,255,255,0.04);
}
.n-logo{display:flex;align-items:center;gap:10px}
.n-logo span{font-family:'Instrument Serif',serif;font-size:22px;color:#fff}
.n-links{display:flex;gap:4px}
.n-links a{font-size:14px;color:rgba(255,255,255,0.45);padding:8px 16px;border-radius:10px;transition:all .2s;font-weight:400}
.n-links a:hover{color:#F97316;background:rgba(249,115,22,0.08)}
.n-cta{display:flex;align-items:center;gap:10px}
.n-login{font-size:14px;color:rgba(255,255,255,0.45);padding:8px 16px;border-radius:10px;transition:all .2s}
.n-login:hover{color:#F97316}
.n-btn{
  font-size:14px;font-weight:600;color:#fff;
  background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);
  padding:10px 24px;border-radius:12px;transition:all .2s;
}
.n-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(249,115,22,0.35)}

/* ── Hero ── */
.hero{
  position:relative;min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
  padding:120px 48px 60px;overflow:hidden;
  background:linear-gradient(180deg,#080B16 0%,#0E1225 40%,#131835 100%);
}
.hero::before{
  content:'';position:absolute;inset:0;
  background-image:radial-gradient(circle at 1px 1px,rgba(249,115,22,0.03) 1px,transparent 0);
  background-size:48px 48px;pointer-events:none;
}

.hero-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;opacity:0.4}
.orb1{width:600px;height:600px;background:rgba(249,115,22,0.12);top:-150px;right:-150px;animation:drift 14s ease-in-out infinite}
.orb2{width:500px;height:500px;background:rgba(99,102,241,0.1);bottom:-100px;left:-120px;animation:drift 18s ease-in-out infinite reverse}
.orb3{width:350px;height:350px;background:rgba(168,85,247,0.08);top:35%;left:55%;animation:drift 11s ease-in-out infinite 3s}
@keyframes drift{0%,100%{transform:translate(0,0)}33%{transform:translate(30px,-20px)}66%{transform:translate(-20px,15px)}}

.hero-badge{
  display:inline-flex;align-items:center;gap:8px;position:relative;
  background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.18);
  border-radius:100px;padding:8px 20px;font-size:13px;color:#FB923C;font-weight:500;margin-bottom:32px;
}
.hb-dot{width:8px;height:8px;border-radius:50%;background:#F97316;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)}50%{box-shadow:0 0 0 8px rgba(249,115,22,0)}}

.hero-h1{
  font-family:'Instrument Serif',serif;font-size:62px;line-height:1.1;
  color:#fff;margin-bottom:24px;letter-spacing:-1.5px;position:relative;
}
.hero-accent{
  background:linear-gradient(135deg,#F97316,#FBBF24);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.hero-p{font-size:18px;color:rgba(255,255,255,0.4);line-height:1.7;max-width:560px;margin:0 auto 40px;font-weight:300;position:relative}

.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:48px;position:relative}
.btn-solid{
  background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);color:#fff;
  padding:15px 34px;border-radius:14px;font-size:15px;font-weight:600;
  transition:all .25s;border:none;cursor:pointer;font-family:inherit;
}
.btn-solid:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(249,115,22,0.4)}
.btn-outline{
  color:rgba(255,255,255,0.6);padding:15px 28px;border-radius:14px;font-size:15px;font-weight:500;
  border:1.5px solid rgba(255,255,255,0.1);transition:all .25s;background:transparent;
}
.btn-outline:hover{border-color:rgba(249,115,22,0.4);color:#F97316}

/* Stats bar */
.stats-bar{
  display:flex;align-items:center;gap:32px;position:relative;
  background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,0.06);border-radius:20px;
  padding:24px 48px;margin-bottom:56px;
}
.sb{display:flex;flex-direction:column;align-items:center}
.sb strong{font-size:30px;font-weight:700;color:#fff;font-family:'Instrument Serif',serif}
.sb span{font-size:11px;color:rgba(255,255,255,0.35);font-weight:500;text-transform:uppercase;letter-spacing:1.2px;margin-top:4px}
.sb-div{width:1px;height:36px;background:rgba(255,255,255,0.06)}

/* Hero cards */
.hero-cards{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin:0 auto;max-width:900px;position:relative}
.hc{
  display:flex;align-items:center;gap:12px;
  background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
  backdrop-filter:blur(16px);border-radius:16px;padding:16px 22px;
  box-shadow:0 8px 32px rgba(0,0,0,0.2);
}
.hc span{font-size:28px}
.hc strong{display:block;font-size:14px;color:#fff;font-weight:600}
.hc small{font-size:12px;color:rgba(255,255,255,0.35)}
.hc1{animation:fl 5s ease-in-out infinite}
.hc2{animation:fl 5s ease-in-out 1.5s infinite}
.hc3{animation:fl 5s ease-in-out 3s infinite}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

/* ── Marquee ── */
.marquee-wrap{
  overflow:hidden;padding:20px 0;
  background:linear-gradient(90deg,rgba(249,115,22,0.06),rgba(168,85,247,0.06),rgba(249,115,22,0.06));
  border-top:1px solid rgba(255,255,255,0.04);
  border-bottom:1px solid rgba(255,255,255,0.04);
}
.marquee{display:flex;gap:32px;animation:scroll 30s linear infinite;white-space:nowrap}
.marquee-item{font-size:14px;color:rgba(249,115,22,0.5);font-weight:500;letter-spacing:1px}
@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* ── Sections ── */
.sec{padding:100px 48px;max-width:1200px;margin:0 auto}
.sec-h2{font-family:'Instrument Serif',serif;font-size:44px;text-align:center;margin-bottom:14px;color:#fff;letter-spacing:-0.5px;line-height:1.15}
.sec-p{font-size:16px;color:rgba(255,255,255,0.35);text-align:center;margin-bottom:56px;font-weight:300}

/* ── Features ── */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.feat-card{
  position:relative;
  background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);
  border-radius:20px;padding:32px 28px;transition:all .3s;overflow:hidden;
  height:100%;display:flex;flex-direction:column;
}
.feat-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(249,115,22,0.1);border-color:rgba(249,115,22,0.2);background:rgba(255,255,255,0.05)}
.feat-card::after{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,#F97316,#FBBF24);opacity:0;transition:opacity .3s;
}
.feat-card:hover::after{opacity:1}
.feat-tag{
  position:absolute;top:16px;right:16px;font-size:11px;font-weight:600;
  color:#F97316;background:rgba(249,115,22,0.1);padding:4px 12px;border-radius:100px;
}
.feat-icon{font-size:32px;margin-bottom:18px;display:block}
.feat-card h3{font-size:18px;font-weight:600;margin-bottom:8px;color:#fff}
.feat-card p{font-size:14px;color:rgba(255,255,255,0.4);line-height:1.65;flex:1}

/* ── Steps ── */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.step-card{
  background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);
  border-radius:20px;padding:36px 28px;transition:all .3s;
}
.step-card:hover{border-color:rgba(249,115,22,0.2);box-shadow:0 12px 36px rgba(249,115,22,0.08);background:rgba(255,255,255,0.05)}
.step-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.step-icon{font-size:36px}
.step-n{font-family:'Instrument Serif',serif;font-size:48px;color:rgba(249,115,22,0.15);line-height:1}
.step-card h3{font-size:18px;font-weight:600;color:#fff;margin-bottom:8px}
.step-card p{font-size:14px;color:rgba(255,255,255,0.4);line-height:1.65;font-weight:300}

/* ── Roles ── */
.roles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.role-card{
  background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);
  border-radius:20px;padding:36px 28px;transition:all .3s;
  height:100%;display:flex;flex-direction:column;
}
.role-card:hover{transform:translateY(-4px);border-color:var(--rc);box-shadow:0 16px 40px rgba(0,0,0,0.2)}
.role-emoji{font-size:40px;margin-bottom:16px}
.role-badge{
  display:inline-block;font-size:13px;font-weight:600;color:var(--rc);
  background:color-mix(in srgb,var(--rc) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--rc) 20%,transparent);
  border-radius:100px;padding:6px 18px;margin-bottom:16px;width:fit-content;
}
.role-d{font-size:14px;color:rgba(255,255,255,0.4);line-height:1.65;margin-bottom:20px;flex:1}
.role-card ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.role-card li{display:flex;align-items:center;gap:10px;font-size:14px;color:rgba(255,255,255,0.55)}
.role-dot{width:7px;height:7px;border-radius:50%;background:var(--rc);flex-shrink:0}

/* ── CTA ── */
.cta{
  position:relative;padding:100px 48px;text-align:center;overflow:hidden;
  background:linear-gradient(135deg,#1a0a00 0%,#2d1200 40%,#1a0a00 100%);
  border:1px solid rgba(249,115,22,0.1);
  border-radius:32px;margin:0 24px 24px;
}
.cta-orb{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%);
  filter:blur(60px);pointer-events:none;
}
.cta h2{font-family:'Instrument Serif',serif;font-size:44px;color:#fff;margin-bottom:14px;position:relative;line-height:1.15}
.cta p{font-size:16px;color:rgba(255,255,255,0.45);margin-bottom:36px;font-weight:300;position:relative}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative}
.btn-solid-light{
  background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);color:#fff;
  padding:15px 34px;border-radius:14px;font-size:15px;font-weight:600;transition:all .25s;
}
.btn-solid-light:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(249,115,22,0.5)}
.btn-outline-light{
  color:rgba(255,255,255,0.5);padding:15px 28px;border-radius:14px;font-size:15px;
  border:1px solid rgba(255,255,255,0.1);transition:all .25s;
}
.btn-outline-light:hover{border-color:rgba(249,115,22,0.4);color:#F97316}

/* ── Footer ── */
.foot{padding:64px 48px 32px;background:#060912;border-top:1px solid rgba(255,255,255,0.04)}
.foot-top{display:flex;gap:60px;max-width:1100px;margin:0 auto 48px}
.foot-brand{flex:1.3}
.foot-brand p{font-size:14px;color:rgba(255,255,255,0.25);line-height:1.7;margin-top:14px;max-width:260px}
.foot-col{display:flex;flex-direction:column;gap:10px}
.foot-col h4{font-size:13px;font-weight:600;color:#fff;letter-spacing:0.5px;margin-bottom:6px}
.foot-col a{font-size:14px;color:rgba(255,255,255,0.25);transition:color .2s}
.foot-col a:hover{color:#F97316}
.foot-bot{
  border-top:1px solid rgba(255,255,255,0.04);padding-top:24px;
  display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,0.2);
  max-width:1100px;margin:0 auto;
}

/* ── Mobile ── */
@media(max-width:768px){
  .nav{padding:0 20px}
  .n-links{display:none}
  .n-cta .n-login{display:none}
  .hero{padding:100px 20px 60px}
  .hero-h1{font-size:38px}
  .hero-cards{display:none}
  .stats-bar{padding:20px 24px;gap:16px;flex-wrap:wrap;justify-content:center}
  .sb strong{font-size:22px}
  .marquee-wrap{padding:14px 0}
  .sec{padding:60px 20px}
  .sec-h2{font-size:32px}
  .feat-grid,.steps,.roles-grid{grid-template-columns:1fr}
  .cta{padding:60px 20px;margin:0 12px 12px;border-radius:20px}
  .cta h2{font-size:32px}
  .foot{padding:40px 20px 24px}
  .foot-top{flex-direction:column;gap:32px}
}
`;
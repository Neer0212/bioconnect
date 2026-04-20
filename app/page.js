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
        <div className="hero-rays"></div>
        <F><div className="hero-badge"><span className="hb-dot"></span>India's Biotech Academic Platform</div></F>
        <F d={80}>
          <h1 className="hero-h1">
            The Modern Platform for<br />
            <span className="hero-accent"><Typer words={["Smarter Learning.", "Better Research.", "Real Collaboration."]} /></span>
          </h1>
        </F>
        <F d={160}><p className="hero-p">Access study materials, explore research papers, and connect with biotech students, educators, and researchers — all in one unified platform built for India.</p></F>
        <F d={240}>
          <div className="hero-btns">
            <a href="/signup" className="btn-solid">Join BioConnect — it's free</a>
            <a href="#features" className="btn-outline">Explore Features</a>
          </div>
        </F>
        <F d={320}>
          <div className="hero-stats">
            <div className="hs"><strong><Counter target={stats.users} suffix="+" /></strong><span>Users</span></div>
            <div className="hs-div"></div>
            <div className="hs"><strong><Counter target={stats.papers} suffix="+" /></strong><span>Papers</span></div>
            <div className="hs-div"></div>
            <div className="hs"><strong>6</strong><span>Subjects</span></div>
            <div className="hs-div"></div>
            <div className="hs"><strong><Counter target={stats.events} suffix="+" /></strong><span>Events</span></div>
          </div>
        </F>

        {/* Floating product preview */}
        <F d={400}>
          <div className="hero-preview">
            <div className="hp-card hp1"><span>🧬</span><div><strong>Molecular Biology</strong><small>12 notes available</small></div></div>
            <div className="hp-card hp2"><span>📄</span><div><strong>New Paper Published</strong><small>CRISPR-Cas9 Variants</small></div></div>
            <div className="hp-card hp3"><span>📅</span><div><strong>Upcoming Event</strong><small>Biotech Conference 2026</small></div></div>
          </div>
        </F>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="sec">
        <F><h2 className="sec-h2">Everything you need, in one place</h2></F>
        <F d={50}><p className="sec-p">Comprehensive tools designed specifically for India's biotech community</p></F>
        <div className="feat-grid">
          {[
            { icon: "🧬", t: "Learning Hub", d: "Subject-wise PDF notes and study materials uploaded by educators. Access content anytime, anywhere." },
            { icon: "📄", t: "Research Papers", d: "Browse and share scientific publications with metadata, links, and abstracts." },
            { icon: "📅", t: "Events & Conferences", d: "Stay updated on webinars, workshops, hackathons, and conferences." },
            { icon: "👤", t: "Role-Based Profiles", d: "Tailored dashboards for students, educators, and researchers." },
            { icon: "🔬", t: "Academic Ecosystem", d: "One platform connecting India's entire biotech community — from classrooms to labs." },
            { icon: "🔒", t: "Secure & Private", d: "Your data stays yours. Role-based access control on all content." },
          ].map((f, i) => (
            <F key={f.t} d={i * 60}>
              <div className="feat-card">
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
        <F><h2 className="sec-h2">How it works</h2></F>
        <F d={50}><p className="sec-p">Get started in 3 simple steps</p></F>
        <div className="steps-grid">
          {[
            { n: "01", t: "Create your account", d: "Sign up in 30 seconds. Choose your role — student, educator, or researcher." },
            { n: "02", t: "Explore the platform", d: "Browse study materials, research papers, and upcoming biotech events." },
            { n: "03", t: "Start contributing", d: "Upload notes, share research, register for events, and grow your network." },
          ].map((s, i) => (
            <F key={s.n} d={i * 100}>
              <div className="step-card">
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="sec">
        <F><h2 className="sec-h2">Built for every role in biotech</h2></F>
        <F d={50}><p className="sec-p">Tailored experiences that meet you where you are</p></F>
        <div className="roles-grid">
          {[
            { l: "Students", c: "#7c3aed", pts: ["Subject-wise notes", "Research access", "Event discovery", "Peer community"], d: "Access learning resources, find study materials, and build your academic foundation." },
            { l: "Educators", c: "#0D9488", pts: ["Upload materials", "Publish research", "Host events", "Track engagement"], d: "Upload content, share knowledge, and connect with students across universities." },
            { l: "Researchers", c: "#d97706", pts: ["Share papers", "Find collaborators", "Conference updates", "Grant opportunities"], d: "Share findings, collaborate on projects, and stay updated with publications." },
          ].map((r, i) => (
            <F key={r.l} d={i * 100}>
              <div className="role-card" style={{ "--rc": r.c }}>
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
        <F>
          <h2>Ready to transform your biotech journey?</h2>
          <p>Join students, educators, and researchers across India</p>
          <div className="cta-btns">
            <a href="/signup" className="btn-solid">Get Started Free</a>
            <a href="/login" className="btn-outline">Already have an account?</a>
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
body{font-family:'Plus Jakarta Sans',sans-serif;color:#1e1b4b;overflow-x:hidden;
  background:linear-gradient(180deg,#ede9fe 0%,#e0e7ff 30%,#f5f3ff 60%,#faf5ff 100%);
  background-attachment:fixed;
}
::selection{background:rgba(124,58,237,0.2)}
a{text-decoration:none;color:inherit}

/* ── Fade ── */
.fi{opacity:0;transform:translateY(32px);transition:opacity .7s ease var(--d,0ms),transform .7s ease var(--d,0ms)}
.fi.vis{opacity:1;transform:translateY(0)}

/* ── Caret ── */
.caret{color:#7c3aed;animation:blink .8s infinite;font-weight:300}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

/* ── Nav ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:68px;
  background:rgba(237,233,254,0.6);backdrop-filter:blur(24px);
  border-bottom:1px solid rgba(124,58,237,0.08);
}
.n-logo{display:flex;align-items:center;gap:10px}
.n-logo span{font-family:'Instrument Serif',serif;font-size:22px;color:#1e1b4b}
.n-links{display:flex;gap:6px}
.n-links a{font-size:14px;color:#6b7280;padding:8px 16px;border-radius:10px;transition:all .2s;font-weight:400}
.n-links a:hover{color:#7c3aed;background:rgba(124,58,237,0.06)}
.n-cta{display:flex;align-items:center;gap:10px}
.n-login{font-size:14px;color:#6b7280;padding:8px 16px;border-radius:10px;transition:all .2s}
.n-login:hover{color:#7c3aed}
.n-btn{font-size:14px;font-weight:600;color:#fff;background:#7c3aed;padding:10px 24px;border-radius:12px;transition:all .2s}
.n-btn:hover{background:#6d28d9;transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,58,237,0.25)}

/* ── Hero ── */
.hero{
  position:relative;min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
  padding:120px 48px 80px;overflow:hidden;
}
.hero-rays{
  position:absolute;top:-200px;left:50%;transform:translateX(-50%);
  width:1200px;height:800px;
  background:radial-gradient(ellipse at center,rgba(124,58,237,0.12) 0%,rgba(99,102,241,0.08) 30%,transparent 70%);
  pointer-events:none;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.15);
  border-radius:100px;padding:8px 20px;font-size:13px;color:#7c3aed;font-weight:500;margin-bottom:32px;
}
.hb-dot{width:8px;height:8px;border-radius:50%;background:#7c3aed;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.3)}50%{box-shadow:0 0 0 8px rgba(124,58,237,0)}}

.hero-h1{font-family:'Instrument Serif',serif;font-size:60px;line-height:1.12;color:#1e1b4b;margin-bottom:24px;letter-spacing:-1px}
.hero-accent{color:#7c3aed;display:inline}
.hero-p{font-size:18px;color:#6b7280;line-height:1.7;max-width:580px;margin:0 auto 40px;font-weight:300}

.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
.btn-solid{
  background:#7c3aed;color:#fff;padding:14px 32px;border-radius:14px;
  font-size:15px;font-weight:600;transition:all .25s;border:none;cursor:pointer;font-family:inherit;
}
.btn-solid:hover{background:#6d28d9;transform:translateY(-2px);box-shadow:0 12px 32px rgba(124,58,237,0.3)}
.btn-outline{
  color:#7c3aed;padding:14px 28px;border-radius:14px;font-size:15px;font-weight:500;
  border:1.5px solid rgba(124,58,237,0.2);transition:all .25s;background:rgba(255,255,255,0.5);
}
.btn-outline:hover{border-color:#7c3aed;background:rgba(124,58,237,0.05)}

.hero-stats{display:flex;align-items:center;gap:28px;margin-bottom:56px}
.hs{display:flex;flex-direction:column;align-items:center}
.hs strong{font-size:32px;font-weight:700;color:#1e1b4b;font-family:'Instrument Serif',serif}
.hs span{font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px}
.hs-div{width:1px;height:32px;background:rgba(124,58,237,0.12)}

/* ── Hero preview cards ── */
.hero-preview{position:relative;width:100%;max-width:700px;height:200px;margin:0 auto}
.hp-card{
  position:absolute;display:flex;align-items:center;gap:12px;
  background:rgba(255,255,255,0.7);border:1px solid rgba(124,58,237,0.1);
  backdrop-filter:blur(16px);border-radius:16px;padding:16px 22px;
  box-shadow:0 8px 32px rgba(124,58,237,0.08);
  animation:fl 5s ease-in-out infinite;
}
.hp-card span{font-size:28px}
.hp-card strong{display:block;font-size:14px;color:#1e1b4b;font-weight:600}
.hp-card small{font-size:12px;color:#9ca3af}
.hp1{top:0;left:0;animation-delay:0s}
.hp2{top:20px;right:0;animation-delay:1.5s}
.hp3{bottom:0;left:50%;transform:translateX(-50%);animation-delay:3s}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hp3{animation:fl3 5s ease-in-out 3s infinite}
@keyframes fl3{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-10px)}}

/* ── Sections ── */
.sec{padding:100px 48px;max-width:1200px;margin:0 auto}
.sec-h2{font-family:'Instrument Serif',serif;font-size:42px;text-align:center;margin-bottom:14px;color:#1e1b4b;letter-spacing:-0.5px}
.sec-p{font-size:16px;color:#9ca3af;text-align:center;margin-bottom:56px;font-weight:300}

/* ── Features ── */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.feat-card{
  background:rgba(255,255,255,0.55);border:1px solid rgba(124,58,237,0.08);
  border-radius:20px;padding:32px 28px;transition:all .3s;backdrop-filter:blur(8px);
}
.feat-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.15);background:rgba(255,255,255,0.8)}
.feat-icon{font-size:32px;margin-bottom:18px;display:block}
.feat-card h3{font-size:18px;font-weight:600;margin-bottom:8px;color:#1e1b4b}
.feat-card p{font-size:14px;color:#6b7280;line-height:1.65}

/* ── Steps ── */
.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.step-card{
  background:rgba(255,255,255,0.5);border:1px solid rgba(124,58,237,0.08);
  border-radius:20px;padding:36px 28px;transition:all .3s;backdrop-filter:blur(8px);
}
.step-card:hover{border-color:rgba(124,58,237,0.2);background:rgba(255,255,255,0.75)}
.step-n{font-family:'Instrument Serif',serif;font-size:52px;color:rgba(124,58,237,0.2);display:block;margin-bottom:16px;line-height:1}
.step-card h3{font-size:18px;font-weight:600;color:#1e1b4b;margin-bottom:8px}
.step-card p{font-size:14px;color:#6b7280;line-height:1.65;font-weight:300}

/* ── Roles ── */
.roles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.role-card{
  background:rgba(255,255,255,0.55);border:1px solid rgba(124,58,237,0.08);
  border-radius:20px;padding:36px 28px;transition:all .3s;backdrop-filter:blur(8px);
}
.role-card:hover{transform:translateY(-4px);border-color:var(--rc);box-shadow:0 16px 40px rgba(0,0,0,0.06)}
.role-badge{
  display:inline-block;font-size:13px;font-weight:600;color:var(--rc);
  background:color-mix(in srgb,var(--rc) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--rc) 20%,transparent);
  border-radius:100px;padding:6px 18px;margin-bottom:20px;
}
.role-d{font-size:14px;color:#6b7280;line-height:1.65;margin-bottom:20px}
.role-card ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.role-card li{display:flex;align-items:center;gap:10px;font-size:14px;color:#4b5563}
.role-dot{width:7px;height:7px;border-radius:50%;background:var(--rc);flex-shrink:0}

/* ── CTA ── */
.cta{
  padding:100px 48px;text-align:center;
  background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 40%,#5b21b6 100%);
  border-radius:32px;margin:0 24px 24px;
}
.cta h2{font-family:'Instrument Serif',serif;font-size:42px;color:#fff;margin-bottom:14px}
.cta p{font-size:16px;color:rgba(255,255,255,0.65);margin-bottom:36px;font-weight:300}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.cta .btn-solid{background:#fff;color:#7c3aed}
.cta .btn-solid:hover{background:#f5f3ff;box-shadow:0 12px 32px rgba(0,0,0,0.15)}
.cta .btn-outline{color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.2);background:transparent}
.cta .btn-outline:hover{border-color:rgba(255,255,255,0.5);color:#fff}

/* ── Footer ── */
.foot{padding:64px 48px 32px;background:#0f0a1e}
.foot-top{display:flex;gap:60px;margin-bottom:48px;max-width:1100px;margin-left:auto;margin-right:auto;margin-bottom:48px}
.foot-brand{flex:1.3}
.foot-brand .n-logo span{color:#fff}
.foot-brand p{font-size:14px;color:#6b7280;line-height:1.7;margin-top:14px;max-width:260px}
.foot-col{display:flex;flex-direction:column;gap:10px}
.foot-col h4{font-size:13px;font-weight:600;color:#fff;letter-spacing:0.5px;margin-bottom:6px}
.foot-col a{font-size:14px;color:#6b7280;transition:color .2s}
.foot-col a:hover{color:#a78bfa}
.foot-bot{
  border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;
  display:flex;justify-content:space-between;font-size:13px;color:#4b5563;
  max-width:1100px;margin:0 auto;
}

/* ── Mobile ── */
@media(max-width:768px){
  .nav{padding:0 20px}
  .n-links{display:none}
  .n-cta .n-login{display:none}
  .hero{padding:100px 20px 60px}
  .hero-h1{font-size:36px}
  .hero-preview{display:none}
  .hero-stats{gap:16px;flex-wrap:wrap;justify-content:center}
  .hs strong{font-size:24px}
  .sec{padding:60px 20px}
  .sec-h2{font-size:30px}
  .feat-grid,.steps-grid,.roles-grid{grid-template-columns:1fr}
  .cta{padding:60px 20px;margin:0 12px 12px;border-radius:20px}
  .cta h2{font-size:30px}
  .foot{padding:40px 20px 24px}
  .foot-top{flex-direction:column;gap:32px}
}
`;
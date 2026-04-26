"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/* ── Scroll reveal ── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("vis"); },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function F({ children, d = 0, className = "" }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className={`fi ${className}`} style={{ "--d": `${d}ms` }}>
      {children}
    </div>
  );
}

/* ── Counter ── */
function Counter({ target, suffix = "" }) {
  const [c, setC] = useState(0);
  const ref = useRef(null);
  const go = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !go.current) {
          go.current = true;
          const n = parseInt(target) || 0;
          if (n === 0) { setC(0); return; }
          const s = Math.max(1, Math.floor(n / 80));
          let cur = 0;
          const t = setInterval(() => {
            cur += s;
            if (cur >= n) { cur = n; clearInterval(t); }
            setC(cur);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
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
      if (!del) {
        setTxt(w.substring(0, ci + 1));
        if (ci + 1 === w.length) setTimeout(() => setDel(true), 2000);
        else setCi(ci + 1);
      } else {
        setTxt(w.substring(0, ci));
        if (ci === 0) { setDel(false); setWi((wi + 1) % words.length); }
        else setCi(ci - 1);
      }
    }, del ? 45 : 100);
    return () => clearTimeout(t);
  }, [ci, del, wi, words]);
  return <>{txt}<span className="caret">|</span></>;
}

/* ── Marquee strip ── */
const MARQUEE_ITEMS = [
  "🧬 Molecular Biology", "📐 Bioinformatics", "🌿 Botany", "🔬 Microbiology",
  "🧪 Biochemistry", "🦠 Virology", "📊 Biostatistics", "🌱 Ecology",
  "🧬 Molecular Biology", "📐 Bioinformatics", "🌿 Botany", "🔬 Microbiology",
  "🧪 Biochemistry", "🦠 Virology", "📊 Biostatistics", "🌱 Ecology",
];

export default function Home() {
  const [stats, setStats] = useState({ users: 0, papers: 0, events: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* ── NOISE OVERLAY ── */}
      <div className="noise" aria-hidden="true" />

      {/* ── NAV ── */}
      <nav className="nav">
        <a href="/" className="n-logo">
          <img src="/logo.jpg" alt="BioConnect" />
          <span>BioConnect</span>
        </a>
        <div className={`n-links ${menuOpen ? "open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#roles" onClick={() => setMenuOpen(false)}>For You</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Community</a>
        </div>
        <div className="n-cta">
          <a href="/login" className="n-login">Login</a>
          <a href="/signup" className="n-btn">Get Started →</a>
        </div>
        <button className="n-hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-blob b1" />
        <div className="hero-blob b2" />
        <div className="hero-blob b3" />

        <div className="hero-inner">
          <div className="hero-left">
            <F>
              <div className="hero-eyebrow">
                <span className="eyebrow-dot" />
                India's #1 Biotech Academic Platform
              </div>
            </F>
            <F d={100}>
              <h1 className="hero-h1">
                Your Biotech<br />
                Journey Starts<br />
                <span className="hero-accent">
                  <Typer words={["Here. 🧬", "Today. 🚀", "Together. 🤝"]} />
                </span>
              </h1>
            </F>
            <F d={200}>
              <p className="hero-sub">
                Notes, research papers, events, and a community of biotech students across India —
                all in one place built just for you.
              </p>
            </F>
            <F d={300}>
              <div className="hero-actions">
                <a href="/signup" className="btn-primary">
                  Join Free — No Credit Card
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="#features" className="btn-ghost">See what's inside</a>
              </div>
            </F>
            <F d={400}>
              <div className="hero-proof">
                <div className="proof-avatars">
                  {["A","B","C","D","E"].map((l,i) => (
                    <div key={l} className="avatar" style={{"--i":i}}>{l}</div>
                  ))}
                </div>
                <p>Join <strong>500+</strong> biotech students already on the platform</p>
              </div>
            </F>
          </div>

          <div className="hero-right">
            <F d={200}>
              <div className="hero-card-stack">
                {/* Main dashboard card */}
                <div className="hc-main">
                  <div className="hc-header">
                    <div className="hc-dots"><span/><span/><span/></div>
                    <span className="hc-title">📚 My Study Hub</span>
                  </div>
                  <div className="hc-subjects">
                    {[
                      { icon: "🧬", name: "Molecular Biology", progress: 72, color: "#10b981" },
                      { icon: "🧪", name: "Biochemistry", progress: 55, color: "#f59e0b" },
                      { icon: "🦠", name: "Microbiology", progress: 88, color: "#6366f1" },
                    ].map(s => (
                      <div className="hc-subject" key={s.name}>
                        <span className="hc-subj-icon">{s.icon}</span>
                        <div className="hc-subj-info">
                          <span>{s.name}</span>
                          <div className="hc-bar"><div className="hc-fill" style={{width: `${s.progress}%`, background: s.color}} /></div>
                        </div>
                        <span className="hc-pct" style={{color: s.color}}>{s.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating notification cards */}
                <div className="hc-notif n1">
                  <span>📄</span>
                  <div>
                    <strong>New Paper</strong>
                    <small>CRISPR-Cas9 Study</small>
                  </div>
                </div>
                <div className="hc-notif n2">
                  <span>📅</span>
                  <div>
                    <strong>Event Today</strong>
                    <small>Biotech Conference</small>
                  </div>
                </div>
                <div className="hc-notif n3">
                  <span>🏆</span>
                  <div>
                    <strong>You're on a streak!</strong>
                    <small>7 days in a row</small>
                  </div>
                </div>
              </div>
            </F>
          </div>
        </div>

        {/* Stats row */}
        <F d={500}>
          <div className="hero-stats">
            <div className="stat">
              <strong><Counter target={stats.users} suffix="+" /></strong>
              <span>Students</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <strong><Counter target={stats.papers} suffix="+" /></strong>
              <span>Research Papers</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <strong>6</strong>
              <span>Core Subjects</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <strong><Counter target={stats.events} suffix="+" /></strong>
              <span>Events Hosted</span>
            </div>
          </div>
        </F>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="sec">
        <F><div className="sec-label">✦ Features</div></F>
        <F d={60}><h2 className="sec-h2">Everything a biotech student needs</h2></F>
        <F d={100}><p className="sec-sub">Built ground-up for India's biotech community — not a generic platform</p></F>

        <div className="feat-bento">
          {/* Big left card */}
          <F className="fb-1" d={100}>
            <div className="feat-card fc-big">
              <div className="fc-icon">🧬</div>
              <h3>Learning Hub</h3>
              <p>Subject-wise PDF notes uploaded by real educators. Molecular Biology, Biochemistry, Microbiology, Bioinformatics & more — organised just for your semester.</p>
              <div className="fc-tag">12+ subjects</div>
            </div>
          </F>

          {/* Tall right card */}
          <F className="fb-2" d={150}>
            <div className="feat-card fc-tall">
              <div className="fc-icon">📄</div>
              <h3>Research Papers</h3>
              <p>Browse and share real scientific publications. Find abstracts, full links, and metadata without leaving the platform.</p>
              <div className="fc-paper-stack">
                <div className="fp">CRISPR-Cas9 Variants<span>2024</span></div>
                <div className="fp">Protein Folding AI<span>2025</span></div>
                <div className="fp">mRNA Vaccine Design<span>2025</span></div>
              </div>
            </div>
          </F>

          {/* Two small bottom cards */}
          <F className="fb-3" d={200}>
            <div className="feat-card fc-sm">
              <div className="fc-icon">📅</div>
              <h3>Events & Conferences</h3>
              <p>Webinars, workshops, hackathons — never miss a biotech event again.</p>
            </div>
          </F>
          <F className="fb-4" d={250}>
            <div className="feat-card fc-sm">
              <div className="fc-icon">👤</div>
              <h3>Role-Based Dashboards</h3>
              <p>Student, educator, or researcher — a personalised experience for each role.</p>
            </div>
          </F>
          <F className="fb-5" d={300}>
            <div className="feat-card fc-sm fc-accent">
              <div className="fc-icon">🔬</div>
              <h3>Academic Ecosystem</h3>
              <p>One platform connecting classrooms to labs across India.</p>
            </div>
          </F>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="sec how-sec">
        <F><div className="sec-label">✦ Getting Started</div></F>
        <F d={60}><h2 className="sec-h2">Up and running in 60 seconds</h2></F>

        <div className="steps-wrap">
          {[
            {
              n: "01",
              icon: "✍️",
              t: "Create your account",
              d: "Sign up with your college email. Pick your role — student, educator, or researcher. Takes 30 seconds.",
              cta: "Sign up free →",
              href: "/signup",
              color: "#10b981"
            },
            {
              n: "02",
              icon: "🔍",
              t: "Explore your dashboard",
              d: "Browse notes for your subjects, discover research papers, and find upcoming biotech events near you.",
              cta: null,
              href: null,
              color: "#f59e0b"
            },
            {
              n: "03",
              icon: "🤝",
              t: "Contribute & connect",
              d: "Upload your notes, share research, register for events, and build your network within India's biotech community.",
              cta: null,
              href: null,
              color: "#6366f1"
            },
          ].map((s, i) => (
            <F key={s.n} d={i * 120}>
              <div className="step" style={{"--sc": s.color}}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                {s.cta && <a href={s.href} className="step-link">{s.cta}</a>}
                {i < 2 && <div className="step-connector" />}
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="sec">
        <F><div className="sec-label">✦ Built For You</div></F>
        <F d={60}><h2 className="sec-h2">Tailored for every role</h2></F>

        <div className="roles-grid">
          {[
            {
              emoji: "🎓",
              label: "Students",
              color: "#6366f1",
              bg: "#eef2ff",
              tagline: "Ace your biotech semester",
              d: "Access curriculum-aligned notes, discover research papers, find events, and connect with peers and mentors.",
              pts: ["Subject-wise notes & PDFs", "Research paper access", "Event discovery & registration", "Peer community & study groups"],
            },
            {
              emoji: "👩‍🏫",
              label: "Educators",
              color: "#10b981",
              bg: "#ecfdf5",
              tagline: "Reach students at scale",
              d: "Upload materials, share knowledge, host events, and track how students are engaging with your content.",
              pts: ["Upload notes & study materials", "Publish research papers", "Host & manage events", "Track student engagement"],
            },
            {
              emoji: "🔬",
              label: "Researchers",
              color: "#f59e0b",
              bg: "#fffbeb",
              tagline: "Share findings, find collaborators",
              d: "Share your publications, find co-investigators, stay updated on conferences, and discover grant opportunities.",
              pts: ["Publish & share research", "Find collaborators & co-authors", "Conference & event updates", "Grant & funding opportunities"],
            },
          ].map((r, i) => (
            <F key={r.label} d={i * 100}>
              <div className="role-card" style={{"--rc": r.color, "--rbg": r.bg}}>
                <div className="rc-top">
                  <span className="rc-emoji">{r.emoji}</span>
                  <span className="rc-badge">{r.label}</span>
                </div>
                <div className="rc-tagline">{r.tagline}</div>
                <p className="rc-desc">{r.d}</p>
                <ul className="rc-list">
                  {r.pts.map(p => (
                    <li key={p}>
                      <span className="rc-check">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className="rc-cta">Get started as {r.label} →</a>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="sec">
        <F><div className="sec-label">✦ Community</div></F>
        <F d={60}><h2 className="sec-h2">What students are saying</h2></F>

        <div className="testi-grid">
          {[
            {
              name: "Priya S.",
              role: "BTech Biotech, Pune",
              text: "Finally found all my semester notes in one place! The subjects are organised exactly the way our curriculum works. Game changer.",
              emoji: "🎓",
              color: "#6366f1"
            },
            {
              name: "Arjun K.",
              role: "MSc Microbiology, Chennai",
              text: "I discovered three research papers relevant to my thesis just by browsing BioConnect. Saved me weeks of searching on Google Scholar.",
              emoji: "🔬",
              color: "#10b981"
            },
            {
              name: "Sneha M.",
              role: "BTech Biotech, Ahmedabad",
              text: "The events section is so useful — I found a CRISPR workshop and registered within minutes. Never knew about half these conferences before.",
              emoji: "🌱",
              color: "#f59e0b"
            },
          ].map((t, i) => (
            <F key={t.name} d={i * 80}>
              <div className="testi-card" style={{"--tc": t.color}}>
                <div className="testi-quote">"</div>
                <p>{t.text}</p>
                <div className="testi-author">
                  <div className="testi-av" style={{background: t.color}}>{t.emoji}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-blob" />
        <F>
          <div className="cta-inner">
            <div className="cta-emoji">🚀</div>
            <h2>Ready to level up your biotech journey?</h2>
            <p>Join students, educators, and researchers building India's biotech future — together.</p>
            <div className="cta-btns">
              <a href="/signup" className="btn-primary btn-lg">
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/login" className="btn-ghost btn-lg">Already have an account?</a>
            </div>
            <p className="cta-note">No credit card required · Free forever plan available</p>
          </div>
        </F>
      </section>

      {/* ── FOOTER ── */}
      <footer className="foot">
        <div className="foot-inner">
          <div className="foot-brand">
            <div className="n-logo foot-logo">
              <img src="/logo.jpg" alt="BioConnect" />
              <span>BioConnect</span>
            </div>
            <p>Connecting India's biotech community — students, educators, researchers, and industry.</p>
            <p className="foot-tagline">Built in India 🇮🇳 with 💚 for biotech</p>
          </div>
          {[
            { h: "Platform", links: [["Learning Hub", "/learning"], ["Research Papers", "/research"], ["Events", "/event"], ["Dashboard", "/dashboard"]] },
            { h: "Account", links: [["Sign Up", "/signup"], ["Login", "/login"]] },
            { h: "Support", links: [["Help Center", "#"], ["Privacy Policy", "#"], ["Terms of Service", "#"]] },
          ].map(col => (
            <div key={col.h} className="foot-col">
              <h4>{col.h}</h4>
              {col.links.map(([n, h]) => <a key={n} href={h}>{n}</a>)}
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <span>© 2026 BioConnect. All rights reserved.</span>
          <span className="foot-made">Made with care for India's biotech community</span>
        </div>
      </footer>
    </main>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

/* ── Reset & Base ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:'Sora',sans-serif;
  color:#1a1a2e;
  overflow-x:hidden;
  background:#f7f5f0;
}
::selection{background:rgba(99,102,241,0.2)}
a{text-decoration:none;color:inherit}
img{max-width:100%}

/* ── CSS Vars ── */
:root{
  --ink:#1a1a2e;
  --ink-2:#4a4a6a;
  --ink-3:#8888aa;
  --bg:#f7f5f0;
  --bg-2:#ede9e0;
  --white:#ffffff;
  --green:#10b981;
  --amber:#f59e0b;
  --indigo:#6366f1;
  --radius:20px;
  --shadow:0 8px 40px rgba(26,26,46,0.08);
  --shadow-lg:0 24px 64px rgba(26,26,46,0.12);
}

/* ── Noise ── */
.noise{
  pointer-events:none;position:fixed;inset:0;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity:0.5;
}

/* ── Fade-in ── */
.fi{opacity:0;transform:translateY(28px);transition:opacity .65s ease var(--d,0ms),transform .65s ease var(--d,0ms)}
.fi.vis{opacity:1;transform:translateY(0)}

/* ── Caret ── */
.caret{color:var(--indigo);animation:blink .75s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

/* ── Nav ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:68px;
  background:rgba(247,245,240,0.85);
  backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(26,26,46,0.07);
}
.n-logo{display:flex;align-items:center;gap:10px;font-family:'Lora',serif;font-size:20px;font-weight:600;color:var(--ink)}
.n-logo img{width:34px;height:34px;border-radius:10px;object-fit:cover}
.n-links{display:flex;gap:4px}
.n-links a{font-size:14px;color:var(--ink-2);padding:8px 16px;border-radius:10px;transition:all .2s;font-weight:400}
.n-links a:hover{color:var(--indigo);background:rgba(99,102,241,0.07)}
.n-cta{display:flex;align-items:center;gap:10px}
.n-login{font-size:14px;color:var(--ink-2);padding:8px 16px;border-radius:10px;transition:all .2s}
.n-login:hover{color:var(--indigo)}
.n-btn{
  font-size:14px;font-weight:600;color:var(--white);
  background:var(--indigo);padding:10px 22px;border-radius:12px;transition:all .25s;
}
.n-btn:hover{background:#4f46e5;transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,0.3)}
.n-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px}
.n-hamburger span{display:block;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:.2s}

/* ── Hero ── */
.hero{
  position:relative;min-height:100vh;
  display:flex;flex-direction:column;justify-content:center;
  padding:120px 48px 60px;overflow:hidden;
}
.hero-blob{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;opacity:0.5}
.b1{width:600px;height:600px;background:rgba(99,102,241,0.12);top:-100px;right:-100px}
.b2{width:400px;height:400px;background:rgba(16,185,129,0.1);bottom:50px;left:-50px}
.b3{width:300px;height:300px;background:rgba(245,158,11,0.1);top:40%;left:40%}
.hero-inner{
  display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
  max-width:1200px;margin:0 auto;width:100%;position:relative;z-index:1;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:500;
  color:var(--indigo);background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);
  border-radius:100px;padding:7px 18px;margin-bottom:28px;
}
.eyebrow-dot{width:7px;height:7px;background:var(--indigo);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)}50%{box-shadow:0 0 0 8px rgba(99,102,241,0)}}
.hero-h1{
  font-family:'Lora',serif;font-size:58px;line-height:1.15;
  color:var(--ink);margin-bottom:22px;letter-spacing:-0.5px;
}
.hero-accent{color:var(--indigo);font-style:italic}
.hero-sub{font-size:17px;color:var(--ink-2);line-height:1.75;max-width:480px;margin-bottom:36px;font-weight:300}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px}
.btn-primary{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--indigo);color:#fff;padding:14px 28px;
  border-radius:14px;font-size:15px;font-weight:600;font-family:'Sora',sans-serif;
  transition:all .25s;border:none;cursor:pointer;
}
.btn-primary:hover{background:#4f46e5;transform:translateY(-2px);box-shadow:0 12px 32px rgba(99,102,241,0.3)}
.btn-primary svg{transition:.2s}
.btn-primary:hover svg{transform:translateX(3px)}
.btn-ghost{
  display:inline-flex;align-items:center;
  color:var(--ink-2);padding:14px 24px;border-radius:14px;font-size:15px;font-weight:500;
  border:1.5px solid rgba(26,26,46,0.12);transition:all .25s;background:transparent;
}
.btn-ghost:hover{border-color:var(--indigo);color:var(--indigo);background:rgba(99,102,241,0.04)}
.btn-lg{padding:16px 32px;font-size:16px}
.hero-proof{display:flex;align-items:center;gap:14px}
.proof-avatars{display:flex}
.avatar{
  width:34px;height:34px;border-radius:50%;border:2px solid var(--bg);
  background:var(--indigo);color:#fff;font-size:12px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  margin-left:-8px;
}
.avatar:first-child{margin-left:0}
.avatar:nth-child(2){background:#10b981}
.avatar:nth-child(3){background:#f59e0b}
.avatar:nth-child(4){background:#ec4899}
.avatar:nth-child(5){background:#8b5cf6}
.hero-proof p{font-size:13px;color:var(--ink-2)}
.hero-proof strong{color:var(--ink)}

/* ── Hero card stack ── */
.hero-card-stack{position:relative;padding:20px}
.hc-main{
  background:var(--white);border-radius:20px;padding:24px;
  box-shadow:var(--shadow-lg);border:1px solid rgba(26,26,46,0.06);
  position:relative;z-index:2;
}
.hc-header{display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(26,26,46,0.06)}
.hc-dots{display:flex;gap:6px}
.hc-dots span{width:10px;height:10px;border-radius:50%}
.hc-dots span:nth-child(1){background:#ff5f57}
.hc-dots span:nth-child(2){background:#febc2e}
.hc-dots span:nth-child(3){background:#28c840}
.hc-title{font-size:13px;font-weight:600;color:var(--ink);margin-left:4px}
.hc-subject{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.hc-subj-icon{font-size:20px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--bg);border-radius:10px;flex-shrink:0}
.hc-subj-info{flex:1}
.hc-subj-info span{font-size:13px;font-weight:500;color:var(--ink);display:block;margin-bottom:6px}
.hc-bar{height:6px;background:var(--bg-2);border-radius:10px;overflow:hidden}
.hc-fill{height:100%;border-radius:10px;transition:width 1.5s ease}
.hc-pct{font-size:12px;font-weight:700;min-width:36px;text-align:right}
.hc-notif{
  position:absolute;display:flex;align-items:center;gap:10px;
  background:var(--white);border-radius:14px;padding:12px 18px;
  box-shadow:0 8px 32px rgba(26,26,46,0.12);border:1px solid rgba(26,26,46,0.06);
  z-index:3;animation:floatCard 5s ease-in-out infinite;
}
.hc-notif span{font-size:22px}
.hc-notif strong{display:block;font-size:13px;color:var(--ink);font-weight:600;line-height:1}
.hc-notif small{font-size:11px;color:var(--ink-3)}
.n1{top:-24px;right:20px;animation-delay:0s}
.n2{bottom:40px;right:-20px;animation-delay:2s}
.n3{bottom:-24px;left:10px;animation-delay:4s}
@keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* ── Hero stats ── */
.hero-stats{
  display:flex;align-items:center;justify-content:center;gap:32px;
  margin-top:60px;padding:28px 40px;
  background:var(--white);border-radius:20px;border:1px solid rgba(26,26,46,0.07);
  box-shadow:var(--shadow);max-width:700px;margin-left:auto;margin-right:auto;
  position:relative;z-index:1;
}
.stat{display:flex;flex-direction:column;align-items:center;gap:4px}
.stat strong{font-family:'Lora',serif;font-size:30px;font-weight:700;color:var(--ink)}
.stat span{font-size:11px;color:var(--ink-3);font-weight:500;text-transform:uppercase;letter-spacing:1.5px}
.stat-div{width:1px;height:36px;background:rgba(26,26,46,0.1)}

/* ── Marquee ── */
.marquee-wrap{
  overflow:hidden;padding:18px 0;
  background:var(--indigo);
  border-top:1px solid rgba(255,255,255,0.1);
  border-bottom:1px solid rgba(255,255,255,0.1);
}
.marquee-track{
  display:flex;gap:0;width:max-content;
  animation:marquee 22s linear infinite;
}
.marquee-item{
  font-size:14px;font-weight:500;color:rgba(255,255,255,0.85);
  padding:0 32px;border-right:1px solid rgba(255,255,255,0.15);
  white-space:nowrap;
}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Sections ── */
.sec{padding:100px 48px;max-width:1200px;margin:0 auto}
.sec-label{
  display:inline-block;font-size:12px;font-weight:700;letter-spacing:2px;
  text-transform:uppercase;color:var(--indigo);margin-bottom:14px;
}
.sec-h2{font-family:'Lora',serif;font-size:40px;color:var(--ink);margin-bottom:12px;letter-spacing:-0.5px}
.sec-sub{font-size:16px;color:var(--ink-3);margin-bottom:60px;font-weight:300;max-width:540px}

/* ── Feature Bento ── */
.feat-bento{
  display:grid;
  grid-template-columns:1.2fr 1fr 1fr;
  grid-template-rows:auto auto;
  gap:18px;
}
.fb-1{grid-column:1;grid-row:1/3}
.fb-2{grid-column:2;grid-row:1/3}
.fb-3{grid-column:3;grid-row:1}
.fb-4{grid-column:3;grid-row:2}
.fb-5{display:none}

.feat-card{
  background:var(--white);border:1px solid rgba(26,26,46,0.07);
  border-radius:var(--radius);padding:32px 28px;height:100%;
  transition:all .3s;
}
.feat-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg)}
.fc-icon{font-size:36px;margin-bottom:16px;display:block}
.feat-card h3{font-size:19px;font-weight:700;margin-bottom:10px;color:var(--ink);font-family:'Lora',serif}
.feat-card p{font-size:14px;color:var(--ink-2);line-height:1.7;font-weight:300}
.fc-tag{
  display:inline-block;margin-top:20px;font-size:12px;font-weight:600;
  background:rgba(99,102,241,0.08);color:var(--indigo);
  border-radius:100px;padding:5px 16px;
}
.fc-paper-stack{margin-top:20px;display:flex;flex-direction:column;gap:8px}
.fp{
  display:flex;justify-content:space-between;align-items:center;
  font-size:12px;color:var(--ink-2);background:var(--bg);
  border-radius:10px;padding:10px 14px;font-weight:400;
}
.fp span{font-size:11px;color:var(--ink-3);background:var(--bg-2);padding:2px 8px;border-radius:6px}
.fc-accent{background:linear-gradient(135deg,#f7f5f0,#ede9e0)}

/* ── Steps ── */
.how-sec{background:transparent}
.steps-wrap{
  display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative;
  margin-top:20px;
}
.step{
  background:var(--white);border:1px solid rgba(26,26,46,0.07);
  border-radius:var(--radius);padding:36px 28px;position:relative;
  transition:all .3s;
}
.step:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg);border-color:var(--sc)}
.step-num{
  font-family:'Lora',serif;font-size:48px;font-weight:700;
  color:rgba(26,26,46,0.08);line-height:1;margin-bottom:12px;
}
.step-icon{font-size:32px;margin-bottom:16px}
.step h3{font-size:18px;font-weight:700;color:var(--ink);margin-bottom:10px;font-family:'Lora',serif}
.step p{font-size:14px;color:var(--ink-2);line-height:1.7;font-weight:300}
.step-link{
  display:inline-block;margin-top:18px;font-size:14px;font-weight:600;
  color:var(--sc);transition:.2s;
}
.step-link:hover{opacity:0.7}

/* ── Roles ── */
.roles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.role-card{
  background:var(--white);border:2px solid transparent;
  border-radius:var(--radius);padding:36px 28px;
  transition:all .3s;position:relative;overflow:hidden;
}
.role-card::before{
  content:'';position:absolute;inset:0;opacity:0;
  background:var(--rbg);transition:.3s;z-index:0;
}
.role-card:hover{border-color:var(--rc);transform:translateY(-5px);box-shadow:var(--shadow-lg)}
.role-card:hover::before{opacity:1}
.role-card > *{position:relative;z-index:1}
.rc-top{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.rc-emoji{font-size:32px}
.rc-badge{
  font-size:13px;font-weight:700;color:var(--rc);
  background:color-mix(in srgb,var(--rc) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--rc) 20%,transparent);
  border-radius:100px;padding:5px 18px;
}
.rc-tagline{font-family:'Lora',serif;font-size:18px;font-weight:600;color:var(--ink);margin-bottom:10px}
.rc-desc{font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:20px;font-weight:300}
.rc-list{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.rc-list li{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--ink-2)}
.rc-check{
  width:20px;height:20px;border-radius:6px;flex-shrink:0;
  background:color-mix(in srgb,var(--rc) 15%,transparent);
  color:var(--rc);font-size:12px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
}
.rc-cta{
  font-size:14px;font-weight:600;color:var(--rc);transition:.2s;
}
.rc-cta:hover{opacity:0.7}

/* ── Testimonials ── */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.testi-card{
  background:var(--white);border:1px solid rgba(26,26,46,0.07);
  border-radius:var(--radius);padding:36px 28px;
  transition:all .3s;position:relative;
}
.testi-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg);border-color:var(--tc)}
.testi-quote{
  font-family:'Lora',serif;font-size:64px;line-height:0.8;color:var(--tc);
  opacity:0.3;margin-bottom:12px;display:block;
}
.testi-card p{font-size:14px;color:var(--ink-2);line-height:1.75;font-style:italic;margin-bottom:24px;font-weight:300}
.testi-author{display:flex;align-items:center;gap:14px}
.testi-av{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.testi-author strong{display:block;font-size:14px;color:var(--ink);font-weight:600}
.testi-author small{font-size:12px;color:var(--ink-3)}

/* ── CTA Section ── */
.cta-section{
  margin:0 24px 24px;border-radius:28px;
  background:var(--ink);
  position:relative;overflow:hidden;padding:100px 48px;text-align:center;
}
.cta-blob{
  position:absolute;width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%);
  top:-200px;left:50%;transform:translateX(-50%);pointer-events:none;
}
.cta-inner{position:relative;z-index:1}
.cta-emoji{font-size:48px;margin-bottom:20px;display:block}
.cta-section h2{
  font-family:'Lora',serif;font-size:42px;color:#fff;
  margin-bottom:14px;letter-spacing:-0.5px;max-width:600px;margin-left:auto;margin-right:auto;
}
.cta-section p{font-size:16px;color:rgba(255,255,255,0.6);margin-bottom:36px;font-weight:300}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:20px}
.cta-section .btn-primary{background:var(--white);color:var(--indigo)}
.cta-section .btn-primary:hover{background:#f0f0ff;box-shadow:0 12px 32px rgba(0,0,0,0.2)}
.cta-section .btn-ghost{color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.15)}
.cta-section .btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.05)}
.cta-note{font-size:13px;color:rgba(255,255,255,0.35);margin:0}

/* ── Footer ── */
.foot{padding:64px 48px 32px;background:#0d0d1a}
.foot-inner{
  display:flex;gap:60px;max-width:1100px;margin:0 auto 48px;
}
.foot-brand{flex:1.5}
.foot-logo img{width:28px;height:28px;border-radius:8px;object-fit:cover}
.foot-logo span{color:#fff}
.foot-brand p{font-size:14px;color:#555577;line-height:1.7;margin-top:14px;max-width:240px}
.foot-tagline{font-size:13px;color:#444466;margin-top:8px}
.foot-col{display:flex;flex-direction:column;gap:10px;min-width:120px}
.foot-col h4{font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.foot-col a{font-size:14px;color:#555577;transition:color .2s}
.foot-col a:hover{color:#a5b4fc}
.foot-bot{
  border-top:1px solid rgba(255,255,255,0.05);padding-top:24px;
  display:flex;justify-content:space-between;font-size:13px;color:#333355;
  max-width:1100px;margin:0 auto;
}

/* ── Mobile ── */
@media(max-width:900px){
  .nav{padding:0 20px}
  .n-links{
    display:none;flex-direction:column;gap:4px;
    position:absolute;top:68px;left:0;right:0;
    background:rgba(247,245,240,0.97);padding:16px 20px;
    border-bottom:1px solid rgba(26,26,46,0.08);
    backdrop-filter:blur(20px);
  }
  .n-links.open{display:flex}
  .n-cta .n-login{display:none}
  .n-hamburger{display:flex}
  .hero{padding:100px 20px 60px}
  .hero-inner{grid-template-columns:1fr;gap:40px}
  .hero-right{display:none}
  .hero-h1{font-size:40px}
  .hero-sub{font-size:16px}
  .hero-stats{gap:20px;padding:20px 24px;flex-wrap:wrap;justify-content:center}
  .stat strong{font-size:24px}
  .sec{padding:60px 20px}
  .sec-h2{font-size:32px}
  .feat-bento{grid-template-columns:1fr;grid-template-rows:auto}
  .fb-1,.fb-2,.fb-3,.fb-4,.fb-5{grid-column:1;grid-row:auto}
  .fb-5{display:block}
  .steps-wrap,.roles-grid,.testi-grid{grid-template-columns:1fr}
  .cta-section{padding:60px 20px;margin:0 12px 12px;border-radius:20px}
  .cta-section h2{font-size:32px}
  .foot{padding:40px 20px 24px}
  .foot-inner{flex-direction:column;gap:32px}
  .foot-bot{flex-direction:column;gap:8px}
}
`;
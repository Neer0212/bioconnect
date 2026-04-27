"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { async function load() { const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.push("/login"); return; } const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); setLoading(false); } load(); }, []);

  async function handleLogout() { await supabase.auth.signOut(); router.push("/login"); }

  if (loading) return (<main style={S.page}><style>{CSS}</style><p style={{ textAlign: "center", padding: "100px 20px", color: "#9ca3af" }}>Loading...</p></main>);

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const role = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student";
  const isEducator = profile?.role === "educator" || profile?.role === "researcher";

  return (
    <main style={S.page}><style>{CSS}</style>
      <nav style={S.nav}>
        <a href="/" style={S.logo}><img src="/logo.png" alt="" style={S.logoImg}/><span style={S.logoTxt}>BioConnect</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{ fontSize: "14px", color: item.label === "Dashboard" ? "#F97316" : "rgba(255,255,255,0.45)", padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Dashboard" ? 600 : 400, background: item.label === "Dashboard" ? "rgba(249,115,22,0.1)" : "transparent", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={S.avatar}>{firstName.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{firstName}</span>
          <button onClick={handleLogout} style={S.logoutBtn}>Logout</button>
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "56px 20px 20px" }}>
        <h1 style={S.h1}>Welcome back, {firstName}!</h1>
        <p style={{ fontSize: "16px", color: "#9ca3af" }}>{isEducator ? "Manage your content and inspire learners" : "Your academic journey continues here"}</p>
      </section>

      <section style={{ padding: "32px max(24px, calc((100vw - 860px)/2)) 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <a href="/profile" style={{ textDecoration: "none" }}><div style={S.card}>
            <div style={{ ...S.iconBox, background: "rgba(249,115,22,0.08)" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <h3 style={S.cardTitle}>My Profile</h3><p style={S.cardDesc}>View and edit your details</p>
            <div style={{ marginTop: "16px", padding: "8px 16px", background: "rgba(249,115,22,0.05)", borderRadius: "8px" }}><span style={{ fontSize: "13px", color: "#F97316", fontWeight: 600 }}>{role}</span><span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "8px" }}>{profile?.university || "No university set"}</span></div>
          </div></a>

          <a href="/learning" style={{ textDecoration: "none" }}><div style={S.card}>
            <div style={{ ...S.iconBox, background: "rgba(6,182,212,0.08)" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
            <h3 style={S.cardTitle}>Learning Hub</h3><p style={S.cardDesc}>{isEducator ? "Upload & manage study materials" : "Access subject-wise study materials"}</p>
            <div style={{ marginTop: "16px", padding: "8px 16px", background: "rgba(6,182,212,0.05)", borderRadius: "8px" }}><span style={{ fontSize: "13px", color: "#06B6D4", fontWeight: 600 }}>{isEducator ? "Manage content →" : "Start learning →"}</span></div>
          </div></a>

          <a href="/research" style={{ textDecoration: "none" }}><div style={S.card}>
            <div style={{ ...S.iconBox, background: "rgba(168,85,247,0.08)" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <h3 style={S.cardTitle}>Research Papers</h3><p style={S.cardDesc}>Browse scientific publications</p>
            <div style={{ marginTop: "16px", padding: "8px 16px", background: "rgba(168,85,247,0.05)", borderRadius: "8px" }}><span style={{ fontSize: "13px", color: "#A855F7", fontWeight: 600 }}>Browse papers →</span></div>
          </div></a>
        </div>
      </section>
    </main>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#FAFAF9}@media(max-width:768px){section>div>div{grid-template-columns:1fr!important}}`;
const S = {
  page: { fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: "100vh", background: "#FAFAF9", color: "#1c1917" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "#080B16", padding: "0 max(24px, calc((100vw - 1160px)/2))", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" },
  logo: { display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" },
  logoImg: { width: 32, height: 32, borderRadius: "8px", objectFit: "cover" },
  logoTxt: { fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#fff" },
  avatar: { width: 34, height: 34, background: "rgba(249,115,22,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#F97316" },
  logoutBtn: { background: "rgba(220,38,38,0.15)", border: "none", cursor: "pointer", fontSize: "13px", color: "#EF4444", padding: "6px 14px", borderRadius: "8px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif" },
  h1: { fontFamily: "'Instrument Serif',serif", fontSize: "36px", color: "#1c1917", marginBottom: "8px" },
  card: { background: "#fff", border: "1px solid #e7e5e4", borderRadius: "16px", padding: "32px 28px", transition: "all 0.3s", cursor: "pointer", height: "100%" },
  iconBox: { width: 52, height: 52, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  cardTitle: { fontSize: "18px", fontWeight: 600, color: "#1c1917", marginBottom: "6px" },
  cardDesc: { fontSize: "14px", color: "#6b7280", lineHeight: "1.5" },
};
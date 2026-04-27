"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.fullName, phone: form.phone, role: form.role } } });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  }

  if (success) return (
    <main style={S.page}><style>{CSS}</style><div style={S.card}><div style={{ textAlign: "center" }}>
      <div style={{ width: 56, height: 56, background: "rgba(6,182,212,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h1 style={S.title}>Check your email</h1>
      <p style={S.subtitle}>We sent a verification link to <strong style={{color:"#fff"}}>{form.email}</strong>. Click it to activate your account.</p>
      <a href="/login" style={{ color: "#F97316", fontWeight: 500, fontSize: "14px" }}>Go to Login</a>
    </div></div></main>
  );

  return (
    <main style={S.page}><style>{CSS}</style>
      <div style={S.card}>
        <a href="/" style={S.logo}><img src="/logo.png" alt="" style={S.logoImg}/><span style={S.logoTxt}>BioConnect</span></a>
        <h1 style={S.title}>Create your account</h1>
        <p style={S.subtitle}>Join India's biotech community</p>
        {error && <div style={S.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div><label style={S.label}>Full Name</label><input name="fullName" type="text" placeholder="John Doe" required value={form.fullName} onChange={handleChange} style={S.input}/></div>
          <div><label style={S.label}>Email Address</label><input name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} style={S.input}/></div>
          <div><label style={S.label}>Phone Number <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>(Optional)</span></label><input name="phone" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} style={S.input}/></div>
          <div><label style={S.label}>Password</label><input name="password" type="password" placeholder="••••••••" required minLength={8} value={form.password} onChange={handleChange} style={S.input}/><span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px", display: "block" }}>Minimum 8 characters</span></div>
          <div><label style={S.label}>I am a...</label><select name="role" value={form.role} onChange={handleChange} style={S.input}><option value="student">Student</option><option value="educator">Educator</option><option value="researcher">Researcher</option><option value="industry">Industry Professional</option></select></div>
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "20px" }}>Already have an account? <a href="/login" style={{ color: "#F97316", fontWeight: 500 }}>Sign in</a></p>
      </div>
    </main>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#080B16}`;
const S = {
  page: { fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: "#080B16" },
  card: { background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 36px", width: "100%", maxWidth: "440px" },
  logo: { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px", textDecoration: "none" },
  logoImg: { width: 32, height: 32, borderRadius: "8px", objectFit: "cover" },
  logoTxt: { fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#fff" },
  title: { fontFamily: "'Instrument Serif',serif", fontSize: "26px", color: "#fff", textAlign: "center", marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: "28px" },
  label: { display: "block", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "rgba(255,255,255,0.04)", color: "#fff" },
  btn: { background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", marginTop: "4px" },
  error: { background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", color: "#EF4444", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "12px" },
};
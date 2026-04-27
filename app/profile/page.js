"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setForm({ full_name: data?.full_name || "", phone: data?.phone || "", university: data?.university || "", bio: data?.bio || "" });
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true); setMessage("");
    const { error } = await supabase.from("profiles").update({ full_name: form.full_name, phone: form.phone, university: form.university, bio: form.bio }).eq("id", profile.id);
    if (error) { setMessage("Failed to save: " + error.message); } else { setProfile({ ...profile, ...form }); setMessage("Profile updated!"); setEditing(false); }
    setSaving(false);
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push("/login"); }

  if (loading) return (<main style={S.page}><style>{CSS}</style><p style={{ textAlign: "center", padding: "100px 20px", color: "rgba(255,255,255,0.4)" }}>Loading...</p></main>);

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const role = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student";

  return (
    <main style={S.page}><style>{CSS}</style>
      <nav style={S.nav}>
        <a href="/" style={S.logo}><img src="/logo.png" alt="" style={S.logoImg}/><span style={S.logoTxt}>BioConnect</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", padding: "6px 14px", borderRadius: "8px", fontWeight: 400, background: "transparent", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={S.avatar}>{firstName.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{firstName}</span>
          <button onClick={handleLogout} style={S.logoutBtn}>Logout</button>
        </div>
      </nav>

      <section style={{ padding: "48px max(24px, calc((100vw - 600px)/2)) 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ width: 80, height: 80, background: "rgba(249,115,22,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 600, color: "#F97316", margin: "0 auto 16px" }}>{profile?.full_name?.charAt(0)?.toUpperCase() || "U"}</div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "28px", color: "#fff", marginBottom: "4px" }}>{profile?.full_name || "User"}</h1>
          <span style={{ display: "inline-block", fontSize: "13px", fontWeight: 600, color: "#F97316", background: "rgba(249,115,22,0.1)", padding: "4px 14px", borderRadius: "100px" }}>{role}</span>
        </div>

        {message && <div style={{ padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", textAlign: "center", background: message.includes("Failed") ? "rgba(220,38,38,0.1)" : "rgba(6,182,212,0.1)", color: message.includes("Failed") ? "#EF4444" : "#06B6D4", border: `1px solid ${message.includes("Failed") ? "rgba(220,38,38,0.2)" : "rgba(6,182,212,0.2)"}` }}>{message}</div>}

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>Profile Details</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={S.editBtn}>Edit Profile</button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setEditing(false); setForm({ full_name: profile.full_name || "", phone: profile.phone || "", university: profile.university || "", bio: profile.bio || "" }); }} style={S.cancelBtn}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save"}</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { l: "Full Name", v: profile?.full_name, k: "full_name", editable: true },
              { l: "Email", v: profile?.email, note: "Email cannot be changed" },
              { l: "Phone", v: profile?.phone || "Not set", k: "phone", editable: true, ph: "+91 9876543210" },
              { l: "Role", v: role, note: "Role cannot be changed after signup" },
              { l: "University", v: profile?.university || "Not set", k: "university", editable: true, ph: "e.g. IIT Bombay" },
              { l: "Bio", v: profile?.bio || "No bio added yet", k: "bio", editable: true, ph: "Tell us about yourself...", textarea: true },
            ].map((f) => (
              <div key={f.l}>
                <label style={S.label}>{f.l}</label>
                {editing && f.editable ? (
                  f.textarea ? <textarea value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} rows={3} style={{ ...S.input, resize: "vertical" }}/> :
                  <input value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} style={S.input}/>
                ) : (
                  <p style={S.value}>{f.v || "—"}</p>
                )}
                {editing && f.note && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>{f.note}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "24px" }}><a href="/dashboard" style={{ fontSize: "14px", color: "#F97316", fontWeight: 500, textDecoration: "none" }}>← Back to Dashboard</a></div>
      </section>
    </main>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#080B16}`;
const S = {
  page: { fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: "100vh", background: "#080B16", color: "#fff" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(8,11,22,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 max(24px, calc((100vw - 1160px)/2))", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" },
  logo: { display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" },
  logoImg: { width: 32, height: 32, borderRadius: "8px", objectFit: "cover" },
  logoTxt: { fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#fff" },
  avatar: { width: 34, height: 34, background: "rgba(249,115,22,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#F97316" },
  logoutBtn: { background: "rgba(220,38,38,0.1)", border: "none", cursor: "pointer", fontSize: "13px", color: "#EF4444", padding: "6px 14px", borderRadius: "8px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px 28px" },
  label: { display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.35)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: "15px", color: "rgba(255,255,255,0.7)", fontWeight: 400 },
  input: { width: "100%", padding: "12px 14px", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "rgba(255,255,255,0.04)", color: "#fff" },
  editBtn: { background: "rgba(249,115,22,0.1)", border: "none", cursor: "pointer", fontSize: "13px", color: "#F97316", padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif" },
  saveBtn: { background: "linear-gradient(135deg,#F97316,#EA580C)", border: "none", cursor: "pointer", fontSize: "13px", color: "#fff", padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif" },
  cancelBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif" },
};
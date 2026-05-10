"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", university: "", bio: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
        setForm({ full_name: data?.full_name || "", phone: data?.phone || "", university: data?.university || "", bio: data?.bio || "" });
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true); setMessage("");
    const { error } = await supabase.from("profiles").update({ full_name: form.full_name, phone: form.phone, university: form.university, bio: form.bio }).eq("id", profile.id);
    if (error) setMessage("Failed: " + error.message);
    else { setProfile({ ...profile, ...form }); setMessage("Profile updated!"); setEditing(false); }
    setSaving(false);
  }

  const role = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student";

  return (
    <AppShell active="/profile">
      <div style={{ maxWidth: "640px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: 80, height: 80, background: "rgba(249,115,22,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 600, color: "#F97316", margin: "0 auto 16px" }}>{profile?.full_name?.charAt(0)?.toUpperCase() || "U"}</div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "28px", color: "#1c1917", marginBottom: "4px" }}>{profile?.full_name || "User"}</h1>
          <span style={{ display: "inline-block", fontSize: "13px", fontWeight: 600, color: "#F97316", background: "rgba(249,115,22,0.08)", padding: "4px 14px", borderRadius: "100px" }}>{role}</span>
        </div>

        {message && <div style={{ padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", textAlign: "center", background: message.includes("Failed") ? "#FEF2F2" : "#F0FDF4", color: message.includes("Failed") ? "#DC2626" : "#16A34A" }}>{message}</div>}

        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1c1917" }}>Profile Details</h2>
            {!editing ? <button onClick={() => setEditing(true)} style={{ background: "rgba(249,115,22,0.08)", border: "none", cursor: "pointer", fontSize: "13px", color: "#F97316", padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "inherit" }}>Edit Profile</button> : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setEditing(false); setForm({ full_name: profile.full_name||"", phone: profile.phone||"", university: profile.university||"", bio: profile.bio||"" }); }} style={{ background: "#f5f5f4", border: "1px solid #e7e5e4", cursor: "pointer", fontSize: "13px", color: "#6b7280", padding: "8px 18px", borderRadius: "8px", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", border: "none", cursor: "pointer", fontSize: "13px", color: "#fff", padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save"}</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { l: "Full Name", v: profile?.full_name, k: "full_name", editable: true },
              { l: "Email", v: profile?.email, note: "Email cannot be changed" },
              { l: "Phone", v: profile?.phone || "Not set", k: "phone", editable: true, ph: "+91 9876543210" },
              { l: "Role", v: role, note: "Role cannot be changed" },
              { l: "University", v: profile?.university || "Not set", k: "university", editable: true, ph: "e.g. IIT Bombay" },
              { l: "Bio", v: profile?.bio || "No bio added yet", k: "bio", editable: true, ph: "Tell us about yourself...", ta: true },
            ].map(f => (
              <div key={f.l}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#9ca3af", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.l}</label>
                {editing && f.editable ? (f.ta ? <textarea value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})} placeholder={f.ph} rows={3} style={{...I, resize: "vertical"}}/> : <input value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})} placeholder={f.ph} style={I}/>) : <p style={{ fontSize: "15px", color: "#44403c" }}>{f.v || "—"}</p>}
                {editing && f.note && <span style={{ fontSize: "12px", color: "#9ca3af" }}>{f.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
const I = { width: "100%", padding: "12px 14px", border: "1.5px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "#fff", color: "#1c1917" };
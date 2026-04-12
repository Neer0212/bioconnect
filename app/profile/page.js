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
      setForm({
        full_name: data?.full_name || "",
        phone: data?.phone || "",
        university: data?.university || "",
        bio: data?.bio || "",
      });
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        university: form.university,
        bio: form.bio,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage("Failed to save: " + error.message);
    } else {
      setProfile({ ...profile, ...form });
      setMessage("Profile updated!");
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <main style={styles.page}><style>{globalCSS}</style>
      <p style={{ textAlign: "center", padding: "100px 20px", color: "#666" }}>Loading...</p>
    </main>
  );

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const role = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student";

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      {/* Navbar */}
      <nav style={styles.nav}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{
              fontSize: "14px", color: "#4a4a6a", padding: "6px 14px", borderRadius: "8px",
              fontWeight: 400, background: "transparent", textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 34, height: 34, background: "#EEEDFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#5B4FD8" }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{firstName}</span>
          <button onClick={handleLogout} style={{ background: "#FEF2F2", border: "none", cursor: "pointer", fontSize: "13px", color: "#DC2626", padding: "6px 14px", borderRadius: "8px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Logout</button>
        </div>
      </nav>

      {/* Profile Content */}
      <section style={{ padding: "48px max(24px, calc((100vw - 600px)/2)) 80px" }}>

        {/* Avatar + Name Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: 80, height: 80, background: "#EEEDFE", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: 600, color: "#5B4FD8", margin: "0 auto 16px",
          }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#1a1a2e", marginBottom: "4px" }}>
            {profile?.full_name || "User"}
          </h1>
          <span style={{
            display: "inline-block", fontSize: "13px", fontWeight: 600, color: "#5B4FD8",
            background: "#EEEDFE", padding: "4px 14px", borderRadius: "100px",
          }}>{role}</span>
        </div>

        {message && (
          <div style={{
            padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", textAlign: "center",
            background: message.includes("Failed") ? "#FEF2F2" : "#F0FDF8",
            color: message.includes("Failed") ? "#DC2626" : "#0F6E56",
            border: `1px solid ${message.includes("Failed") ? "#FECACA" : "#BBF7D0"}`,
          }}>{message}</div>
        )}

        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px", padding: "32px 28px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a2e" }}>Profile Details</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={styles.editBtn}>Edit Profile</button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setEditing(false); setForm({ full_name: profile.full_name || "", phone: profile.phone || "", university: profile.university || "", bio: profile.bio || "" }); }} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save"}</button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div>
              <label style={styles.label}>Full Name</label>
              {editing ? (
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} style={styles.input} />
              ) : (
                <p style={styles.value}>{profile?.full_name || "—"}</p>
              )}
            </div>

            <div>
              <label style={styles.label}>Email</label>
              <p style={styles.value}>{profile?.email || "—"}</p>
              {editing && <span style={{ fontSize: "12px", color: "#999" }}>Email cannot be changed</span>}
            </div>

            <div>
              <label style={styles.label}>Phone</label>
              {editing ? (
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" style={styles.input} />
              ) : (
                <p style={styles.value}>{profile?.phone || "Not set"}</p>
              )}
            </div>

            <div>
              <label style={styles.label}>Role</label>
              <p style={styles.value}>{role}</p>
              {editing && <span style={{ fontSize: "12px", color: "#999" }}>Role cannot be changed after signup</span>}
            </div>

            <div>
              <label style={styles.label}>University</label>
              {editing ? (
                <input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="e.g. IIT Bombay" style={styles.input} />
              ) : (
                <p style={styles.value}>{profile?.university || "Not set"}</p>
              )}
            </div>

            <div>
              <label style={styles.label}>Bio</label>
              {editing ? (
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} style={{ ...styles.input, resize: "vertical" }} />
              ) : (
                <p style={styles.value}>{profile?.bio || "No bio added yet"}</p>
              )}
            </div>

          </div>
        </div>

        {/* Back to Dashboard */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <a href="/dashboard" style={{ fontSize: "14px", color: "#5B4FD8", fontWeight: 500, textDecoration: "none" }}>← Back to Dashboard</a>
        </div>

      </section>
    </main>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F4FB; }
`;

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#F5F4FB", color: "#1a1a2e" },
  nav: {
    position: "sticky", top: 0, zIndex: 100, background: "rgba(245,244,251,0.85)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E8E6F8", padding: "0 max(24px, calc((100vw - 1160px)/2))",
    display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px",
  },
  label: { display: "block", fontSize: "13px", fontWeight: 500, color: "#888", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: "15px", color: "#1a1a2e", fontWeight: 400 },
  input: {
    width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6F8", borderRadius: "10px",
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff", color: "#1a1a2e",
  },
  editBtn: {
    background: "#EEEDFE", border: "none", cursor: "pointer", fontSize: "13px", color: "#5B4FD8",
    padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
  },
  saveBtn: {
    background: "#5B4FD8", border: "none", cursor: "pointer", fontSize: "13px", color: "#fff",
    padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
  },
  cancelBtn: {
    background: "#F5F4FB", border: "1px solid #E8E6F8", cursor: "pointer", fontSize: "13px", color: "#666",
    padding: "8px 18px", borderRadius: "8px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
  },
};
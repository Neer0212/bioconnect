"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", event_type: "conference", location: "", event_date: "", end_date: "", registration_url: "" });

  useEffect(() => { async function load() { const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.push("/login"); return; } const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(p); await loadEvents(); } load(); }, []);
  async function loadEvents() { const { data } = await supabase.from("events").select("*, profiles(full_name)").order("event_date", { ascending: true }); setEvents(data || []); setLoading(false); }
  async function handleAdd(e) { e.preventDefault(); setSaving(true); const { error } = await supabase.from("events").insert({ ...form, created_by: profile.id, end_date: form.end_date || null }); if (error) { alert("Error: " + error.message); } else { setShowAdd(false); setForm({ title: "", description: "", event_type: "conference", location: "", event_date: "", end_date: "", registration_url: "" }); await loadEvents(); } setSaving(false); }
  async function handleDelete(id) { if (!confirm("Delete this event?")) return; await supabase.from("events").delete().eq("id", id); await loadEvents(); }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";
  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const now = new Date();
  const typeColors = { conference: { bg: "rgba(249,115,22,0.08)", color: "#F97316" }, webinar: { bg: "rgba(6,182,212,0.08)", color: "#06B6D4" }, workshop: { bg: "rgba(168,85,247,0.08)", color: "#A855F7" }, seminar: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" }, hackathon: { bg: "rgba(236,72,153,0.08)", color: "#EC4899" }, other: { bg: "#f5f5f4", color: "#6b7280" } };
  const filtered = events.filter((ev) => { if (filter === "upcoming") return new Date(ev.event_date) >= now; if (filter === "past") return new Date(ev.event_date) < now; return true; });

  if (loading) return (<main style={S.page}><style>{CSS}</style><p style={{ textAlign: "center", padding: "100px 20px", color: "#9ca3af" }}>Loading...</p></main>);

  return (
    <main style={S.page}><style>{CSS}</style>
      <nav style={S.nav}>
        <a href="/" style={S.logo}><img src="/logo.png" alt="" style={S.logoImg}/><span style={S.logoTxt}>BioConnect</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{ fontSize: "14px", color: item.label === "Events" ? "#F97316" : "rgba(255,255,255,0.45)", padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Events" ? 600 : 400, background: item.label === "Events" ? "rgba(249,115,22,0.1)" : "transparent", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={S.avatar}>{firstName.charAt(0).toUpperCase()}</div><span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{firstName}</span></div>
      </nav>

      <section style={{ textAlign: "center", padding: "48px 20px 24px" }}><h1 style={S.h1}>Events & Conferences</h1><p style={{ fontSize: "16px", color: "#9ca3af" }}>Stay updated on biotech events, webinars, and workshops</p></section>

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "upcoming", "past"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", background: filter === f ? "linear-gradient(135deg,#F97316,#EA580C)" : "#fff", color: filter === f ? "#fff" : "#6b7280", borderColor: filter === f ? "#F97316" : "#e7e5e4" }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
          {isEducator && <button onClick={() => setShowAdd(!showAdd)} style={S.addBtn}>{showAdd ? "Cancel" : "+ Add Event"}</button>}
        </div>
      </section>

      {showAdd && <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
        <div style={S.card}><h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "20px" }}>Add New Event</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}><label style={S.label}>Event Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={S.input} placeholder="e.g. International Biotech Conference 2026"/></div>
            <div><label style={S.label}>Event Type</label><select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} style={S.input}><option value="conference">Conference</option><option value="webinar">Webinar</option><option value="workshop">Workshop</option><option value="seminar">Seminar</option><option value="hackathon">Hackathon</option><option value="other">Other</option></select></div>
            <div><label style={S.label}>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={S.input} placeholder="Mumbai, India or Virtual"/></div>
            <div><label style={S.label}>Start Date *</label><input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} style={S.input}/></div>
            <div><label style={S.label}>End Date</label><input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={S.input}/></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={S.label}>Registration URL</label><input value={form.registration_url} onChange={(e) => setForm({ ...form, registration_url: e.target.value })} style={S.input} placeholder="https://..."/></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={S.label}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...S.input, resize: "vertical" }} placeholder="What's this event about?"/></div>
            <div style={{ gridColumn: "1 / -1" }}><button onClick={handleAdd} disabled={saving || !form.title || !form.event_date} style={{ ...S.addBtn, opacity: saving || !form.title || !form.event_date ? 0.6 : 1 }}>{saving ? "Adding..." : "Add Event"}</button></div>
          </div>
        </div>
      </section>}

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2)) 80px" }}>
        {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}><p style={{ fontSize: "16px", marginBottom: "4px" }}>{filter !== "all" ? `No ${filter} events` : "No events yet"}</p>{isEducator && filter === "all" && <p style={{ fontSize: "14px" }}>Click "+ Add Event" to create one</p>}</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((ev) => {
              const isPast = new Date(ev.event_date) < now;
              const tc = typeColors[ev.event_type] || typeColors.other;
              return (
                <div key={ev.id} style={{ ...S.card, opacity: isPast ? 0.6 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917" }}>{ev.title}</h3>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: tc.bg, color: tc.color }}>{ev.event_type?.charAt(0).toUpperCase() + ev.event_type?.slice(1)}</span>
                        {isPast && <span style={{ fontSize: "11px", fontWeight: 500, color: "#9ca3af", background: "#f5f5f4", padding: "3px 10px", borderRadius: "100px" }}>Past</span>}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "10px", fontSize: "13px", color: "#6b7280" }}>
                        <span>📅 {new Date(ev.event_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}{ev.end_date && ` — ${new Date(ev.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`}</span>
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                      {ev.description && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "8px" }}>{ev.description}</p>}
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>Posted by {ev.profiles?.full_name || "Unknown"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                      {ev.registration_url && !isPast && <a href={ev.registration_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#fff", fontWeight: 500, padding: "8px 16px", background: "linear-gradient(135deg,#F97316,#EA580C)", borderRadius: "8px", textDecoration: "none", textAlign: "center" }}>Register</a>}
                      {isEducator && ev.created_by === profile?.id && <button onClick={() => handleDelete(ev.id)} style={{ fontSize: "13px", color: "#EF4444", fontWeight: 500, padding: "8px 16px", background: "#FEF2F2", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#FAFAF9}`;
const S = {
  page: { fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: "100vh", background: "#FAFAF9", color: "#1c1917" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "#080B16", padding: "0 max(24px, calc((100vw - 1160px)/2))", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" },
  logo: { display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" },
  logoImg: { width: 32, height: 32, borderRadius: "8px", objectFit: "cover" },
  logoTxt: { fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#fff" },
  avatar: { width: 34, height: 34, background: "rgba(249,115,22,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#F97316" },
  h1: { fontFamily: "'Instrument Serif',serif", fontSize: "36px", color: "#1c1917", marginBottom: "8px" },
  card: { background: "#fff", border: "1px solid #e7e5e4", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" },
  label: { display: "block", fontSize: "13px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "#fff", color: "#1c1917" },
  addBtn: { background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap" },
};
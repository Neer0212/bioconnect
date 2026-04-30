"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

export default function EventsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", event_type: "conference", location: "", event_date: "", end_date: "", registration_url: "" });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); }
      await loadEvents();
    }
    load();
  }, []);

  async function loadEvents() { const { data } = await supabase.from("events").select("*, profiles(full_name)").order("event_date", { ascending: true }); setEvents(data || []); }
  async function handleAdd(e) { e.preventDefault(); setSaving(true); const { error } = await supabase.from("events").insert({ ...form, created_by: profile.id, end_date: form.end_date || null }); if (error) alert("Error: " + error.message); else { setShowAdd(false); setForm({ title: "", description: "", event_type: "conference", location: "", event_date: "", end_date: "", registration_url: "" }); await loadEvents(); } setSaving(false); }
  async function handleDelete(id) { if (!confirm("Delete?")) return; await supabase.from("events").delete().eq("id", id); await loadEvents(); }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";
  const now = new Date();
  const typeColors = { conference: { bg: "rgba(249,115,22,0.08)", color: "#F97316" }, webinar: { bg: "rgba(6,182,212,0.08)", color: "#06B6D4" }, workshop: { bg: "rgba(168,85,247,0.08)", color: "#A855F7" }, seminar: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" }, hackathon: { bg: "rgba(236,72,153,0.08)", color: "#EC4899" }, other: { bg: "#f5f5f4", color: "#6b7280" } };
  const filtered = events.filter(ev => { if (filter === "upcoming") return new Date(ev.event_date) >= now; if (filter === "past") return new Date(ev.event_date) < now; return true; });

  return (
    <AppShell active="/eventss">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div><h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Events & Conferences</h1><p style={{ fontSize: "15px", color: "#9ca3af" }}>Stay updated on biotech events, webinars, and workshops</p></div>
        {isEducator && <button onClick={() => setShowAdd(!showAdd)} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>{showAdd ? "Cancel" : "+ Create Event"}</button>}
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
        {["all", "upcoming", "past"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid", cursor: "pointer", fontFamily: "inherit", background: filter === f ? "linear-gradient(135deg,#F97316,#EA580C)" : "#fff", color: filter === f ? "#fff" : "#6b7280", borderColor: filter === f ? "#F97316" : "#e7e5e4" }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {showAdd && (
        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "20px" }}>Add New Event</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={I} placeholder="International Biotech Conference 2026"/></div>
            <div><label style={L}>Type</label><select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} style={I}><option value="conference">Conference</option><option value="webinar">Webinar</option><option value="workshop">Workshop</option><option value="seminar">Seminar</option><option value="hackathon">Hackathon</option><option value="other">Other</option></select></div>
            <div><label style={L}>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={I} placeholder="Mumbai or Virtual"/></div>
            <div><label style={L}>Start *</label><input type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} style={I}/></div>
            <div><label style={L}>End</label><input type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={I}/></div>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Registration URL</label><input value={form.registration_url} onChange={e => setForm({...form, registration_url: e.target.value})} style={I} placeholder="https://..."/></div>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{...I, resize: "vertical"}} placeholder="What's this event about?"/></div>
            <div style={{ gridColumn: "1/-1" }}><button onClick={handleAdd} disabled={saving||!form.title||!form.event_date} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: saving||!form.title||!form.event_date ? 0.6 : 1 }}>{saving ? "Adding..." : "Add Event"}</button></div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}><p>{filter !== "all" ? `No ${filter} events` : "No events yet"}</p></div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(ev => {
            const isPast = new Date(ev.event_date) < now;
            const tc = typeColors[ev.event_type] || typeColors.other;
            return (
              <div key={ev.id} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "22px 26px", opacity: isPast ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917" }}>{ev.title}</h3>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: tc.bg, color: tc.color }}>{ev.event_type?.charAt(0).toUpperCase() + ev.event_type?.slice(1)}</span>
                      {isPast && <span style={{ fontSize: "11px", color: "#9ca3af", background: "#f5f5f4", padding: "3px 10px", borderRadius: "100px" }}>Past</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "8px", fontSize: "13px", color: "#6b7280" }}>
                      <span>📅 {new Date(ev.event_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </div>
                    {ev.description && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "6px" }}>{ev.description}</p>}
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>By {ev.profiles?.full_name || "Unknown"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    {ev.registration_url && !isPast && <a href={ev.registration_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#fff", fontWeight: 500, padding: "8px 18px", background: "linear-gradient(135deg,#F97316,#EA580C)", borderRadius: "8px", textDecoration: "none", textAlign: "center" }}>Register</a>}
                    {isEducator && ev.created_by === profile?.id && <button onClick={() => handleDelete(ev.id)} style={{ fontSize: "13px", color: "#EF4444", fontWeight: 500, padding: "8px 16px", background: "#FEF2F2", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
const L = { display: "block", fontSize: "13px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" };
const I = { width: "100%", padding: "10px 14px", border: "1.5px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "#fff", color: "#1c1917" };
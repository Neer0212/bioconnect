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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      await loadEvents();
    }
    load();
  }, []);

  async function loadEvents() {
    const { data } = await supabase.from("events").select("*, profiles(full_name)").order("event_date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("events").insert({ ...form, created_by: profile.id, end_date: form.end_date || null });
    if (error) { alert("Error: " + error.message); }
    else { setShowAdd(false); setForm({ title: "", description: "", event_type: "conference", location: "", event_date: "", end_date: "", registration_url: "" }); await loadEvents(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    await loadEvents();
  }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";
  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const now = new Date();
  const typeColors = { conference: { bg: "#EEEDFE", color: "#5B4FD8" }, webinar: { bg: "#E1F5EE", color: "#0F6E56" }, workshop: { bg: "#FAEEDA", color: "#854F0B" }, seminar: { bg: "#E6F1FB", color: "#185FA5" }, hackathon: { bg: "#FBEAF0", color: "#72243E" }, other: { bg: "#F1EFE8", color: "#444441" } };

  const filtered = events.filter((ev) => {
    if (filter === "upcoming") return new Date(ev.event_date) >= now;
    if (filter === "past") return new Date(ev.event_date) < now;
    return true;
  });

  if (loading) return (<main style={styles.page}><style>{globalCSS}</style><p style={{ textAlign: "center", padding: "100px 20px", color: "#666" }}>Loading...</p></main>);

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      <nav style={styles.nav}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logo.png" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/events" }].map((item) => (
            <a key={item.label} href={item.href} style={{ fontSize: "14px", color: item.label === "Events" ? "#5B4FD8" : "#4a4a6a", padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Events" ? 600 : 400, background: item.label === "Events" ? "#EEEDFE" : "transparent", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 34, height: 34, background: "#EEEDFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#5B4FD8" }}>{firstName.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{firstName}</span>
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "48px 20px 24px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1a1a2e", marginBottom: "8px" }}>Events & Conferences</h1>
        <p style={{ fontSize: "16px", color: "#666" }}>Stay updated on biotech events, webinars, and workshops</p>
      </section>

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "upcoming", "past"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", background: filter === f ? "#5B4FD8" : "#fff", color: filter === f ? "#fff" : "#666", borderColor: filter === f ? "#5B4FD8" : "#E8E6F8" }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
          {isEducator && (
            <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#5B4FD8", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{showAdd ? "Cancel" : "+ Add Event"}</button>
          )}
        </div>
      </section>

      {showAdd && (
        <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
          <div style={{ background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px", padding: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", marginBottom: "20px" }}>Add New Event</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1 / -1" }}><label style={styles.label}>Event Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={styles.input} placeholder="e.g. International Biotech Conference 2026" /></div>
              <div><label style={styles.label}>Event Type</label><select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} style={styles.input}><option value="conference">Conference</option><option value="webinar">Webinar</option><option value="workshop">Workshop</option><option value="seminar">Seminar</option><option value="hackathon">Hackathon</option><option value="other">Other</option></select></div>
              <div><label style={styles.label}>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={styles.input} placeholder="Mumbai, India or Virtual" /></div>
              <div><label style={styles.label}>Start Date *</label><input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>End Date</label><input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={styles.input} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={styles.label}>Registration URL</label><input value={form.registration_url} onChange={(e) => setForm({ ...form, registration_url: e.target.value })} style={styles.input} placeholder="https://..." /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={styles.label}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...styles.input, resize: "vertical" }} placeholder="What's this event about?" /></div>
              <div style={{ gridColumn: "1 / -1" }}><button onClick={handleAdd} disabled={saving || !form.title || !form.event_date} style={{ background: "#5B4FD8", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: saving || !form.title || !form.event_date ? 0.6 : 1 }}>{saving ? "Adding..." : "Add Event"}</button></div>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2)) 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <p style={{ fontSize: "16px", marginBottom: "4px" }}>{filter !== "all" ? `No ${filter} events` : "No events yet"}</p>
            {isEducator && filter === "all" && <p style={{ fontSize: "14px" }}>Click "+ Add Event" to create one</p>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((ev) => {
              const isPast = new Date(ev.event_date) < now;
              const tc = typeColors[ev.event_type] || typeColors.other;
              return (
                <div key={ev.id} style={{ background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px", padding: "24px 28px", opacity: isPast ? 0.7 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e" }}>{ev.title}</h3>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: tc.bg, color: tc.color }}>{ev.event_type?.charAt(0).toUpperCase() + ev.event_type?.slice(1)}</span>
                        {isPast && <span style={{ fontSize: "11px", fontWeight: 500, color: "#999", background: "#f5f5f5", padding: "3px 10px", borderRadius: "100px" }}>Past</span>}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "10px", fontSize: "13px", color: "#666" }}>
                        <span>📅 {new Date(ev.event_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}{ev.end_date && ` — ${new Date(ev.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`}</span>
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                      {ev.description && <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", marginBottom: "8px" }}>{ev.description}</p>}
                      <span style={{ fontSize: "12px", color: "#999" }}>Posted by {ev.profiles?.full_name || "Unknown"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                      {ev.registration_url && !isPast && (
                        <a href={ev.registration_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#fff", fontWeight: 500, padding: "8px 16px", background: "#5B4FD8", borderRadius: "8px", textDecoration: "none", textAlign: "center" }}>Register</a>
                      )}
                      {isEducator && ev.created_by === profile?.id && (
                        <button onClick={() => handleDelete(ev.id)} style={{ fontSize: "13px", color: "#DC2626", fontWeight: 500, padding: "8px 16px", background: "#FEF2F2", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
                      )}
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

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F4FB; }
`;

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#F5F4FB", color: "#1a1a2e" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(245,244,251,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6F8", padding: "0 max(24px, calc((100vw - 1160px)/2))", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" },
  label: { display: "block", fontSize: "13px", fontWeight: 500, color: "#1a1a2e", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #E8E6F8", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff", color: "#1a1a2e" },
};
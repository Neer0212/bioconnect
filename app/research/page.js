"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

export default function ResearchPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", authors: "", abstract: "", topic: "", journal: "", published_date: "", paper_url: "" });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); }
      await loadPapers();
    }
    load();
  }, []);

  async function loadPapers() { const { data } = await supabase.from("research_papers").select("*, profiles(full_name)").order("created_at", { ascending: false }); setPapers(data || []); }
  async function handleAdd(e) { e.preventDefault(); setSaving(true); const { error } = await supabase.from("research_papers").insert({ ...form, uploaded_by: profile.id, published_date: form.published_date || null }); if (error) alert("Error: " + error.message); else { setShowAdd(false); setForm({ title: "", authors: "", abstract: "", topic: "", journal: "", published_date: "", paper_url: "" }); await loadPapers(); } setSaving(false); }
  async function handleDelete(id) { if (!confirm("Delete?")) return; await supabase.from("research_papers").delete().eq("id", id); await loadPapers(); }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";
  const filtered = papers.filter(p => { const q = search.toLowerCase(); return !q || p.title?.toLowerCase().includes(q) || p.authors?.toLowerCase().includes(q) || p.topic?.toLowerCase().includes(q); });

  return (
    <AppShell active="/research">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div><h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Research Papers</h1><p style={{ fontSize: "15px", color: "#9ca3af" }}>Access the latest biological breakthroughs and peer-reviewed studies</p></div>
        {isEducator && <button onClick={() => setShowAdd(!showAdd)} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{showAdd ? "Cancel" : "+ Add Paper"}</button>}
      </div>

      <input type="text" placeholder="Search papers by title, author, or topic..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "12px 16px", border: "1px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#fff", color: "#1c1917", marginBottom: "24px" }}/>

      {showAdd && (
        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "20px" }}>Add Research Paper</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={I} placeholder="e.g. Novel CRISPR-Cas9 Variants..."/></div>
            <div><label style={L}>Authors</label><input value={form.authors} onChange={e => setForm({...form, authors: e.target.value})} style={I} placeholder="Smith J, Patel R"/></div>
            <div><label style={L}>Journal</label><input value={form.journal} onChange={e => setForm({...form, journal: e.target.value})} style={I} placeholder="Nature Biotechnology"/></div>
            <div><label style={L}>Topic</label><input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} style={I} placeholder="Molecular Biology"/></div>
            <div><label style={L}>Date</label><input type="date" value={form.published_date} onChange={e => setForm({...form, published_date: e.target.value})} style={I}/></div>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Paper URL</label><input value={form.paper_url} onChange={e => setForm({...form, paper_url: e.target.value})} style={I} placeholder="https://doi.org/..."/></div>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Abstract</label><textarea value={form.abstract} onChange={e => setForm({...form, abstract: e.target.value})} rows={3} style={{...I, resize: "vertical"}} placeholder="Brief summary..."/></div>
            <div style={{ gridColumn: "1/-1" }}><button onClick={handleAdd} disabled={saving||!form.title} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: saving||!form.title ? 0.6 : 1 }}>{saving ? "Adding..." : "Add Paper"}</button></div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}><p>{search ? "No papers match" : "No papers yet"}</p></div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {filtered.map(paper => (
            <div key={paper.id} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column" }}>
              {paper.topic && <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, color: "#F97316", background: "rgba(249,115,22,0.08)", padding: "3px 10px", borderRadius: "100px", marginBottom: "12px", alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.5px" }}>{paper.topic}</span>}
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1c1917", marginBottom: "8px", lineHeight: "1.4" }}>{paper.title}</h3>
              {paper.abstract && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "12px", flex: 1 }}>{paper.abstract.length > 120 ? paper.abstract.slice(0,120) + "..." : paper.abstract}</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f5f5f4" }}>
                <div><p style={{ fontSize: "13px", color: "#44403c", fontWeight: 500 }}>{paper.authors || paper.profiles?.full_name || "Unknown"}</p>{paper.published_date && <p style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(paper.published_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}</p>}</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {paper.paper_url && <a href={paper.paper_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#F97316", fontWeight: 500 }}>View →</a>}
                  {(profile?.is_admin || (isEducator && paper.uploaded_by === profile?.id)) && <button onClick={() => handleDelete(paper.id)} style={{ fontSize: "12px", color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
const L = { display: "block", fontSize: "13px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" };
const I = { width: "100%", padding: "10px 14px", border: "1.5px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "#fff", color: "#1c1917" };
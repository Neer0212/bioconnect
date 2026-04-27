"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ResearchPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", authors: "", abstract: "", topic: "", journal: "", published_date: "", paper_url: "" });

  useEffect(() => { async function load() { const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.push("/login"); return; } const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(p); await loadPapers(); } load(); }, []);
  async function loadPapers() { const { data } = await supabase.from("research_papers").select("*, profiles(full_name)").order("created_at", { ascending: false }); setPapers(data || []); setLoading(false); }
  async function handleAdd(e) { e.preventDefault(); setSaving(true); const { error } = await supabase.from("research_papers").insert({ ...form, uploaded_by: profile.id, published_date: form.published_date || null }); if (error) { alert("Error: " + error.message); } else { setShowAdd(false); setForm({ title: "", authors: "", abstract: "", topic: "", journal: "", published_date: "", paper_url: "" }); await loadPapers(); } setSaving(false); }
  async function handleDelete(id) { if (!confirm("Delete this paper?")) return; await supabase.from("research_papers").delete().eq("id", id); await loadPapers(); }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";
  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const filtered = papers.filter((p) => { const q = search.toLowerCase(); return !q || p.title?.toLowerCase().includes(q) || p.authors?.toLowerCase().includes(q) || p.topic?.toLowerCase().includes(q) || p.journal?.toLowerCase().includes(q); });

  if (loading) return (<main style={S.page}><style>{CSS}</style><p style={{ textAlign: "center", padding: "100px 20px", color: "#9ca3af" }}>Loading...</p></main>);

  return (
    <main style={S.page}><style>{CSS}</style>
      <nav style={S.nav}>
        <a href="/" style={S.logo}><img src="/logo.png" alt="" style={S.logoImg}/><span style={S.logoTxt}>BioConnect</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{ fontSize: "14px", color: item.label === "Research" ? "#F97316" : "rgba(255,255,255,0.45)", padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Research" ? 600 : 400, background: item.label === "Research" ? "rgba(249,115,22,0.1)" : "transparent", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={S.avatar}>{firstName.charAt(0).toUpperCase()}</div><span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{firstName}</span></div>
      </nav>

      <section style={{ textAlign: "center", padding: "48px 20px 24px" }}><h1 style={S.h1}>Research Papers</h1><p style={{ fontSize: "16px", color: "#9ca3af" }}>Browse scientific publications from the biotech community</p></section>

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input type="text" placeholder="Search by title, author, topic, or journal..." value={search} onChange={(e) => setSearch(e.target.value)} style={S.searchInput}/>
          {isEducator && <button onClick={() => setShowAdd(!showAdd)} style={S.addBtn}>{showAdd ? "Cancel" : "+ Add Paper"}</button>}
        </div>
      </section>

      {showAdd && <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
        <div style={S.card}><h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "20px" }}>Add Research Paper</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}><label style={S.label}>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={S.input} placeholder="e.g. Novel CRISPR-Cas9 Variants..."/></div>
            <div><label style={S.label}>Authors</label><input value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} style={S.input} placeholder="e.g. Smith J, Patel R"/></div>
            <div><label style={S.label}>Journal</label><input value={form.journal} onChange={(e) => setForm({ ...form, journal: e.target.value })} style={S.input} placeholder="e.g. Nature Biotechnology"/></div>
            <div><label style={S.label}>Topic</label><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} style={S.input} placeholder="e.g. Molecular Biology"/></div>
            <div><label style={S.label}>Published Date</label><input type="date" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} style={S.input}/></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={S.label}>Paper URL</label><input value={form.paper_url} onChange={(e) => setForm({ ...form, paper_url: e.target.value })} style={S.input} placeholder="https://doi.org/..."/></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={S.label}>Abstract</label><textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} rows={3} style={{ ...S.input, resize: "vertical" }} placeholder="Brief summary..."/></div>
            <div style={{ gridColumn: "1 / -1" }}><button onClick={handleAdd} disabled={saving || !form.title} style={{ ...S.addBtn, opacity: saving || !form.title ? 0.6 : 1 }}>{saving ? "Adding..." : "Add Paper"}</button></div>
          </div>
        </div>
      </section>}

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2)) 80px" }}>
        {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}><p style={{ fontSize: "16px", marginBottom: "4px" }}>{search ? "No papers match your search" : "No research papers yet"}</p>{isEducator && !search && <p style={{ fontSize: "14px" }}>Click "+ Add Paper" to add the first one</p>}</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((paper) => (
              <div key={paper.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "6px" }}>{paper.title}</h3>
                    {paper.authors && <p style={{ fontSize: "13px", color: "#F97316", marginBottom: "8px" }}>{paper.authors}</p>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                      {paper.journal && <span style={{ fontSize: "12px", color: "#6b7280" }}>📖 {paper.journal}</span>}
                      {paper.topic && <span style={{ fontSize: "12px", background: "rgba(249,115,22,0.08)", color: "#F97316", padding: "2px 10px", borderRadius: "100px", fontWeight: 500 }}>{paper.topic}</span>}
                      {paper.published_date && <span style={{ fontSize: "12px", color: "#6b7280" }}>📅 {new Date(paper.published_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}</span>}
                    </div>
                    {paper.abstract && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "8px" }}>{paper.abstract}</p>}
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Added by {paper.profiles?.full_name || "Unknown"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    {paper.paper_url && <a href={paper.paper_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#F97316", fontWeight: 500, padding: "8px 16px", background: "rgba(249,115,22,0.08)", borderRadius: "8px", textDecoration: "none", textAlign: "center" }}>View Paper</a>}
                    {(profile?.is_admin || (isEducator && paper.uploaded_by === profile?.id)) && <button onClick={() => handleDelete(paper.id)} style={{ fontSize: "13px", color: "#EF4444", fontWeight: 500, padding: "8px 16px", background: "#FEF2F2", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete</button>}
                  </div>
                </div>
              </div>
            ))}
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
  searchInput: { flex: 1, padding: "12px 16px", border: "1.5px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "#fff", color: "#1c1917" },
  addBtn: { background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap" },
};
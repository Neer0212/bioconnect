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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      await loadPapers();
    }
    load();
  }, []);

  async function loadPapers() {
    const { data } = await supabase.from("research_papers").select("*, profiles(full_name)").order("created_at", { ascending: false });
    setPapers(data || []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("research_papers").insert({
      ...form,
      uploaded_by: profile.id,
      published_date: form.published_date || null,
    });
    if (error) { alert("Error: " + error.message); }
    else { setShowAdd(false); setForm({ title: "", authors: "", abstract: "", topic: "", journal: "", published_date: "", paper_url: "" }); await loadPapers(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this paper?")) return;
    await supabase.from("research_papers").delete().eq("id", id);
    await loadPapers();
  }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";
  const firstName = profile?.full_name?.split(" ")[0] || "User";

  const filtered = papers.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.title?.toLowerCase().includes(q) || p.authors?.toLowerCase().includes(q) || p.topic?.toLowerCase().includes(q) || p.journal?.toLowerCase().includes(q);
  });

  if (loading) return (
    <main style={styles.page}><style>{globalCSS}</style>
      <p style={{ textAlign: "center", padding: "100px 20px", color: "#666" }}>Loading...</p>
    </main>
  );

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
              fontSize: "14px", color: item.label === "Research" ? "#5B4FD8" : "#4a4a6a",
              padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Research" ? 600 : 400,
              background: item.label === "Research" ? "#EEEDFE" : "transparent", textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 34, height: 34, background: "#EEEDFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#5B4FD8" }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{firstName}</span>
        </div>
      </nav>

      {/* Header */}
      <section style={{ textAlign: "center", padding: "48px 20px 24px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1a1a2e", marginBottom: "8px" }}>Research Papers</h1>
        <p style={{ fontSize: "16px", color: "#666" }}>Browse scientific publications from the biotech community</p>
      </section>

      {/* Search + Add */}
      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text" placeholder="Search by title, author, topic, or journal..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "12px 16px", border: "1.5px solid #E8E6F8", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff" }}
          />
          {isEducator && (
            <button onClick={() => setShowAdd(!showAdd)} style={{
              background: "#5B4FD8", color: "#fff", border: "none", padding: "12px 20px",
              borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
            }}>{showAdd ? "Cancel" : "+ Add Paper"}</button>
          )}
        </div>
      </section>

      {/* Add Paper Form */}
      {showAdd && (
        <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2))", marginBottom: "24px" }}>
          <div style={{ background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px", padding: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", marginBottom: "20px" }}>Add Research Paper</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={styles.input} placeholder="e.g. Novel CRISPR-Cas9 Variants..." />
              </div>
              <div>
                <label style={styles.label}>Authors</label>
                <input value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} style={styles.input} placeholder="e.g. Smith J, Patel R" />
              </div>
              <div>
                <label style={styles.label}>Journal</label>
                <input value={form.journal} onChange={(e) => setForm({ ...form, journal: e.target.value })} style={styles.input} placeholder="e.g. Nature Biotechnology" />
              </div>
              <div>
                <label style={styles.label}>Topic</label>
                <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} style={styles.input} placeholder="e.g. Molecular Biology" />
              </div>
              <div>
                <label style={styles.label}>Published Date</label>
                <input type="date" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} style={styles.input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Paper URL (link to PDF or DOI)</label>
                <input value={form.paper_url} onChange={(e) => setForm({ ...form, paper_url: e.target.value })} style={styles.input} placeholder="https://doi.org/..." />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Abstract</label>
                <textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} rows={3} style={{ ...styles.input, resize: "vertical" }} placeholder="Brief summary of the paper..." />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <button onClick={handleAdd} disabled={saving || !form.title} style={{
                  background: "#5B4FD8", color: "#fff", border: "none", padding: "12px 24px",
                  borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", opacity: saving || !form.title ? 0.6 : 1,
                }}>{saving ? "Adding..." : "Add Paper"}</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Papers List */}
      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2)) 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <p style={{ fontSize: "16px", marginBottom: "4px" }}>{search ? "No papers match your search" : "No research papers yet"}</p>
            {isEducator && !search && <p style={{ fontSize: "14px" }}>Click "+ Add Paper" to add the first one</p>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((paper) => (
              <div key={paper.id} style={{ background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px", padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", marginBottom: "6px" }}>{paper.title}</h3>
                    {paper.authors && <p style={{ fontSize: "13px", color: "#5B4FD8", marginBottom: "8px" }}>{paper.authors}</p>}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                      {paper.journal && (
                        <span style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                          📖 {paper.journal}
                        </span>
                      )}
                      {paper.topic && (
                        <span style={{ fontSize: "12px", background: "#EEEDFE", color: "#5B4FD8", padding: "2px 10px", borderRadius: "100px", fontWeight: 500 }}>
                          {paper.topic}
                        </span>
                      )}
                      {paper.published_date && (
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          📅 {new Date(paper.published_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>

                    {paper.abstract && <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", marginBottom: "8px" }}>{paper.abstract}</p>}

                    <span style={{ fontSize: "12px", color: "#999" }}>Added by {paper.profiles?.full_name || "Unknown"}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    {paper.paper_url && (
                      <a href={paper.paper_url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: "13px", color: "#5B4FD8", fontWeight: 500, padding: "8px 16px",
                        background: "#EEEDFE", borderRadius: "8px", textDecoration: "none", textAlign: "center",
                      }}>View Paper</a>
                    )}
                    {isEducator && paper.uploaded_by === profile?.id && (
                      <button onClick={() => handleDelete(paper.id)} style={{
                        fontSize: "13px", color: "#DC2626", fontWeight: 500, padding: "8px 16px",
                        background: "#FEF2F2", borderRadius: "8px", border: "none", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}>Delete</button>
                    )}
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
  label: { display: "block", fontSize: "13px", fontWeight: 500, color: "#1a1a2e", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 14px", border: "1.5px solid #E8E6F8", borderRadius: "10px",
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff", color: "#1a1a2e",
  },
};
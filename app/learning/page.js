"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  { id: "molecular-biology", name: "Molecular Biology", icon: "🧬", color: "#F97316" },
  { id: "biochemistry", name: "Biochemistry", icon: "⚗️", color: "#06B6D4" },
  { id: "microbiology", name: "Microbiology", icon: "🦠", color: "#EF4444" },
  { id: "genetics", name: "Genetics", icon: "🔬", color: "#A855F7" },
  { id: "bioinformatics", name: "Bioinformatics", icon: "💻", color: "#3B82F6" },
  { id: "bioprocess-engineering", name: "Bioprocess Engineering", icon: "🏭", color: "#EC4899" },
];

export default function LearningPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [openSubject, setOpenSubject] = useState(null);
  const [notes, setNotes] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      loadAllNotes();
    }
    load();
  }, []);

  async function loadAllNotes() {
    const result = {};
    for (const sub of SUBJECTS) { const { data } = await supabase.storage.from("course-materials").list(sub.id); result[sub.id] = data || []; }
    setNotes(result);
  }

  async function handleUpload(subjectId, file) {
    if (!file || !file.name.endsWith(".pdf")) { alert("Please upload a PDF file"); return; }
    setUploading(true);
    const fileName = `${profile.id.slice(0, 8)}_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("course-materials").upload(`${subjectId}/${fileName}`, file);
    if (error) { alert("Upload failed: " + error.message); } else { await loadAllNotes(); }
    setUploading(false);
  }

  function getPublicUrl(subjectId, fileName) { const { data } = supabase.storage.from("course-materials").getPublicUrl(`${subjectId}/${fileName}`); return data.publicUrl; }

  async function handleDelete(subjectId, fileName) { if (!confirm("Delete this note?")) return; await supabase.storage.from("course-materials").remove([`${subjectId}/${fileName}`]); await loadAllNotes(); }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";

  return (
    <main style={S.page}><style>{CSS}</style>
      <nav style={S.nav}>
        <a href="/" style={S.logo}><img src="/logo.png" alt="" style={S.logoImg}/><span style={S.logoTxt}>BioConnect</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{ fontSize: "14px", color: item.label === "Learning" ? "#F97316" : "rgba(255,255,255,0.4)", padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Learning" ? 600 : 400, background: item.label === "Learning" ? "rgba(249,115,22,0.1)" : "transparent", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={S.avatar}>{profile?.full_name?.charAt(0)?.toUpperCase() || "U"}</div>
          <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{profile?.full_name?.split(" ")[0]}</span>
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "48px 20px 24px" }}>
        <h1 style={S.h1}>Learning Hub</h1>
        <p style={S.sub}>Access study materials and notes organized by subject</p>
      </section>

      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2)) 60px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SUBJECTS.map((sub) => {
            const isOpen = openSubject === sub.id;
            const subNotes = notes[sub.id] || [];
            const pdfFiles = subNotes.filter(f => f.name && f.name.endsWith(".pdf"));
            return (
              <div key={sub.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
                <button onClick={() => setOpenSubject(isOpen ? null : sub.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: 44, height: 44, background: sub.color + "18", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{sub.icon}</div>
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{sub.name}</h3>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>{pdfFiles.length} {pdfFiles.length === 1 ? "note" : "notes"}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.3)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {pdfFiles.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", padding: "20px 0 12px" }}>No notes uploaded yet for this subject.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 0 12px" }}>
                        {pdfFiles.map((file) => (
                          <div key={file.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "18px" }}>📄</span>
                              <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{file.name.replace(/^[^_]+_\d+_/, "")}</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <a href={getPublicUrl(sub.id, file.name)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#F97316", fontWeight: 500, padding: "6px 14px", borderRadius: "8px", background: "rgba(249,115,22,0.1)", textDecoration: "none" }}>View PDF</a>
                              {isEducator && (<button onClick={() => handleDelete(sub.id, file.name)} style={{ fontSize: "13px", color: "#EF4444", fontWeight: 500, padding: "6px 14px", borderRadius: "8px", background: "rgba(220,38,38,0.1)", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete</button>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {isEducator && (
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.7 : 1 }}>
                        {uploading ? "Uploading..." : "Upload PDF"}
                        <input type="file" accept=".pdf" hidden disabled={uploading} onChange={(e) => handleUpload(sub.id, e.target.files?.[0])}/>
                      </label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  h1: { fontFamily: "'Instrument Serif',serif", fontSize: "36px", color: "#fff", marginBottom: "8px" },
  sub: { fontSize: "16px", color: "rgba(255,255,255,0.4)" },
};
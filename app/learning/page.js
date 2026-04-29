"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";

const SUBJECTS = [
  { id: "molecular-biology", name: "Molecular Biology", icon: "🧬", color: "#F97316" },
  { id: "biochemistry", name: "Biochemistry", icon: "⚗️", color: "#06B6D4" },
  { id: "microbiology", name: "Microbiology", icon: "🦠", color: "#EF4444" },
  { id: "genetics", name: "Genetics", icon: "🔬", color: "#A855F7" },
  { id: "bioinformatics", name: "Bioinformatics", icon: "💻", color: "#3B82F6" },
  { id: "bioprocess-engineering", name: "Bioprocess Engineering", icon: "🏭", color: "#EC4899" },
];

export default function LearningPage() {
  const [openSubject, setOpenSubject] = useState(null);
  const [notes, setNotes] = useState({});
  const [uploading, setUploading] = useState(false);

  return (
    <AppShell active="/learning">
      {({ profile, supabase }) => {
        const isEducator = profile?.role === "educator" || profile?.role === "researcher";

        async function loadAllNotes() { const r = {}; for (const sub of SUBJECTS) { const { data } = await supabase.storage.from("course-materials").list(sub.id); r[sub.id] = data || []; } setNotes(r); }

        useEffect(() => { loadAllNotes(); }, []);

        async function handleUpload(subjectId, file) { if (!file || !file.name.endsWith(".pdf")) { alert("Please upload a PDF"); return; } setUploading(true); const fn = `${profile.id.slice(0,8)}_${Date.now()}_${file.name}`; const { error } = await supabase.storage.from("course-materials").upload(`${subjectId}/${fn}`, file); if (error) alert("Upload failed: " + error.message); else await loadAllNotes(); setUploading(false); }
        function getUrl(sid, fn) { return supabase.storage.from("course-materials").getPublicUrl(`${sid}/${fn}`).data.publicUrl; }
        async function handleDelete(sid, fn) { if (!confirm("Delete this note?")) return; await supabase.storage.from("course-materials").remove([`${sid}/${fn}`]); await loadAllNotes(); }

        return (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Learning Hub</h1>
              <p style={{ fontSize: "15px", color: "#9ca3af" }}>Access study materials and notes organized by subject</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {SUBJECTS.map((sub) => {
                const isOpen = openSubject === sub.id;
                const subNotes = notes[sub.id] || [];
                const pdfFiles = subNotes.filter(f => f.name?.endsWith(".pdf"));
                return (
                  <div key={sub.id} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", overflow: "hidden" }}>
                    <button onClick={() => setOpenSubject(isOpen ? null : sub.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: 44, height: 44, background: sub.color + "12", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{sub.icon}</div>
                        <div style={{ textAlign: "left" }}><h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1c1917", marginBottom: "2px" }}>{sub.name}</h3><span style={{ fontSize: "13px", color: "#9ca3af" }}>{pdfFiles.length} {pdfFiles.length === 1 ? "note" : "notes"}</span></div>
                      </div>
                      <span style={{ fontSize: "18px", color: "#d6d3d1", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 22px 22px", borderTop: "1px solid #e7e5e4" }}>
                        {pdfFiles.length === 0 ? <p style={{ fontSize: "14px", color: "#9ca3af", padding: "18px 0 10px" }}>No notes uploaded yet.</p> : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px 0 10px" }}>
                            {pdfFiles.map((file) => (
                              <div key={file.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fafaf9", borderRadius: "10px", border: "1px solid #f5f5f4" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span>📄</span><span style={{ fontSize: "14px", color: "#1c1917", fontWeight: 500 }}>{file.name.replace(/^[^_]+_\d+_/, "")}</span></div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <a href={getUrl(sub.id, file.name)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#F97316", fontWeight: 500, padding: "6px 14px", borderRadius: "8px", background: "rgba(249,115,22,0.08)", textDecoration: "none" }}>View PDF</a>
                                  {isEducator && <button onClick={() => handleDelete(sub.id, file.name)} style={{ fontSize: "13px", color: "#EF4444", fontWeight: 500, padding: "6px 14px", borderRadius: "8px", background: "#FEF2F2", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {isEducator && <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.7 : 1 }}>{uploading ? "Uploading..." : "Upload PDF"}<input type="file" accept=".pdf" hidden disabled={uploading} onChange={(e) => handleUpload(sub.id, e.target.files?.[0])}/></label>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        );
      }}
    </AppShell>
  );
}
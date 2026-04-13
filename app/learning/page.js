"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// ── Hardcoded subjects for demo — add/edit these as needed ──
const SUBJECTS = [
  { id: "molecular-biology", name: "Molecular Biology", icon: "🧬", color: "#5B4FD8" },
  { id: "biochemistry", name: "Biochemistry", icon: "⚗️", color: "#0F6E56" },
  { id: "microbiology", name: "Microbiology", icon: "🦠", color: "#DC2626" },
  { id: "genetics", name: "Genetics", icon: "🔬", color: "#854F0B" },
  { id: "bioinformatics", name: "Bioinformatics", icon: "💻", color: "#378ADD" },
  { id: "bioprocess-engineering", name: "Bioprocess Engineering", icon: "🏭", color: "#D4537E" },
];

export default function LearningPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null); // State to hold user profile data
  const [openSubject, setOpenSubject] = useState(null); // State to track which subject accordion is open
  const [notes, setNotes] = useState({}); // State to hold notes for each subject, structured as { subjectId: [file1, file2, ...] }
  const [uploading, setUploading] = useState(false); // State to track if a file upload is in progress

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser(); // Get current user from SPB auth
      if (!user) { router.push("/login"); return; } // If no user, redirect to login
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); // Fetch user profile from "profiles" table where id matches user.id
      setProfile(data); // Save profile data to state
      loadAllNotes(); // Load notes for all subjects after we have the user profile
    }
    load();
  }, []);

  async function loadAllNotes() {
    const result = {};
    for (const sub of SUBJECTS) {
      const { data } = await supabase.storage.from("course-materials").list(sub.id);
      result[sub.id] = data || [];
    }
    setNotes(result);
  }

  async function handleUpload(subjectId, file) {
    if (!file || !file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file");
      return;
    }
    setUploading(true);
    const fileName = `${profile.id.slice(0, 8)}_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("course-materials")
      .upload(`${subjectId}/${fileName}`, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      await loadAllNotes();
    }
    setUploading(false);
  }

  function getPublicUrl(subjectId, fileName) {
    const { data } = supabase.storage.from("course-materials").getPublicUrl(`${subjectId}/${fileName}`);
    return data.publicUrl;
  }

  async function handleDelete(subjectId, fileName) {
    if (!confirm("Delete this note?")) return;
    await supabase.storage.from("course-materials").remove([`${subjectId}/${fileName}`]);
    await loadAllNotes();
  }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher";

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      {/* Navbar */}
      <nav style={styles.nav}>
        <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }, { label: "Events", href: "/eventss" }].map((item) => (
            <a key={item.label} href={item.href} style={{
              fontSize: "14px", color: item.label === "Learning" ? "#5B4FD8" : "#4a4a6a",
              padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Learning" ? 600 : 400,
              background: item.label === "Learning" ? "#EEEDFE" : "transparent", textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 34, height: 34, background: "#EEEDFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#5B4FD8" }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{profile?.full_name?.split(" ")[0]}</span>
        </div>
      </nav>

      {/* Header */}
      <section style={{ textAlign: "center", padding: "48px 20px 24px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1a1a2e", marginBottom: "8px" }}>
          Learning Hub
        </h1>
        <p style={{ fontSize: "16px", color: "#666" }}>Access study materials and notes organized by subject</p>
      </section>

      {/* Subjects list */}
      <section style={{ padding: "0 max(24px, calc((100vw - 800px)/2)) 60px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SUBJECTS.map((sub) => {
            const isOpen = openSubject === sub.id;
            const subNotes = notes[sub.id] || [];
            const pdfFiles = subNotes.filter(f => f.name && f.name.endsWith(".pdf"));

            return (
              <div key={sub.id} style={{ background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px", overflow: "hidden" }}>
                {/* Subject header */}
                <button
                  onClick={() => setOpenSubject(isOpen ? null : sub.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: 44, height: 44, background: sub.color + "15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                      {sub.icon}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", marginBottom: "2px" }}>{sub.name}</h3>
                      <span style={{ fontSize: "13px", color: "#888" }}>{pdfFiles.length} {pdfFiles.length === 1 ? "note" : "notes"}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "20px", color: "#999", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: "0 24px 24px", borderTop: "1px solid #E8E6F8" }}>

                    {/* PDF list */}
                    {pdfFiles.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#999", padding: "20px 0 12px" }}>No notes uploaded yet for this subject.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 0 12px" }}>
                        {pdfFiles.map((file) => (
                          <div key={file.name} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px", background: "#F9F8FF", borderRadius: "10px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "18px" }}>📄</span>
                              <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>
                                {file.name.split("_").slice(1).join("_")}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <a
                                href={getPublicUrl(sub.id, file.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "13px", color: "#5B4FD8", fontWeight: 500,
                                  padding: "6px 14px", borderRadius: "8px", background: "#EEEDFE",
                                  textDecoration: "none",
                                }}
                              >
                                View PDF
                              </a>
                              {isEducator && file.name.startsWith(profile?.id?.slice(0, 8)) && (
                                <button onClick={() => handleDelete(sub.id, file.name)} style={{
                                  fontSize: "13px", color: "#DC2626", fontWeight: 500,
                                  padding: "6px 14px", borderRadius: "8px", background: "#FEF2F2",
                                  border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                }}>Delete</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button (educators/researchers only) */}
                    {isEducator && (
                      <label style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "10px 18px", background: "#5B4FD8", color: "#fff",
                        borderRadius: "10px", fontSize: "14px", fontWeight: 500,
                        cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.7 : 1,
                      }}>
                        {uploading ? "Uploading..." : "Upload PDF"}
                        <input
                          type="file"
                          accept=".pdf"
                          hidden
                          disabled={uploading}
                          onChange={(e) => handleUpload(sub.id, e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main >
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F4FB; }
`;

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#F5F4FB",
    color: "#1a1a2e",
  },
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(245,244,251,0.85)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E8E6F8",
    padding: "0 max(24px, calc((100vw - 1160px)/2))",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: "64px",
  },
};
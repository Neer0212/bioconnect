"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <main style={styles.page}>
      <style>{globalCSS}</style>
      <p style={{ color: "#666" }}>Loading...</p>
    </main>
  );

  const isEducator = profile?.role === "educator";
  const isResearcher = profile?.role === "researcher";

  const studentCards = [
    { icon: "👤", title: "My Profile", desc: "View and edit your profile", stat: capitalize(profile?.role), color: "#5B4FD8" },
    { icon: "📚", title: "My Courses", desc: "Continue your learning", stat: "0 enrolled", color: "#0F6E56" },
    { icon: "💼", title: "Internships", desc: "Find opportunities to gain experience", stat: "Browse", color: "#5B4FD8" },
    { icon: "📄", title: "Research Library", desc: "Explore scientific publications", stat: "Browse", color: "#854F0B" },
    { icon: "📈", title: "Learning Progress", desc: "Track your achievements", stat: "0% complete", color: "#0F6E56" },
    { icon: "📅", title: "Events", desc: "Join webinars and workshops", stat: "Browse", color: "#DC2626" },
  ];

  const educatorCards = [
    { icon: "👤", title: "My Profile", desc: "View and edit your profile", stat: capitalize(profile?.role), color: "#5B4FD8" },
    { icon: "📖", title: "My Courses", desc: "Manage your teaching content", stat: "0 teaching", color: "#0F6E56" },
    { icon: "➕", title: "Create Course", desc: "Design a new learning experience", stat: "Start now", color: "#0F6E56" },
    { icon: "👥", title: "Students", desc: "View and manage enrollments", stat: "0 enrolled", color: "#5B4FD8" },
    { icon: "📄", title: "Research Papers", desc: "Browse latest publications", stat: "Browse", color: "#854F0B" },
    { icon: "📅", title: "Events", desc: "Host or attend conferences", stat: "Browse", color: "#DC2626" },
  ];

  const cards = (isEducator || isResearcher) ? educatorCards : studentCards;
  const greeting = isEducator ? "Inspire and educate the next generation" : isResearcher ? "Push the boundaries of knowledge" : "Your learning journey awaits";

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 32, height: 32, background: "#5B4FD8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {["Dashboard", "Learning", "Jobs", "Research", "Events"].map((item) => (
            <a key={item} href={item === "Dashboard" ? "/dashboard" : item === "Learning" ? "/learning" : "#"} style={{
              fontSize: "14px", color: item === "Dashboard" ? "#5B4FD8" : "#4a4a6a",
              padding: "6px 12px", borderRadius: "8px",
              fontWeight: item === "Dashboard" ? 600 : 400,
              background: item === "Dashboard" ? "#EEEDFE" : "transparent",
              textDecoration: "none",
            }}>{item}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 34, height: 34, background: "#EEEDFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#5B4FD8" }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{profile?.full_name?.split(" ")[0]}</span>
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#666" }} title="Logout">↗</button>
        </div>
      </nav>

      {/* Welcome */}
      <section style={{ textAlign: "center", padding: "48px 20px 16px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1a1a2e", marginBottom: "8px" }}>
          Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!
        </h1>
        <p style={{ fontSize: "16px", color: "#666" }}>{greeting}</p>
      </section>

      {/* Cards */}
      <section style={{ padding: "24px max(24px, calc((100vw - 900px)/2)) 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {cards.map((c) => (
            <div key={c.title} style={styles.card}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{c.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", marginBottom: "4px" }}>{c.title}</h3>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>{c.desc}</p>
              <span style={{ fontSize: "14px", fontWeight: 600, color: c.color }}>{c.stat}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
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
  card: {
    background: "#fff",
    border: "1px solid #E8E6F8",
    borderRadius: "16px",
    padding: "28px 24px",
    textAlign: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
};
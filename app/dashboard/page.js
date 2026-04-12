//This file does 3 main things:
//1. Checks if user is logged in
//2. Fetches user data from database
//3. Shows dashboard UI

"use client"; //This tells Next.js: “This page runs on the browser (not server)”
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; //Connects to SPB. This is backend connection
import { useRouter } from "next/navigation"; // Next.js hook for navigating programmatically (like redirecting after logout)

export default function DashboardPage() // Main dashboard component 
{
  const supabase = createClient(); // Connection to SPB
  const router = useRouter(); // Hook to navigate programmatically (like redirecting after logout)
  const [profile, setProfile] = useState(null); // State to hold user profile data
  const [loading, setLoading] = useState(true); // State to track if we're still loading user data

  useEffect(() => // On component mount, check if user is logged in and fetch profile data 
  {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser(); // Get current user from SPB auth
      if (!user) { router.push("/login"); return; } // If no user, redirect to login
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); // Fetch user profile from "profiles" table where id matches user.id
      setProfile(data); // Save profile data to state
      setLoading(false); // Set loading to false since we have the data now
    }
    load();
  }, []);

  async function handleLogout() // Function to log the user out
  {
    await supabase.auth.signOut(); // Log the user out from SPB
    router.push("/login"); // After logging out, redirect to login page
  }

  if (loading) return (
    <main style={styles.page}><style>{globalCSS}</style>
      <p style={{ textAlign: "center", padding: "100px 20px", color: "#666" }}>Loading...</p>
    </main>
  ); // While loading user data, show a simple loading message

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const role = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student";
  const isEducator = profile?.role === "educator" || profile?.role === "researcher"; // Simple check to determine if user is an educator (could be expanded based on actual roles in your app)

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      <nav style={styles.nav}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning", href: "/learning" }, { label: "Research", href: "/research" }].map((item) => (
            <a key={item.label} href={item.href} style={{
              fontSize: "14px", color: item.label === "Dashboard" ? "#5B4FD8" : "#4a4a6a",
              padding: "6px 14px", borderRadius: "8px", fontWeight: item.label === "Dashboard" ? 600 : 400,
              background: item.label === "Dashboard" ? "#EEEDFE" : "transparent", textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 34, height: 34, background: "#EEEDFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#5B4FD8" }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{firstName}</span>
          <button onClick={handleLogout} style={{ background: "#FEF2F2", border: "none", cursor: "pointer", fontSize: "13px", color: "#DC2626", padding: "6px 14px", borderRadius: "8px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Logout</button>
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "56px 20px 20px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#1a1a2e", marginBottom: "8px" }}>
          Welcome back, {firstName}!
        </h1>
        <p style={{ fontSize: "16px", color: "#666" }}>
          {isEducator ? "Manage your content and inspire learners" : "Your academic journey continues here"}
        </p>
      </section>

      <section style={{ padding: "32px max(24px, calc((100vw - 860px)/2)) 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>

          <a href="/profile" style={{ textDecoration: "none" }}>
            <div style={styles.card}>
              <div style={{ ...styles.iconBox, background: "#EEEDFE" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4FD8" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3 style={styles.cardTitle}>My Profile</h3>
              <p style={styles.cardDesc}>View and edit your details</p>
              <div style={{ marginTop: "16px", padding: "8px 16px", background: "#F9F8FF", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "#5B4FD8", fontWeight: 600 }}>{role}</span>
                <span style={{ fontSize: "12px", color: "#999", marginLeft: "8px" }}>{profile?.university || "No university set"}</span>
              </div>
            </div>
          </a>

          <a href="/learning" style={{ textDecoration: "none" }}>
            <div style={styles.card}>
              <div style={{ ...styles.iconBox, background: "#E1F5EE" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <h3 style={styles.cardTitle}>Learning Hub</h3>
              <p style={styles.cardDesc}>{isEducator ? "Upload & manage study materials" : "Access subject-wise study materials"}</p>
              <div style={{ marginTop: "16px", padding: "8px 16px", background: "#F0FDF8", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "#0F6E56", fontWeight: 600 }}>{isEducator ? "Manage content →" : "Start learning →"}</span>
              </div>
            </div>
          </a>

          <a href="/research" style={{ textDecoration: "none" }}>
            <div style={styles.card}>
              <div style={{ ...styles.iconBox, background: "#FAEEDA" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 style={styles.cardTitle}>Research Papers</h3>
              <p style={styles.cardDesc}>Browse scientific publications</p>
              <div style={{ marginTop: "16px", padding: "8px 16px", background: "#FEF9F0", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "#854F0B", fontWeight: 600 }}>Browse papers →</span>
              </div>
            </div>
          </a>

        </div>
      </section>
    </main>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F4FB; }
  @media (max-width: 768px) {
    section > div > div { grid-template-columns: 1fr !important; }
  }
`;

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#F5F4FB", color: "#1a1a2e" },
  nav: {
    position: "sticky", top: 0, zIndex: 100, background: "rgba(245,244,251,0.85)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E8E6F8", padding: "0 max(24px, calc((100vw - 1160px)/2))",
    display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px",
  },
  card: {
    background: "#fff", border: "1px solid #E8E6F8", borderRadius: "16px",
    padding: "32px 28px", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", height: "100%",
  },
  iconBox: { width: 52, height: 52, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  cardTitle: { fontSize: "18px", fontWeight: 600, color: "#1a1a2e", marginBottom: "6px" },
  cardDesc: { fontSize: "14px", color: "#666", lineHeight: "1.5" },
};
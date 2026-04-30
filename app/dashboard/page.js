"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); }
    }
    load();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const role = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student";
  const isEducator = profile?.role === "educator" || profile?.role === "researcher";

  return (
    <AppShell active="/dashboard">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Welcome back, {firstName}!</h1>
        <p style={{ fontSize: "15px", color: "#9ca3af" }}>{isEducator ? "Manage your content and inspire learners" : "Your academic journey continues here"}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
        {[
          { label: "Role", value: role, icon: "👤", color: "#F97316" },
          { label: isEducator ? "Content Shared" : "Courses Available", value: "6 subjects", icon: "📚", color: "#06B6D4" },
          { label: "University", value: profile?.university || "Not set", icon: "🏛️", color: "#A855F7" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 48, height: 48, borderRadius: "12px", background: s.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.icon}</div>
            <div><p style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{s.label}</p><p style={{ fontSize: "18px", fontWeight: 600, color: "#1c1917" }}>{s.value}</p></div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1c1917", marginBottom: "16px" }}>Quick Access</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { title: "Learning Hub", desc: isEducator ? "Upload & manage study materials" : "Access subject-wise study materials", href: "/learning", emoji: "🧬", cta: isEducator ? "Manage content →" : "Start learning →", color: "#F97316" },
          { title: "Research Papers", desc: "Browse scientific publications", href: "/research", emoji: "📄", cta: "Browse papers →", color: "#A855F7" },
          { title: "Events", desc: "Conferences, webinars, and workshops", href: "/eventss", emoji: "📅", cta: "View events →", color: "#06B6D4" },
        ].map((c) => (
          <a key={c.title} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "28px 24px", cursor: "pointer", height: "100%" }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>{c.emoji}</span>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "6px" }}>{c.title}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "16px" }}>{c.desc}</p>
              <span style={{ fontSize: "13px", color: c.color, fontWeight: 600 }}>{c.cta}</span>
            </div>
          </a>
        ))}
      </div>
    </AppShell>
  );
}
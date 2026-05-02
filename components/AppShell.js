"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { label: "Learning", href: "/learning", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { label: "Research", href: "/research", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Jobs", href: "/jobs", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Events", href: "/eventss", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Profile", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function AppShell({ children, active }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <p style={{ color: "#9ca3af", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Loading...</p>
    </div>
  );

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const currentPath = active || pathname;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF9", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          {/* Logo */}
          <a href="/" className="sb-logo">
            <img src="/logo.png" alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover" }} />
            <div className="sb-logo-text">
              <span className="sb-brand">BioConnect</span>
              <span className="sb-sub">Academic Portal</span>
            </div>
          </a>

          {/* Nav items */}
          <nav className="sb-nav">
            {NAV.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
              return (
                <a key={item.label} href={item.href} className={`sb-item ${isActive ? "sb-active" : ""}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                  <span>{item.label}</span>
                  {isActive && <div className="sb-indicator"></div>}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <button onClick={handleLogout} className="sb-logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header className="topbar">
          <div></div>
          <div className="topbar-right">
            <span className="topbar-name">{profile?.full_name}</span>
            <div className="topbar-avatar">{firstName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px 40px 60px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export { NAV };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#FAFAF9;overflow-x:hidden}

.sidebar{
  width:240px;background:#080B16;display:flex;flex-direction:column;
  justify-content:space-between;padding:24px 16px;position:fixed;
  top:0;left:0;bottom:0;z-index:50;
}
.sb-logo{display:flex;align-items:center;gap:10px;text-decoration:none;padding:4px 8px;margin-bottom:32px}
.sb-logo-text{display:flex;flex-direction:column}
.sb-brand{font-family:'Instrument Serif',serif;font-size:18px;color:#fff;line-height:1.2}
.sb-sub{font-size:11px;color:rgba(255,255,255,0.3);font-weight:400;text-transform:uppercase;letter-spacing:0.5px}
.sb-nav{display:flex;flex-direction:column;gap:4px}
.sb-item{
  display:flex;align-items:center;gap:12px;padding:10px 14px;
  border-radius:10px;font-size:14px;color:rgba(255,255,255,0.4);
  text-decoration:none;transition:all 0.2s;position:relative;font-weight:400;
}
.sb-item:hover{color:rgba(255,255,255,0.7);background:rgba(255,255,255,0.04)}
.sb-active{color:#F97316!important;background:rgba(249,115,22,0.08)!important;font-weight:500}
.sb-indicator{position:absolute;right:-16px;top:8px;bottom:8px;width:3px;background:#F97316;border-radius:3px 0 0 3px}
.sb-logout{
  display:flex;align-items:center;gap:12px;padding:10px 14px;
  border-radius:10px;font-size:14px;color:rgba(239,68,68,0.7);
  background:none;border:none;cursor:pointer;transition:all 0.2s;
  font-family:'Plus Jakarta Sans',sans-serif;width:100%;
}
.sb-logout:hover{color:#EF4444;background:rgba(239,68,68,0.08)}

.topbar{
  height:64px;display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;border-bottom:1px solid #e7e5e4;background:#fff;
  margin-left:240px;position:sticky;top:0;z-index:40;
}
.topbar-right{display:flex;align-items:center;gap:12px}
.topbar-name{font-size:14px;color:#44403c;font-weight:500}
.topbar-avatar{
  width:36px;height:36px;background:rgba(249,115,22,0.1);border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-weight:600;font-size:14px;color:#F97316;
}

main{margin-left:240px}

@media(max-width:768px){
  .sidebar{width:64px;padding:16px 8px}
  .sb-logo-text,.sb-item span,.sb-logout span,.sb-sub{display:none}
  .sb-logo{justify-content:center;margin-bottom:24px}
  .sb-item{justify-content:center;padding:10px}
  .sb-logout{justify-content:center;padding:10px}
  .sb-indicator{right:-8px}
  .topbar{margin-left:64px;padding:0 20px}
  main{margin-left:64px;padding:24px 20px 40px!important}
}
`;
"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

// Smart category detection based on job title/description keywords
function detectCategory(job) {
  if (job.category && job.category !== "Other") return job.category;
  const text = `${job.title} ${job.description} ${(job.skills || []).join(" ")}`.toLowerCase();
  if (/\bintern\b|internship|trainee|apprentice/i.test(text)) return "Internship";
  if (/bioinformatics|computational|data.?scien|machine.?learn|genomic.?data|python|algorithm/i.test(text)) return "Bioinformatics";
  if (/clinical|trial|patient|cro\b|regulatory|pharmacovig/i.test(text)) return "Clinical";
  if (/research|scientist|r&d|laboratory|molecular|genomic|cell.?bio|biochem|microb/i.test(text)) return "Research";
  if (/manufactur|production|process|quality|gmp|validation|batch/i.test(text)) return "Manufacturing";
  if (/sales|marketing|business.?dev|commercial|key.?account/i.test(text)) return "Sales";
  if (/regulat|compliance|audit|affairs/i.test(text)) return "Regulatory";
  return "Other";
}

const INDUSTRIES = ["Research", "Clinical", "Manufacturing", "Bioinformatics", "Sales", "Regulatory", "Internship"];
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

export default function JobsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); }
      const res = await fetch("/api/jobs?limit=500");
      const data = await res.json();
      // Apply smart categorization to all jobs
      const enriched = (data.jobs || []).map(j => ({ ...j, category: detectCategory(j), company: j.company?.split("(")[0]?.trim() || j.company }));
      setAllJobs(enriched);
      setLastUpdated(data.last_updated);
      setLoading(false);
    }
    load();
  }, []);

  function toggleCategory(cat) {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }
  function toggleType(type) {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }
  function clearFilters() { setSelectedCategories([]); setSelectedTypes([]); setSearch(""); }

  const filtered = allJobs.filter(job => {
    const q = search.toLowerCase();
    const matchSearch = !q || job.title?.toLowerCase().includes(q) || job.company?.toLowerCase().includes(q) || job.description?.toLowerCase().includes(q) || job.skills?.some(s => s.toLowerCase().includes(q));
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(job.category);
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(job.job_type);
    return matchSearch && matchCat && matchType;
  });

  // Count jobs per category for the sidebar
  const catCounts = {};
  allJobs.forEach(j => { catCounts[j.category] = (catCounts[j.category] || 0) + 1; });

  return (
    <AppShell active="/jobs">
      <style>{`
        .job-card{background:#fff;border:1px solid #e7e5e4;border-radius:14px;padding:24px 28px;transition:all .2s}
        .job-card:hover{border-color:rgba(249,115,22,0.2);box-shadow:0 8px 24px rgba(0,0,0,0.04)}
        .filter-check{display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 0;font-size:14px;color:#44403c}
        .filter-check input{width:16px;height:16px;accent-color:#F97316;cursor:pointer}
        .filter-check .count{margin-left:auto;font-size:12px;color:#9ca3af;background:#f5f5f4;padding:2px 8px;border-radius:100px}
        .skill-tag{font-size:12px;background:#f5f5f4;color:#44403c;padding:4px 10px;border-radius:6px;display:inline-block}
        @media(max-width:768px){.jobs-layout{flex-direction:column!important}.filter-sidebar{width:100%!important;position:static!important}}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Career Hub</h1>
          <p style={{ fontSize: "15px", color: "#9ca3af" }}>Connect with leading biotech firms and research institutions across India</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)", borderRadius: "10px", padding: "8px 14px", flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
          <span style={{ fontSize: "12px", color: "#F97316", fontWeight: 500 }}>Auto-updated every 4h</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "24px" }}>
        <input type="text" placeholder="Search roles, companies, or skills..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "14px 18px", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "15px", fontFamily: "inherit", outline: "none", background: "#fff", color: "#1c1917" }}/>
      </div>

      {/* Results count + last updated */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "14px", color: "#6b7280" }}>Showing <strong style={{ color: "#1c1917" }}>{filtered.length}</strong> results</span>
        {lastUpdated && <span style={{ fontSize: "12px", color: "#9ca3af" }}>Updated {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
      </div>

      {/* Main layout: sidebar + jobs */}
      <div className="jobs-layout" style={{ display: "flex", gap: "28px" }}>

        {/* Left filter sidebar */}
        <div className="filter-sidebar" style={{ width: "220px", flexShrink: 0, position: "sticky", top: "96px", alignSelf: "flex-start" }}>
          <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917", textTransform: "uppercase", letterSpacing: "0.5px" }}>Filters</span>
              {(selectedCategories.length > 0 || selectedTypes.length > 0) && <button onClick={clearFilters} style={{ fontSize: "12px", color: "#F97316", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Clear All</button>}
            </div>

            {/* Industry */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#44403c", marginBottom: "10px" }}>Industry</p>
              {INDUSTRIES.map(cat => (
                <label key={cat} className="filter-check">
                  <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)}/>
                  <span>{cat}</span>
                  {catCounts[cat] > 0 && <span className="count">{catCounts[cat]}</span>}
                </label>
              ))}
            </div>

            {/* Job Type */}
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#44403c", marginBottom: "10px" }}>Job Type</p>
              {JOB_TYPES.map(type => (
                <label key={type} className="filter-check">
                  <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)}/>
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}><p>Loading jobs...</p></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}>
              <p style={{ fontSize: "16px", marginBottom: "4px" }}>No jobs match your filters</p>
              <p style={{ fontSize: "14px" }}>Try adjusting your search or filters</p>
              <button onClick={clearFilters} style={{ marginTop: "12px", fontSize: "14px", color: "#F97316", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>Clear all filters</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filtered.map(job => {
                const catColors = { Research: "#A855F7", Clinical: "#06B6D4", Manufacturing: "#F97316", Bioinformatics: "#3B82F6", Sales: "#EC4899", Regulatory: "#10B981", Internship: "#F59E0B", Other: "#6b7280" };
                const cc = catColors[job.category] || catColors.Other;

                return (
                  <div key={job.job_id} className="job-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title */}
                        <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#1c1917", marginBottom: "4px" }}>{job.title}</h3>

                        {/* Company + Location */}
                        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "10px" }}>
                          <span style={{ fontWeight: 500, color: "#44403c" }}>{job.company}</span>
                          {job.location && <span> · {job.location}</span>}
                          {job.experience && <span> · {job.experience}</span>}
                        </p>

                        {/* Description */}
                        {job.description && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "12px" }}>{job.description.length > 180 ? job.description.slice(0, 180) + "..." : job.description}</p>}

                        {/* Tags row */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                          {job.job_type && <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: "#f5f5f4", color: "#44403c", textTransform: "uppercase", letterSpacing: "0.3px" }}>{job.job_type}</span>}
                          {job.category && job.category !== "Other" && <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: cc + "12", color: cc, textTransform: "uppercase", letterSpacing: "0.3px" }}>{job.category}</span>}
                          {job.skills?.slice(0, 4).map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                          {job.skills?.length > 4 && <span style={{ fontSize: "12px", color: "#9ca3af", padding: "4px 0" }}>+{job.skills.length - 4}</span>}
                        </div>

                        {/* Salary + source */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          {job.salary && <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917" }}>{job.salary}</span>}
                          {job.source && <span style={{ fontSize: "12px", color: "#9ca3af" }}>via {job.source.split("(")[0].trim()}</span>}
                        </div>
                      </div>

                      {/* Apply button */}
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, background: "#1c1917", color: "#fff", padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                          Apply Now
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

function detectCategory(job) {
  if (job.category && job.category !== "Other") return job.category;
  const text = `${job.title} ${job.description || ""} ${(job.skills || []).join(" ")}`.toLowerCase();
  if (/\bintern\b|internship|trainee|apprentice/i.test(text)) return "Internship";
  if (/bioinformatics|computational|data.?scien|machine.?learn|genomic.?data|python|algorithm/i.test(text)) return "Bioinformatics";
  if (/clinical|trial|patient|cro\b|pharmacovig/i.test(text)) return "Clinical";
  if (/research|scientist|r&d|laboratory|molecular|genomic|cell.?bio|biochem|microb/i.test(text)) return "Research";
  if (/manufactur|production|process|quality|gmp|validation|batch/i.test(text)) return "Manufacturing";
  if (/sales|marketing|business.?dev|commercial/i.test(text)) return "Sales";
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
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", location: "India", job_type: "Full-time", experience: "", salary: "", description: "", skills: "", apply_url: "", category: "Research" });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); }

    // Load scraped jobs
    let scraped = [];
    try {
      const res = await fetch("/api/jobs?limit=500");
      const data = await res.json();
      scraped = (data.jobs || []).map(j => ({
        ...j,
        category: detectCategory(j),
        company: j.company?.split("(")[0]?.trim() || j.company,
        _source: "scraped",
        _id: j.job_id,
      }));
      setLastUpdated(data.last_updated);
    } catch (e) { console.error("Failed to load scraped jobs", e); }

    // Load manual jobs from Supabase
    const { data: manual } = await supabase.from("manual_jobs").select("*, profiles(full_name)").eq("is_active", true).order("created_at", { ascending: false });
    const manualJobs = (manual || []).map(j => ({
      title: j.title,
      company: j.company,
      location: j.location,
      job_type: j.job_type,
      experience: j.experience,
      salary: j.salary,
      description: j.description,
      skills: j.skills || [],
      url: j.apply_url,
      category: j.category || detectCategory(j),
      posted_by: j.posted_by,
      posted_by_name: j.profiles?.full_name,
      _source: "manual",
      _id: j.id,
      _supabaseId: j.id,
      created_at: j.created_at,
    }));

    // Merge: manual jobs first (they have better data), then scraped
    setAllJobs([...manualJobs, ...scraped]);
    setLoading(false);
  }

  async function handleAddJob(e) {
    e.preventDefault();
    setSaving(true);
    const skills = form.skills.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("manual_jobs").insert({
      posted_by: profile.id,
      title: form.title,
      company: form.company,
      location: form.location,
      job_type: form.job_type,
      experience: form.experience,
      salary: form.salary,
      description: form.description,
      skills,
      apply_url: form.apply_url,
      category: form.category,
    });
    if (error) { alert("Error: " + error.message); }
    else {
      setShowAdd(false);
      setForm({ title: "", company: "", location: "India", job_type: "Full-time", experience: "", salary: "", description: "", skills: "", apply_url: "", category: "Research" });
      await loadAll();
    }
    setSaving(false);
  }

  async function handleDeleteManual(id) {
    if (!confirm("Delete this job posting?")) return;
    await supabase.from("manual_jobs").delete().eq("id", id);
    await loadAll();
  }

  function toggleCategory(cat) { setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]); }
  function toggleType(type) { setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]); }
  function clearFilters() { setSelectedCategories([]); setSelectedTypes([]); setSearch(""); }

  const isEducator = profile?.role === "educator" || profile?.role === "researcher" || profile?.role === "industry";

  const filtered = allJobs.filter(job => {
    const q = search.toLowerCase();
    const matchSearch = !q || job.title?.toLowerCase().includes(q) || job.company?.toLowerCase().includes(q) || job.description?.toLowerCase().includes(q) || job.skills?.some(s => s.toLowerCase().includes(q));
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(job.category);
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(job.job_type);
    return matchSearch && matchCat && matchType;
  });

  const catCounts = {};
  allJobs.forEach(j => { catCounts[j.category] = (catCounts[j.category] || 0) + 1; });

  const catColors = { Research: "#A855F7", Clinical: "#06B6D4", Manufacturing: "#F97316", Bioinformatics: "#3B82F6", Sales: "#EC4899", Regulatory: "#10B981", Internship: "#F59E0B", Other: "#6b7280" };

  return (
    <AppShell active="/jobs">
      <style>{`
        .job-card{background:#fff;border:1px solid #e7e5e4;border-radius:14px;padding:24px 28px;transition:all .2s}
        .job-card:hover{border-color:rgba(249,115,22,0.2);box-shadow:0 8px 24px rgba(0,0,0,0.04)}
        .job-card.featured{border-left:3px solid #F97316}
        .filter-check{display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 0;font-size:14px;color:#44403c}
        .filter-check input{width:16px;height:16px;accent-color:#F97316;cursor:pointer}
        .filter-check .count{margin-left:auto;font-size:12px;color:#9ca3af;background:#f5f5f4;padding:2px 8px;border-radius:100px}
        @media(max-width:768px){.jobs-layout{flex-direction:column!important}.filter-sidebar{width:100%!important;position:static!important}}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Career Hub</h1>
          <p style={{ fontSize: "15px", color: "#9ca3af" }}>Discover biotech opportunities across India</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isEducator && <button onClick={() => setShowAdd(!showAdd)} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>{showAdd ? "Cancel" : "+ Post Job"}</button>}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)", borderRadius: "10px", padding: "8px 12px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}></span>
            <span style={{ fontSize: "11px", color: "#F97316", fontWeight: 500 }}>Auto-updated</span>
          </div>
        </div>
      </div>

      {/* Add Job Form */}
      {showAdd && (
        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917", marginBottom: "4px" }}>Post a Job</h3>
          <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "20px" }}>Jobs you post will have a direct "Apply Now" link</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={L}>Job Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={I} placeholder="e.g. Research Scientist"/></div>
            <div><label style={L}>Company *</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} style={I} placeholder="e.g. Biocon"/></div>
            <div><label style={L}>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={I} placeholder="Mumbai, India"/></div>
            <div><label style={L}>Job Type</label><select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})} style={I}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Remote</option></select></div>
            <div><label style={L}>Experience</label><input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} style={I} placeholder="e.g. 2-4 years"/></div>
            <div><label style={L}>Salary</label><input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} style={I} placeholder="e.g. ₹6-10 LPA"/></div>
            <div><label style={L}>Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={I}>{INDUSTRIES.map(c => <option key={c}>{c}</option>)}<option>Other</option></select></div>
            <div><label style={L}>Skills <span style={{color:"#9ca3af",fontWeight:400}}>(comma separated)</span></label><input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} style={I} placeholder="CRISPR, PCR, Python"/></div>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Apply URL *</label><input value={form.apply_url} onChange={e => setForm({...form, apply_url: e.target.value})} style={I} placeholder="https://company.com/apply/job-id or email"/></div>
            <div style={{ gridColumn: "1/-1" }}><label style={L}>Job Description *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} style={{...I, resize: "vertical"}} placeholder="Describe the role, responsibilities, qualifications, and what makes this opportunity exciting..."/></div>
            <div style={{ gridColumn: "1/-1" }}><button onClick={handleAddJob} disabled={saving||!form.title||!form.company||!form.apply_url||!form.description} style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: saving||!form.title||!form.company||!form.apply_url||!form.description ? 0.5 : 1 }}>{saving ? "Posting..." : "Post Job"}</button></div>
          </div>
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="Search roles, companies, or skills..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "14px 18px", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "15px", fontFamily: "inherit", outline: "none", background: "#fff", color: "#1c1917", marginBottom: "16px" }}/>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "14px", color: "#6b7280" }}>Showing <strong style={{ color: "#1c1917" }}>{filtered.length}</strong> opportunities</span>
        {lastUpdated && <span style={{ fontSize: "12px", color: "#9ca3af" }}>Last scraped {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
      </div>

      {/* Layout */}
      <div className="jobs-layout" style={{ display: "flex", gap: "28px" }}>

        {/* Filters */}
        <div className="filter-sidebar" style={{ width: "220px", flexShrink: 0, position: "sticky", top: "96px", alignSelf: "flex-start" }}>
          <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917", textTransform: "uppercase", letterSpacing: "0.5px" }}>Filters</span>
              {(selectedCategories.length > 0 || selectedTypes.length > 0) && <button onClick={clearFilters} style={{ fontSize: "12px", color: "#F97316", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Clear All</button>}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#44403c", marginBottom: "10px" }}>Industry</p>
              {INDUSTRIES.map(cat => (
                <label key={cat} className="filter-check"><input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)}/><span>{cat}</span>{catCounts[cat] > 0 && <span className="count">{catCounts[cat]}</span>}</label>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#44403c", marginBottom: "10px" }}>Job Type</p>
              {JOB_TYPES.map(type => (<label key={type} className="filter-check"><input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)}/><span>{type}</span></label>))}
            </div>
          </div>
        </div>

        {/* Jobs */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af" }}>Loading...</div> : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af" }}>
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>No jobs match your filters</p>
              <button onClick={clearFilters} style={{ fontSize: "14px", color: "#F97316", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>Clear filters</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filtered.map(job => {
                const isManual = job._source === "manual";
                const cc = catColors[job.category] || catColors.Other;
                return (
                  <div key={job._id} className={`job-card ${isManual ? "featured" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Manual job badge */}
                        {isManual && <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 600, color: "#F97316", background: "rgba(249,115,22,0.08)", padding: "3px 8px", borderRadius: "4px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Direct Apply</span>}

                        {/* Title */}
                        <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#1c1917", marginBottom: "4px" }}>{job.title}</h3>

                        {/* Company + Location */}
                        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "10px" }}>
                          <span style={{ fontWeight: 500, color: "#44403c" }}>{job.company}</span>
                          {job.location && <span> · {job.location}</span>}
                          {job.experience && <span> · {job.experience}</span>}
                        </p>

                        {/* Description */}
                        {job.description && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "12px" }}>{job.description.length > 200 ? job.description.slice(0, 200) + "..." : job.description}</p>}

                        {/* Tags */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                          {job.job_type && <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: "#f5f5f4", color: "#44403c", textTransform: "uppercase", letterSpacing: "0.3px" }}>{job.job_type}</span>}
                          {job.category && job.category !== "Other" && <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: cc + "12", color: cc }}>{job.category}</span>}
                          {job.skills?.slice(0, 4).map((s, i) => <span key={i} style={{ fontSize: "12px", background: "#f5f5f4", color: "#44403c", padding: "4px 10px", borderRadius: "6px" }}>{s}</span>)}
                          {job.skills?.length > 4 && <span style={{ fontSize: "12px", color: "#9ca3af" }}>+{job.skills.length - 4}</span>}
                        </div>

                        {/* Salary + meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          {job.salary && <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917" }}>{job.salary}</span>}
                          {isManual && job.posted_by_name && <span style={{ fontSize: "12px", color: "#9ca3af" }}>Posted by {job.posted_by_name}</span>}
                          {!isManual && job.source && <span style={{ fontSize: "12px", color: "#9ca3af" }}>via {job.source?.split("(")[0]?.trim()}</span>}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" style={{
                            background: isManual ? "linear-gradient(135deg,#F97316,#EA580C)" : "#1c1917",
                            color: "#fff", padding: "10px 22px", borderRadius: "10px", fontSize: "14px",
                            fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", textAlign: "center",
                          }}>
                            {isManual ? "Apply Now →" : "Visit Career Page ↗"}
                          </a>
                        )}
                        {isManual && profile?.id === job.posted_by && (
                          <button onClick={() => handleDeleteManual(job._supabaseId)} style={{ fontSize: "12px", color: "#EF4444", background: "#FEF2F2", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                        )}
                      </div>
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

const L = { display: "block", fontSize: "13px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" };
const I = { width: "100%", padding: "10px 14px", border: "1.5px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", background: "#fff", color: "#1c1917" };
"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import AppShell from "@/components/AppShell";

const CATEGORIES = ["All", "Research", "Clinical", "Manufacturing", "Bioinformatics", "Sales", "Regulatory", "Other"];
const JOB_TYPES = ["All", "Full-time", "Part-time", "Internship", "Contract", "Remote"];

export default function JobsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single(); setProfile(data); }
    }
    loadProfile();
  }, []);

  const fetchJobs = useCallback(async (newOffset = 0) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: LIMIT, offset: newOffset });
    if (search) params.set("q", search);
    if (category !== "All") params.set("category", category);
    if (jobType !== "All") params.set("job_type", jobType);

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setTotal(data.total || 0);
    setLastUpdated(data.last_updated);
    setOffset(newOffset);
    setLoading(false);
  }, [search, category, jobType]);

  useEffect(() => { fetchJobs(0); }, [category, jobType]);

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs(0);
  }

  const categoryColors = {
    Research: { bg: "rgba(168,85,247,0.08)", color: "#A855F7" },
    Clinical: { bg: "rgba(6,182,212,0.08)", color: "#06B6D4" },
    Manufacturing: { bg: "rgba(249,115,22,0.08)", color: "#F97316" },
    Bioinformatics: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" },
    Sales: { bg: "rgba(236,72,153,0.08)", color: "#EC4899" },
    Regulatory: { bg: "rgba(16,185,129,0.08)", color: "#10B981" },
    Other: { bg: "#f5f5f4", color: "#6b7280" },
  };

  return (
    <AppShell active="/jobs">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#1c1917", marginBottom: "6px" }}>Jobs & Internships</h1>
          <p style={{ fontSize: "15px", color: "#9ca3af" }}>
            {total > 0 ? `${total} biotech opportunities` : "Biotech opportunities across India"}
            {lastUpdated && <span style={{ marginLeft: "8px", fontSize: "12px" }}>· Updated {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: "10px", padding: "8px 14px" }}>
          <span style={{ fontSize: "12px", color: "#F97316", fontWeight: 600 }}>🤖 Auto-updated every 4h</span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text" placeholder="Search by title, company, or skill..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", border: "1px solid #e7e5e4", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#fff", color: "#1c1917" }}
        />
        <button type="submit" style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Search</button>
      </form>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "13px", border: "1px solid", cursor: "pointer", fontFamily: "inherit", background: category === c ? "#1c1917" : "#fff", color: category === c ? "#fff" : "#6b7280", borderColor: category === c ? "#1c1917" : "#e7e5e4" }}>{c}</button>
          ))}
        </div>
        <div style={{ width: "1px", background: "#e7e5e4", margin: "0 4px" }}></div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {JOB_TYPES.map(t => (
            <button key={t} onClick={() => setJobType(t)} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "13px", border: "1px solid", cursor: "pointer", fontFamily: "inherit", background: jobType === t ? "linear-gradient(135deg,#F97316,#EA580C)" : "#fff", color: jobType === t ? "#fff" : "#6b7280", borderColor: jobType === t ? "#F97316" : "#e7e5e4" }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Jobs list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <p style={{ fontSize: "16px" }}>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <p style={{ fontSize: "16px", marginBottom: "4px" }}>No jobs found</p>
          <p style={{ fontSize: "14px" }}>Try a different search or filter</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {jobs.map((job) => {
              const cc = categoryColors[job.category] || categoryColors.Other;
              return (
                <div key={job.job_id} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "22px 26px", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      {/* Title + badges */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917" }}>{job.title}</h3>
                        {job.category && job.category !== "Other" && (
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: cc.bg, color: cc.color }}>{job.category}</span>
                        )}
                        {job.job_type && (
                          <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "100px", background: "#f5f5f4", color: "#6b7280", fontWeight: 500 }}>{job.job_type}</span>
                        )}
                      </div>

                      {/* Company + location */}
                      <div style={{ display: "flex", gap: "16px", marginBottom: "10px", fontSize: "14px" }}>
                        <span style={{ color: "#44403c", fontWeight: 500 }}>🏢 {job.company}</span>
                        {job.location && <span style={{ color: "#6b7280" }}>📍 {job.location}</span>}
                        {job.experience && <span style={{ color: "#6b7280" }}>⏱ {job.experience}</span>}
                        {job.salary && <span style={{ color: "#10B981", fontWeight: 500 }}>💰 {job.salary}</span>}
                      </div>

                      {/* Description */}
                      {job.description && <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", marginBottom: "10px" }}>{job.description.length > 200 ? job.description.slice(0, 200) + "..." : job.description}</p>}

                      {/* Skills */}
                      {job.skills?.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {job.skills.slice(0, 6).map((skill, i) => (
                            <span key={i} style={{ fontSize: "12px", background: "#f5f5f4", color: "#44403c", padding: "3px 10px", borderRadius: "6px" }}>{skill}</span>
                          ))}
                          {job.skills.length > 6 && <span style={{ fontSize: "12px", color: "#9ca3af" }}>+{job.skills.length - 6} more</span>}
                        </div>
                      )}

                      {/* Source + date */}
                      <div style={{ marginTop: "10px", display: "flex", gap: "12px" }}>
                        {job.source && <span style={{ fontSize: "12px", color: "#9ca3af" }}>via {job.source}</span>}
                        {job.posted_date && <span style={{ fontSize: "12px", color: "#9ca3af" }}>{job.posted_date}</span>}
                      </div>
                    </div>

                    {/* Apply button */}
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
                        Apply →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", padding: "16px 0" }}>
            <span style={{ fontSize: "14px", color: "#9ca3af" }}>Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {offset > 0 && <button onClick={() => fetchJobs(offset - LIMIT)} style={{ padding: "8px 20px", borderRadius: "8px", fontSize: "14px", border: "1px solid #e7e5e4", background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#44403c" }}>← Previous</button>}
              {offset + LIMIT < total && <button onClick={() => fetchJobs(offset + LIMIT)} style={{ padding: "8px 20px", borderRadius: "8px", fontSize: "14px", background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Next →</button>}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let cachedData = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function loadJobs() {
  const now = Date.now();
  if (cachedData && now - cacheTime < CACHE_TTL) {
    return cachedData;
  }
  try {
    const filePath = path.join(process.cwd(), "public", "jobs.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    cachedData = JSON.parse(raw);
    cacheTime = now;
    return cachedData;
  } catch (err) {
    console.error("Failed to load jobs.json:", err.message);
    return { jobs: [], total: 0, last_updated: null };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const data = loadJobs();
  let jobs = data.jobs || [];

  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const category = searchParams.get("category") || "";
  const location = (searchParams.get("location") || "").toLowerCase();
  const jobType = searchParams.get("job_type") || "";
  const limit = Math.min(parseInt(searchParams.get("limit")) || 100, 500);
  const offset = parseInt(searchParams.get("offset")) || 0;

  if (q) {
    jobs = jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.company?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.skills?.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (category) jobs = jobs.filter((j) => j.category === category);
  if (location) jobs = jobs.filter((j) => j.location?.toLowerCase().includes(location));
  if (jobType) jobs = jobs.filter((j) => j.job_type === jobType);

  const total = jobs.length;
  const paged = jobs.slice(offset, offset + limit);

  return NextResponse.json(
    {
      jobs: paged,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
      last_updated: data.last_updated,
      next_update: data.next_update,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
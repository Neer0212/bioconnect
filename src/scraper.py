"""
BioConnect Auto-Updating AI Job Scraper
=======================================
Fully automated. Runs on a schedule, discovers new jobs,
pushes updates to your BioConnect site, and cleans up stale listings.

Three auto-update methods (pick one):
  1. GitHub Actions — scrapes every 4h, commits jobs.json to your repo, Vercel auto-deploys
  2. Self-hosted cron — runs on any VPS/server with systemd timer
  3. Webhook push — POSTs new jobs directly to your API endpoint

Requirements:
    pip install requests beautifulsoup4 google-generativeai

Usage:
    python scraper.py                    # Scrape once, write public/jobs.json
    python scraper.py --daemon           # Run forever (every 4 hours)
    python scraper.py --webhook URL      # Push new jobs to webhook URL
    python scraper.py --discover         # Auto-discover new biotech company career pages
"""

import os
import re
import json
import time
import hashlib
import logging
import argparse
import sqlite3
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DB_PATH = os.getenv("SCRAPER_DB", "bioconnect_jobs.db")
OUTPUT_PATH = os.getenv("OUTPUT_PATH", "public/jobs.json")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")
SCRAPE_INTERVAL_HOURS = int(os.getenv("SCRAPE_INTERVAL", "4"))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}
REQUEST_TIMEOUT = 30
RATE_LIMIT_DELAY = 2

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("bioconnect")


# ---------------------------------------------------------------------------
# DATA MODEL
# ---------------------------------------------------------------------------

@dataclass
class Job:
    title: str
    company: str
    location: str = "India"
    job_type: str = "Full-time"
    experience: str = ""
    salary: str = ""
    description: str = ""
    skills: list = field(default_factory=list)
    url: str = ""
    source: str = ""
    posted_date: str = ""
    scraped_at: str = ""
    category: str = "Other"
    job_id: str = ""

    def __post_init__(self):
        if not self.scraped_at:
            self.scraped_at = datetime.now().isoformat()
        if not self.job_id:
            raw = f"{self.title}|{self.company}|{self.location}|{self.url}"
            self.job_id = hashlib.md5(raw.encode()).hexdigest()[:12]


# ---------------------------------------------------------------------------
# DATABASE
# ---------------------------------------------------------------------------

class JobDB:
    def __init__(self, path=DB_PATH):
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self._init()

    def _init(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT DEFAULT 'India',
                job_type TEXT DEFAULT 'Full-time',
                experience TEXT DEFAULT '',
                salary TEXT DEFAULT '',
                description TEXT DEFAULT '',
                skills TEXT DEFAULT '[]',
                url TEXT DEFAULT '',
                source TEXT DEFAULT '',
                posted_date TEXT DEFAULT '',
                scraped_at TEXT DEFAULT '',
                category TEXT DEFAULT 'Other',
                is_active INTEGER DEFAULT 1,
                first_seen TEXT DEFAULT '',
                last_seen TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS scrape_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                started_at TEXT, finished_at TEXT,
                total_found INTEGER DEFAULT 0,
                new_jobs INTEGER DEFAULT 0,
                removed_jobs INTEGER DEFAULT 0,
                sources TEXT DEFAULT '',
                status TEXT DEFAULT 'ok'
            );
            CREATE TABLE IF NOT EXISTS discovered_sources (
                url TEXT PRIMARY KEY,
                company TEXT,
                added_at TEXT,
                last_scraped TEXT,
                jobs_found INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1
            );
        """)

    def upsert(self, job: Job) -> bool:
        """Returns True if this is a brand new job."""
        now = datetime.now().isoformat()
        existing = self.conn.execute(
            "SELECT job_id FROM jobs WHERE job_id=?", (job.job_id,)
        ).fetchone()

        skills_json = json.dumps(job.skills)

        if existing:
            self.conn.execute("""
                UPDATE jobs SET title=?, company=?, location=?, job_type=?,
                experience=?, salary=?, description=?, skills=?, url=?,
                source=?, posted_date=?, scraped_at=?, category=?,
                is_active=1, last_seen=?
                WHERE job_id=?
            """, (job.title, job.company, job.location, job.job_type,
                  job.experience, job.salary, job.description, skills_json,
                  job.url, job.source, job.posted_date, job.scraped_at,
                  job.category, now, job.job_id))
            self.conn.commit()
            return False

        self.conn.execute("""
            INSERT INTO jobs (job_id, title, company, location, job_type,
            experience, salary, description, skills, url, source,
            posted_date, scraped_at, category, is_active, first_seen, last_seen)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)
        """, (job.job_id, job.title, job.company, job.location, job.job_type,
              job.experience, job.salary, job.description, skills_json,
              job.url, job.source, job.posted_date, job.scraped_at,
              job.category, now, now))
        self.conn.commit()
        return True

    def deactivate_stale(self, days=14):
        """Mark jobs not seen in `days` as inactive (probably filled/removed)."""
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        cursor = self.conn.execute("""
            UPDATE jobs SET is_active=0
            WHERE is_active=1 AND last_seen < ?
        """, (cutoff,))
        self.conn.commit()
        return cursor.rowcount

    def get_active(self, limit=1000) -> list[dict]:
        rows = self.conn.execute("""
            SELECT * FROM jobs WHERE is_active=1
            ORDER BY scraped_at DESC LIMIT ?
        """, (limit,)).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["skills"] = json.loads(d.get("skills", "[]"))
            result.append(d)
        return result

    def get_new_since(self, since_iso: str) -> list[dict]:
        """Get jobs first seen after a given timestamp."""
        rows = self.conn.execute("""
            SELECT * FROM jobs WHERE is_active=1 AND first_seen > ?
            ORDER BY first_seen DESC
        """, (since_iso,)).fetchall()
        return [dict(r) for r in rows]

    def log_run(self, started, finished, found, new, removed, sources, status="ok"):
        self.conn.execute("""
            INSERT INTO scrape_runs (started_at, finished_at, total_found,
            new_jobs, removed_jobs, sources, status) VALUES (?,?,?,?,?,?,?)
        """, (started, finished, found, new, removed, sources, status))
        self.conn.commit()

    def add_discovered_source(self, url, company):
        try:
            self.conn.execute("""
                INSERT OR IGNORE INTO discovered_sources (url, company, added_at)
                VALUES (?, ?, ?)
            """, (url, company, datetime.now().isoformat()))
            self.conn.commit()
        except Exception:
            pass

    def get_discovered_sources(self) -> list[dict]:
        rows = self.conn.execute(
            "SELECT * FROM discovered_sources WHERE is_active=1"
        ).fetchall()
        return [dict(r) for r in rows]

    def export_json(self, path=None):
        path = path or OUTPUT_PATH
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        jobs = self.get_active()
        # Remove internal fields
        clean = []
        for j in jobs:
            j.pop("is_active", None)
            j.pop("first_seen", None)
            j.pop("last_seen", None)
            if isinstance(j.get("skills"), str):
                j["skills"] = json.loads(j["skills"])
            clean.append(j)

        data = {
            "jobs": clean,
            "total": len(clean),
            "last_updated": datetime.now().isoformat(),
            "next_update": (datetime.now() + timedelta(hours=SCRAPE_INTERVAL_HOURS)).isoformat(),
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        log.info(f"Exported {len(clean)} jobs → {path}")
        return data

    def stats(self) -> dict:
        total = self.conn.execute("SELECT COUNT(*) FROM jobs WHERE is_active=1").fetchone()[0]
        cats = self.conn.execute(
            "SELECT category, COUNT(*) c FROM jobs WHERE is_active=1 GROUP BY category ORDER BY c DESC"
        ).fetchall()
        sources = self.conn.execute(
            "SELECT source, COUNT(*) c FROM jobs WHERE is_active=1 GROUP BY source ORDER BY c DESC"
        ).fetchall()
        return {
            "total": total,
            "by_category": {r["category"]: r["c"] for r in cats},
            "by_source": {r["source"]: r["c"] for r in sources},
        }


# ---------------------------------------------------------------------------
# AI PARSER
# ---------------------------------------------------------------------------

class AIParser:
    PROMPT = """You are a biotech job parser. Extract ALL job listings from this careers page content.

Return ONLY a JSON array. Each object:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, Country or Remote",
  "job_type": "Full-time|Part-time|Internship|Contract",
  "experience": "Entry Level|Mid Level|Senior|Not specified",
  "salary": "salary range or empty string",
  "description": "1-2 sentence summary",
  "skills": ["skill1", "skill2"],
  "category": "Research|Clinical|Manufacturing|Bioinformatics|Sales|Regulatory|Internship|Other",
  "url": "direct link or empty string",
  "posted_date": "YYYY-MM-DD or empty string"
}

Extract EVERY listing. Return [] if none found. NO text outside the JSON."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.enabled = bool(self.api_key)
        if not self.enabled:
            log.warning("No GEMINI_API_KEY — using keyword fallback")

    def parse(self, html: str, company: str = "", url: str = "") -> list[dict]:
        if self.enabled:
            result = self._ai_parse(html, company, url)
            if result:
                return result
        return self._fallback(html, company, url)

    def _ai_parse(self, html: str, company: str, url: str) -> list[dict]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")

            # Clean HTML to save tokens
            soup = BeautifulSoup(html, "html.parser")
            for tag in soup.find_all(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            clean_text = soup.get_text(separator="\n", strip=True)[:12000]

            resp = model.generate_content(
                f"Company: {company}\nURL: {url}\n\n{self.PROMPT}\n\n---\n{clean_text}\n---",
                generation_config={"temperature": 0.05, "max_output_tokens": 4096},
            )

            raw = resp.text.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            jobs = json.loads(raw)

            if isinstance(jobs, list):
                log.info(f"  AI → {len(jobs)} jobs from {company}")
                return jobs
        except Exception as e:
            log.warning(f"  AI parse failed ({company}): {e}")
        return []

    def _fallback(self, html: str, company: str, url: str) -> list[dict]:
        soup = BeautifulSoup(html, "html.parser")
        jobs = []
        kw = {"scientist", "researcher", "analyst", "engineer", "technician",
              "manager", "director", "associate", "specialist", "intern",
              "bioinformatics", "regulatory", "clinical", "pharma", "biotech",
              "molecular", "genomics", "cell", "protein", "lab", "manufacturing",
              "quality", "process", "validation", "microbiology"}

        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True)
            if 5 < len(text) < 200 and any(k in text.lower() for k in kw):
                href = a["href"]
                if not href.startswith(("javascript:", "#", "mailto:")):
                    href = urljoin(url, href)
                    jobs.append({
                        "title": text, "company": company,
                        "location": "India", "job_type": "Full-time",
                        "experience": "", "salary": "", "description": "",
                        "skills": [], "category": "Other", "url": href,
                        "posted_date": "",
                    })
        log.info(f"  Fallback → {len(jobs)} jobs from {company}")
        return jobs


# ---------------------------------------------------------------------------
# SOURCE REGISTRY — all targets we scrape
# ---------------------------------------------------------------------------

# Indian biotech/pharma companies — career page URLs
COMPANY_CAREERS = {
    "Biocon": "https://www.biocon.com/careers/",
    "Biocon Biologics": "https://www.bioconbiologics.com/careers",
    "Dr. Reddy's": "https://careers.drreddys.com/",
    "Serum Institute": "https://www.seruminstitute.com/careers.php",
    "Bharat Biotech": "https://www.bharatbiotech.com/careers.html",
    "Indian Immunologicals": "https://www.indimmune.com/careers",
    "Panacea Biotec": "https://www.panaceabiotec.com/careers",
    "Glenmark": "https://www.glenmarkpharma.com/careers",
    "Cipla": "https://www.cipla.com/careers",
    "Sun Pharma": "https://sunpharma.com/careers/",
    "Lupin": "https://www.lupin.com/careers/",
    "Aurobindo Pharma": "https://www.aurobindo.com/careers/",
    "Syngene International": "https://www.syngeneintl.com/careers/",
    "Jubilant Biosys": "https://www.jubilantbiosys.com/careers/",
    "Strand Life Sciences": "https://strandls.com/careers/",
    "MedGenome": "https://www.medgenome.com/careers",
    "Genotypic Technology": "https://www.genotypic.co.in/careers",
    "Novozymes India": "https://www.novozymes.com/en/careers",
    "Thermo Fisher India": "https://jobs.thermofisher.com/global/en/india-jobs",
    "Roche India": "https://www.roche.com/careers/country/india",
    "Wockhardt": "https://www.wockhardt.com/careers/",
    "Intas Pharmaceuticals": "https://www.intaspharma.com/careers",
    "Zydus Lifesciences": "https://www.zyduslife.com/careers",
    "Laurus Labs": "https://www.lauruslabs.com/careers",
    "Astellas India": "https://www.astellas.com/in/careers",
    "Piramal Pharma": "https://www.piramal.com/pharma-solutions/careers/",
    "Enzene Biosciences": "https://www.enzene.com/careers/",
    "Reliance Life Sciences": "https://www.rellife.com/careers.html",
    "Anthem Biosciences": "https://anthembio.com/careers/",
    "Bugworks Research": "https://www.bugworksresearch.com/careers",
}

# Job board search URLs (biotech-specific queries)
JOB_BOARD_QUERIES = {
    "indeed": [
        "https://in.indeed.com/jobs?q=biotech&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=biotechnology+scientist&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=bioinformatics&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=clinical+research&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=pharma+research&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=molecular+biology&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=genomics&l=India&sort=date&limit=25",
        "https://in.indeed.com/jobs?q=microbiology+lab&l=India&sort=date&limit=25",
    ],
    "linkedin": [
        "https://www.linkedin.com/jobs/search/?keywords=biotech&location=India&sortBy=DD",
        "https://www.linkedin.com/jobs/search/?keywords=bioinformatics&location=India&sortBy=DD",
        "https://www.linkedin.com/jobs/search/?keywords=pharma%20scientist&location=India&sortBy=DD",
        "https://www.linkedin.com/jobs/search/?keywords=life%20sciences&location=India&sortBy=DD",
    ],
    "naukri": [
        "https://www.naukri.com/biotech-jobs?k=biotech",
        "https://www.naukri.com/biotechnology-jobs?k=biotechnology",
        "https://www.naukri.com/bioinformatics-jobs?k=bioinformatics",
        "https://www.naukri.com/pharma-research-jobs?k=pharma+research",
        "https://www.naukri.com/clinical-research-jobs?k=clinical+research",
        "https://www.naukri.com/molecular-biology-jobs?k=molecular+biology",
    ],
}


# ---------------------------------------------------------------------------
# AUTO-DISCOVERY — finds new biotech company career pages via Google
# ---------------------------------------------------------------------------

class SourceDiscoverer:
    """Uses Gemini to find new biotech company career pages we're not tracking yet."""

    DISCOVERY_QUERIES = [
        "biotech company careers India",
        "biotechnology startup hiring India 2026",
        "biopharma careers page India",
        "life sciences company jobs India",
        "genomics company hiring India",
        "CRISPR company careers India",
    ]

    def __init__(self, parser: AIParser, db: JobDB):
        self.parser = parser
        self.db = db
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def discover(self) -> list[dict]:
        """Search for new biotech career pages and add them to the registry."""
        if not self.parser.enabled:
            log.warning("Discovery needs Gemini API key")
            return []

        existing_urls = set(COMPANY_CAREERS.values())
        existing_urls.update(s["url"] for s in self.db.get_discovered_sources())

        new_sources = []

        for query in self.DISCOVERY_QUERIES:
            try:
                # Use Google search via requests
                search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}&num=10"
                resp = self.session.get(search_url, timeout=15)
                if resp.status_code != 200:
                    continue

                soup = BeautifulSoup(resp.text, "html.parser")
                links = soup.find_all("a", href=True)

                for link in links:
                    href = link["href"]
                    # Extract actual URL from Google redirect
                    if "/url?q=" in href:
                        href = href.split("/url?q=")[1].split("&")[0]

                    if not href.startswith("http"):
                        continue

                    # Check if it's a career/jobs page
                    lower = href.lower()
                    if any(k in lower for k in ["career", "jobs", "hiring", "openings", "vacancies"]):
                        domain = href.split("/")[2]
                        if domain not in str(existing_urls) and "google" not in domain:
                            company_name = domain.replace("www.", "").split(".")[0].title()
                            self.db.add_discovered_source(href, company_name)
                            new_sources.append({"url": href, "company": company_name})
                            existing_urls.add(href)
                            log.info(f"  Discovered: {company_name} → {href}")

                time.sleep(3)
            except Exception as e:
                log.warning(f"Discovery search failed: {e}")

        log.info(f"Discovery complete: {len(new_sources)} new sources found")
        return new_sources


# ---------------------------------------------------------------------------
# WEBHOOK PUSHER — pushes new jobs to your API endpoint
# ---------------------------------------------------------------------------

class WebhookPusher:
    """Pushes new jobs to an external webhook/API endpoint."""

    def __init__(self, url: str = ""):
        self.url = url or WEBHOOK_URL
        self.enabled = bool(self.url)

    def push(self, jobs: list[dict]):
        if not self.enabled or not jobs:
            return

        try:
            payload = {
                "event": "new_jobs",
                "timestamp": datetime.now().isoformat(),
                "count": len(jobs),
                "jobs": jobs,
            }
            resp = requests.post(
                self.url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            log.info(f"Webhook push: {resp.status_code} ({len(jobs)} jobs)")
        except Exception as e:
            log.error(f"Webhook push failed: {e}")


# ---------------------------------------------------------------------------
# MAIN SCRAPER ENGINE
# ---------------------------------------------------------------------------

class BioConnectScraper:
    def __init__(self, webhook_url=""):
        self.db = JobDB()
        self.parser = AIParser()
        self.webhook = WebhookPusher(webhook_url)
        self.discoverer = SourceDiscoverer(self.parser, self.db)
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch(self, url: str) -> Optional[str]:
        try:
            resp = self.session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            resp.raise_for_status()
            time.sleep(RATE_LIMIT_DELAY)
            return resp.text
        except Exception as e:
            log.warning(f"  Fetch failed: {url} → {e}")
            return None

    def _scrape_source(self, name: str, url: str, company: str = "") -> list[Job]:
        """Scrape a single URL and return Job objects."""
        html = self.fetch(url)
        if not html:
            return []

        parsed = self.parser.parse(html, company or name, url)
        jobs = []
        for j in parsed:
            job = Job(
                title=j.get("title", ""),
                company=j.get("company", company or name),
                location=j.get("location", "India"),
                job_type=j.get("job_type", "Full-time"),
                experience=j.get("experience", ""),
                salary=j.get("salary", ""),
                description=j.get("description", ""),
                skills=j.get("skills", []),
                url=j.get("url", url),
                source=name,
                posted_date=j.get("posted_date", ""),
                category=j.get("category", "Other"),
            )
            if job.title and len(job.title) > 3:
                jobs.append(job)
        return jobs

    def run(self, discover=False) -> dict:
        """Run all scrapers, store results, export JSON, push webhook."""
        started = datetime.now()
        log.info("=" * 60)
        log.info(f"BioConnect Scraper — {started.strftime('%Y-%m-%d %H:%M')}")
        log.info("=" * 60)

        all_jobs = []
        new_count = 0

        # --- 1. Company career pages (30 companies) ---
        log.info("\n📋 Scraping company career pages...")
        for company, url in COMPANY_CAREERS.items():
            log.info(f"  → {company}")
            jobs = self._scrape_source("company_careers", url, company)
            all_jobs.extend(jobs)

        # --- 2. Discovered sources (auto-discovered career pages) ---
        discovered = self.db.get_discovered_sources()
        if discovered:
            log.info(f"\n🔍 Scraping {len(discovered)} discovered sources...")
            for src in discovered:
                log.info(f"  → {src['company']}")
                jobs = self._scrape_source("discovered", src["url"], src["company"])
                all_jobs.extend(jobs)

        # --- 3. Job boards ---
        for board, urls in JOB_BOARD_QUERIES.items():
            log.info(f"\n🌐 Scraping {board}...")
            for url in urls:
                query = url.split("q=")[-1].split("&")[0].replace("+", " ")
                log.info(f"  → {query}")
                jobs = self._scrape_source(board, url, f"{board.title()} ({query})")
                all_jobs.extend(jobs)

        # --- 4. Store results ---
        log.info(f"\n💾 Storing {len(all_jobs)} jobs...")
        before_count = len(self.db.get_active())
        new_jobs_data = []

        for job in all_jobs:
            is_new = self.db.upsert(job)
            if is_new:
                new_count += 1
                new_jobs_data.append({
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "url": job.url,
                    "category": job.category,
                })

        # --- 5. Clean stale jobs ---
        removed = self.db.deactivate_stale(days=14)

        # --- 6. Export JSON ---
        data = self.db.export_json()

        # --- 7. Push new jobs via webhook ---
        if new_jobs_data:
            self.webhook.push(new_jobs_data)

        # --- 8. Auto-discover new sources (weekly) ---
        if discover:
            log.info("\n🔍 Running auto-discovery...")
            self.discoverer.discover()

        # --- 9. Log run ---
        finished = datetime.now()
        duration = (finished - started).total_seconds()
        self.db.log_run(
            started.isoformat(), finished.isoformat(),
            len(all_jobs), new_count, removed,
            ",".join(JOB_BOARD_QUERIES.keys()) + ",company_careers",
        )

        stats = self.db.stats()
        log.info(f"\n{'=' * 60}")
        log.info(f"✅ DONE in {duration:.0f}s")
        log.info(f"   Scraped: {len(all_jobs)} listings")
        log.info(f"   New:     {new_count}")
        log.info(f"   Removed: {removed} stale")
        log.info(f"   Active:  {stats['total']} total in DB")
        log.info(f"   Output:  {OUTPUT_PATH}")
        log.info(f"   Next:    {(finished + timedelta(hours=SCRAPE_INTERVAL_HOURS)).strftime('%H:%M')}")
        log.info(f"{'=' * 60}")

        return {
            "scraped": len(all_jobs),
            "new": new_count,
            "removed": removed,
            "active": stats["total"],
            "duration_seconds": duration,
            "next_run": (finished + timedelta(hours=SCRAPE_INTERVAL_HOURS)).isoformat(),
        }

    def run_daemon(self, discover_interval_runs=6):
        """Run forever on a schedule. Discovery runs every Nth cycle."""
        run_count = 0
        log.info(f"🔄 Daemon mode — scraping every {SCRAPE_INTERVAL_HOURS}h")

        while True:
            run_count += 1
            do_discover = (run_count % discover_interval_runs == 0)

            try:
                self.run(discover=do_discover)
            except Exception as e:
                log.error(f"Scrape failed: {e}")

            next_run = datetime.now() + timedelta(hours=SCRAPE_INTERVAL_HOURS)
            log.info(f"😴 Sleeping until {next_run.strftime('%H:%M')}...")
            time.sleep(SCRAPE_INTERVAL_HOURS * 3600)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="BioConnect Auto-Updating Job Scraper")
    ap.add_argument("--daemon", action="store_true", help="Run forever (every 4h)")
    ap.add_argument("--discover", action="store_true", help="Auto-discover new career pages")
    ap.add_argument("--webhook", type=str, default="", help="Push new jobs to this URL")
    ap.add_argument("--output", type=str, default="", help="Output JSON path")
    ap.add_argument("--stats", action="store_true", help="Print DB stats")
    args = ap.parse_args()

    if args.output:
        global OUTPUT_PATH
        OUTPUT_PATH = args.output

    scraper = BioConnectScraper(webhook_url=args.webhook)

    if args.stats:
        print(json.dumps(scraper.db.stats(), indent=2))
        return

    if args.daemon:
        scraper.run_daemon()
    else:
        scraper.run(discover=args.discover)


if __name__ == "__main__":
    main()

# 🧬 BioConnect

**India's Biotech Academic Platform**

BioConnect is a SaaS-based web platform designed to connect biotechnology students, educators, and researchers in a single ecosystem. It simplifies access to learning resources and research content while enabling academic collaboration.

> 🔗 **Live:** [bioconnect-lemon.vercel.app](https://bioconnect-lemon.vercel.app)

---

## Features

- **Role-Based Authentication** — Sign up as Student, Educator, or Researcher with email verification
- **Learning Hub** — Subject-wise PDF notes uploaded by educators, accessible to all users
- **Research Papers** — Browse, search, and add research papers with metadata (title, authors, journal, topic)
- **Events** — Create and browse biotech conferences, webinars, workshops, and hackathons
- **User Profiles** — View and edit personal details, university, and bio
- **Role-Based Access** — Educators can upload/delete content; students can view and learn
- **Real-Time Stats** — Landing page shows live user count, paper count, and event count

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Email/Password) |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| Version Control | GitHub |

---

## Project Structure

```
bioconnect/
├── app/
│   ├── page.js              # Landing page
│   ├── layout.js             # Root layout with metadata
│   ├── globals.css            # Global styles
│   ├── login/page.js          # Login page
│   ├── signup/page.js         # Signup page
│   ├── dashboard/page.js      # Role-based dashboard
│   ├── learning/page.js       # Learning Hub (PDF notes)
│   ├── research/page.js       # Research Papers
│   ├── event/page.js          # Events & Conferences
│   ├── profile/page.js        # User Profile (view/edit)
│   └── auth/callback/route.js # Email verification handler
├── utils/
│   └── supabase/
│       ├── client.js          # Browser Supabase client
│       └── server.js          # Server Supabase client
├── middleware.js               # Auth session + route protection
├── public/
│   └── logo.jpg               # BioConnect logo
├── .env.local                  # Supabase keys (not in repo)
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Neer0212/bioconnect.git
   cd bioconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`** in the project root
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the database migration** — Copy the SQL schema into Supabase SQL Editor and run it

5. **Start the dev server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

| Table | Purpose |
|-------|---------|
| profiles | User details, role, university, bio |
| research_papers | Scientific publications with metadata |
| events | Conferences, webinars, workshops |
| event_registrations | User RSVP tracking |
| courses | Learning resources created by educators |
| enrollments | Student course enrollment + progress |
| saved_papers | Bookmarked research papers |
| connections | User follow/network relationships |

All tables have Row Level Security (RLS) enabled.

---

## Team

Built by students at Gujarat University as part of a biotechnology innovation project.

---

## License

This project is private and not open-source.

---

## Roadmap

- [x] Landing page
- [x] Authentication (signup/login)
- [x] Role-based dashboards
- [x] Learning Hub with PDF uploads
- [x] Research Papers (browse + add)
- [x] Events page
- [x] User profiles (view + edit)
- [x] Deployed on Vercel
- [ ] Jobs & Internships board
- [ ] Admin dashboard
- [ ] Messaging system
- [ ] Mobile app
- [ ] Custom domain (bioconnect.in)
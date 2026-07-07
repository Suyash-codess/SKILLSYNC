# ⚡ SkillSync

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
> A localized Tech-Stack Skill Barter platform for engineering students

Connect with peers who have complementary skills for hackathons, coding contests, and startups. Built with Next.js 14, glassmorphism dark mode UI, and enterprise-grade security.

---

## 🚀 Quick Start

### 1. Set up your database (Supabase — free, 2 min)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Copy the **connection string** from: Settings → Database → Connection string → URI
3. Paste it into `.env.local` as `DATABASE_URL`

### 2. Configure environment variables

Edit `.env.local`:

```env
AUTH_SECRET=generate-a-random-32-char-string-here
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
NEXTAUTH_URL=http://localhost:3000
```

> Generate `AUTH_SECRET` with: `openssl rand -base64 32`

### 3. Initialize database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed skills + demo users
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Accounts

After seeding, you can log in with:

| Name | Email | Password |
|---|---|---|
| Priya Sharma | priya@iitb.ac.in | Demo@1234 |
| Arjun Mehta | arjun@bits.ac.in | Demo@1234 |
| Riya Patel | riya@vit.ac.in | Demo@1234 |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected pages (sidebar layout)
│   │   ├── directory/        # Searchable student directory
│   │   ├── projects/         # Project board + post form
│   │   ├── connections/      # Connection requests
│   │   └── profile/[id]/     # User profile view
│   ├── api/
│   │   ├── auth/             # NextAuth + registration
│   │   ├── users/            # User directory + profiles
│   │   ├── projects/         # Project board
│   │   ├── connections/      # Connection requests
│   │   └── skills/           # Skills list
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   └── page.tsx              # Landing page
├── lib/
│   ├── auth.ts               # NextAuth config (JWT + bcrypt)
│   ├── db.ts                 # Prisma singleton
│   ├── validations.ts        # Zod schemas
│   └── ratelimit.ts          # Upstash rate limiting
├── components/
│   └── Providers.tsx         # SessionProvider
└── proxy.ts                  # Auth route protection (Middleware)
```

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs cost factor 12 |
| Sessions | JWT via NextAuth (7-day expiry, httpOnly) |
| Input validation | Zod schemas on every API route |
| SQL injection | Prisma parameterized queries |
| CSRF | NextAuth built-in tokens |
| Contact privacy | Hidden until mutual connection |
| Rate limiting | Upstash Redis (add credentials to enable) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: NextAuth v5 (Auth.js) with Credentials + JWT
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod
- **Styling**: Tailwind CSS + Custom CSS (Glassmorphism Dark Mode)
- **Security**: bcryptjs, Zod, Prisma parameterized queries

---

## 📋 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run db:push      # Sync schema to DB (no migrations)
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Regenerate Prisma client
```

---

## ➕ Adding Rate Limiting (Optional)

1. Create a free database at [console.upstash.com](https://console.upstash.com)
2. Add to `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Rate limits are applied per IP:
- Auth endpoints: 5 requests / 15 minutes
- General API: 60 requests / minute  
- Connection requests: 10 / hour

---

<div align="center">
  <b>Built with ❤️ by Suyash</b>
</div>

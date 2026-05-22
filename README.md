# Shortlist.AI — AI-Powered ATS Resume Optimizer SaaS

Shortlist.AI is a recruiter-grade, AI-powered ATS resume optimizer designed to maximize interview conversion rates by identifying formatting issues, auditing keyword matches, suggesting metrics-driven bullet rewrites, and simulating hiring manager critiques.

---

## 🚀 Core Features

1.  **ATS Compatibility Scoring**: Generates an overall match scorecard based on keyword alignments, formatting parsing checks, content impact metrics, and readability.
2.  **Visual Editor Sandbox**: Edit resume details side-by-side with your scorecard. Live recalculations update keyword alerts and subscores instantly.
3.  **AI Bullet Point Rewriter**: In-line suggestions to refactor weak statements into quantifiable, action-verb achievements containing actual business metrics.
4.  **Recruiter Simulation**: Agentic evaluation outlining a hiring manager's first impressions, core concerns/red flags, strengths, and expected interview rate.
5.  **Tailored Cover Letter Generator**: Drafts a highly tailored cover letter customized to target job requirements and applicant background.
6.  **ATS-Safe PDF Export**: Direct CSS print layout stylesheet formatting that allows you to print a single-column, standard-font, parse-safe PDF of your edited resume.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS v4, Lucide Icons.
*   **Database ORM**: Prisma v7 with `@prisma/adapter-pg` driver.
*   **AI Integration**: Google Gemini SDK (`gemini-1.5-flash`).
*   **Parsing Engine**: `pdf-parse` (pure TypeScript ESM) and `mammoth.js` (for Word documents).

---

## 📈 SEO Strategy & Programmatic Pages

We have implemented standard landing routes and dynamic programmatic pages to capture high-intent search traffic:

### Targeted Landing Pages
*   **ATS Resume Checker**: [`/ats-resume-checker`](/ats-resume-checker)
*   **Resume Optimizer**: [`/resume-optimizer`](/resume-optimizer)
*   **AI Resume Builder**: [`/ai-resume-builder`](/ai-resume-builder)
*   **Resume Keyword Scanner**: [`/resume-keyword-scanner`](/resume-keyword-scanner)

### Programmatic SEO Pages
*   **Role-Specific Resume Guides**: `/guides/[role]` (e.g., [`/guides/software-engineer`](/guides/software-engineer), `/guides/ai-engineer`, `/guides/product-manager`, `/guides/data-analyst`)
*   **Targeted Keyword Spotlights**: `/keywords/[keyword]` (e.g., [`/keywords/typescript`](/keywords/typescript), `/keywords/python`)
*   **Role Resume Examples**: `/examples/[role]` (e.g., [`/examples/software-engineer`](/examples/software-engineer))

---

## 📦 Project Structure

```text
ai-ats/
├── prisma/
│   └── schema.prisma        # Prisma database model setup (Prisma v7)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── resumes/
│   │   │   │   ├── parse/    # Upload + document text parser route
│   │   │   │   ├── analyze/  # Scorecard + ATS scoring route
│   │   │   │   └── rewrite/  # In-line bullet rewriter route
│   │   │   └── cover-letter/ # Tailored letter generator route
│   │   ├── ai-resume-builder/# SEO Landing: Builder
│   │   ├── ats-resume-checker/# SEO Landing: Checker
│   │   ├── resume-keyword-scanner/ # SEO Landing: Scanner
│   │   ├── resume-optimizer/ # SEO Landing: Optimizer
│   │   ├── guides/[role]/    # Programmatic guides
│   │   ├── keywords/[keyword]/ # Programmatic keyword spotlights
│   │   ├── examples/[role]/  # Programmatic resume examples
│   │   ├── globals.css       # HSL theme colors & micro-animations (Tailwind v4)
│   │   ├── layout.tsx        # SEO Meta tags and base layout
│   │   └── page.tsx          # Main interactive playground sandbox
│   ├── lib/
│   │   ├── db.ts             # Prisma Client with PostgreSQL adapter hook
│   │   ├── gemini.ts         # Gemini API prompt wrapper
│   │   └── utils.ts          # Merge Tailwind classes helper
│   └── services/
│       ├── parser.ts         # pdf-parse / mammoth document processor
│       └── scoring.ts        # ATS Rules Engine heuristics
├── prisma.config.ts          # Database url configuration
├── package.json
└── tsconfig.json
```

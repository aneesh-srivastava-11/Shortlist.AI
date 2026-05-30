# Shortlist.AI — Recruiter-Grade AI ATS Resume Optimizer

Shortlist.AI is an editorial/brutalist-style, recruiter-grade ATS resume optimizer built for job seekers. It identifies parsing failures, audits keyword densities, rewrites passive resume bullet points using quantifiable metrics, and simulates real hiring manager reviews.

```
       _____ __                      __   __  __      ___   ____
      / ___// /_  ____  ________  __/ /  / / / /___  /   | /  _/
      \__ \/ __ \/ __ \/ ___/ _ \/ / /  / /_/ / __ \/ /| | / /  
     ___/ / / / / /_/ / /  /  __/ / /  / __  / /_/ / ___ |/ /   
    /____/_/ /_/\____/_/   \___/_/_/  /_/ /_/\____/_/  |_/___/   
                                                                 
                      ATS // OPTIMIZER [V1.2.0]
```

---

## 🗺️ System Architecture Workflow

The diagram below details the data flow from resume upload to structured AI parsing, local heuristic scoring, interactive live editing, and database persistence.

```mermaid
graph TD
    A[applicant resume .pdf / .docx] -->|upload| B(Mammoth.js / PDF-parse)
    B -->|raw text string| C{Gemini AI Engine}
    C -->|structured JSON format| D[Resume Scorecard Sandbox]
    E[target job description] -->|pasted reqs| D
    D -->|local heuristic analyzer| F[Match Score & Warning Audits]
    F -->|render ui| G[Asymmetric Split Workspace]
    G -->|in-place edit & recalculate| F
    G -->|one-click print| H[ATS-Safe PDF Output]
    G -->|autosave payload| I[(Neon Database pg_adapter)]
```

---

## 🚀 Core Features

1. **Passwordless Direct Access**: Zero login wall. Users get immediate, full-feature sandboxed workspace access tied to `demo-user-123`.
2. **ATS Compatibility Scoring**: Dynamic match metrics evaluating formatting hazards, keyword alignments, and impact statements.
3. **Asymmetric Workspace**: 60% wide left-anchored editor zone matched with a right-anchored subordinate job requirements panel.
4. **AI Bullet Point Rewriter**: In-line suggestions to refactor weak responsibilities into quantified business achievements.
5. **Recruiter Simulation**: Agentic AI evaluations predicting first impressions, red flags, strengths, and expected interview invitation rates.
6. **ATS-Safe PDF Export**: A specialized raw CSS stylesheet designed to print clean, single-column, standard-font resumes.

---

## 🛠️ Technology Stack

* **Core Framework**: Next.js 16 (App Router), React 19, TypeScript
* **Styling & Tokens**: Tailwind CSS v4, custom `@theme` variables, Google Fonts (Bebas Neue & JetBrains Mono)
* **Database Layer**: Prisma ORM v7 with `@prisma/adapter-pg` PostgreSQL adapter
* **Parsing Engines**: `pdf-parse` (TypeScript ES) & `mammoth.js`
* **AI Model**: Google Gemini SDK (`gemini-2.5-flash`)

---

## 📐 Brutalist Design System Tokens

The application interface adheres to a rigid design token grid:

| Utility Token | Light Mode Value | Dark Mode Value |
| :--- | :--- | :--- |
| **Background** | Off-White `#F5F0EB` | Pitch Black `#0A0A0A` |
| **Foreground** | Pitch Black `#0A0A0A` | Off-White `#F5F0EB` |
| **Accent Primary**| Saturated Amber `#E8820C` | Acid Green `#C8F135` |
| **Border Radius** | `0px` (Strictly Sharp) | `0px` (Strictly Sharp) |
| **Background Grid**| 32px Technical Lines | 32px Technical Lines |
| **Typography** | Bebas Neue (Titles), JetBrains Mono (Metadata, Forms) |

---

## 🗃️ Database Schema Model

The PostgreSQL schema contains three main tables to catalog resumes and evaluations:

```mermaid
erDiagram
    User ||--o{ Resume : owns
    User ||--o{ ATSAnalysis : owns
    User {
        String id PK
        String email
        DateTime createdAt
    }
    Resume {
        String id PK
        String userId FK
        String rawText
        Json structuredData
        DateTime createdAt
    }
    ATSAnalysis {
        String id PK
        String userId FK
        Int overallScore
        Json keywordAnalysis
        Json formattingChecks
        Json recruiterFeedback
        String targetJd
        DateTime createdAt
    }
```

---

## 🔌 API Endpoints Specifications

### 1. Document Parsing Route
`POST /api/resumes/parse`
* **Payload**: `FormData` containing `file` (`.pdf` or `.docx`).
* **Response**:
  ```json
  {
    "success": true,
    "text": "Parsed raw text content of the resume...",
    "fileName": "filename.pdf"
  }
  ```

### 2. AI Scoring & Assessment Route
`POST /api/resumes/analyze`
* **Payload**:
  ```json
  {
    "resumeText": "Raw text content...",
    "jdText": "Job description text...",
    "userId": "demo-user-123"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "structuredResume": {
      "personalInfo": {},
      "education": [],
      "experience": [],
      "skills": []
    },
    "analysis": {
      "overallScore": 78,
      "keywordAnalysis": {
        "missingKeywords": ["TypeScript", "Next.js"],
        "matchedKeywords": ["React", "SQL"]
      },
      "formattingChecks": {
        "hasColumns": false,
        "hasImages": false
      },
      "recruiterFeedback": {
        "firstImpressions": "...",
        "redFlags": [],
        "strengths": []
      }
    }
  }
  ```

### 3. Bullet Point In-line Rewriter
`POST /api/resumes/rewrite`
* **Payload**:
  ```json
  {
    "bulletText": "Responsible for maintaining APIs",
    "jdText": "Looking for Node.js developer with high performance scaling experience"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "suggestions": [
      "Optimized Node.js API query latencies by 35% using Redis caching layers.",
      "Maintained core backend microservices serving 10k+ daily active users."
    ]
  }
  ```

---

## 📈 SEO & Programmatic Routing Strategy

Dynamic page templates are deployed to rank for long-tail career keywords:
* **Landing Checkers**: `/ats-resume-checker` & `/resume-optimizer`
* **Role Guides**: `/guides/[role]` (e.g. `/guides/software-engineer`)
* **Resume Examples**: `/examples/[role]` (e.g. `/examples/product-manager`)
* **Keyword Spotlights**: `/keywords/[keyword]` (e.g. `/keywords/typescript`)

---

## ⚙️ Installation & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ai-ats.git
cd ai-ats
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ats_db?schema=public"
GEMINI_API_KEY="your-google-gemini-api-key-here"
```

### 3. Set Up Prisma Database Schema
Generate the client bindings and run migrations on your database:
```bash
npx prisma db push
```

### 4. Boot Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the editor console.

---

## ⚡ Neon Database Serverless Migration
To transition this database layout to Neon Serverless Database:
1. Provisions a Postgres instance on [Neon.tech](https://neon.tech).
2. Grab the connection string (with pooled/direct endpoints).
3. Replace the `DATABASE_URL` string in your local `.env`.
4. Run `npx prisma db push` to synchronize structures instantly. No schema modifications required.
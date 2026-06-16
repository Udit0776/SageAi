# SAGE AI — TECHNICAL AUDIT & UI/UX ARCHITECTURAL REPORT

This document serves as the absolute, production-grade technical specification and UI/UX audit of the **Sage AI** platform codebase. Designed as a complete reconstruction blueprint, it contains cold, verified facts extracted directly from the system source code.

---

# SECTION 1 — PROJECT OVERVIEW

## 🛠️ Tech Stack & Exact Versions
The following dependencies and exact versions are declared in the project's [package.json](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/package.json):

* **Next.js Core**: `16.2.4` (utilizing React Server Components, App Router, and Server Actions)
* **React Core**: `19.2.4`
* **React DOM**: `19.2.4`
* **Authentication**: `@clerk/nextjs` (`^7.2.7`) with `@clerk/themes` (`^2.4.57`)
* **AI Engine**: `@google/generative-ai` (`^0.24.1`)
* **Database & ORM**: PostgreSQL with `@prisma/client` (`^6.19.3`) and `prisma` dev dependency (`^6.19.3`)
* **Background Jobs**: `inngest` (`^4.2.4`) served via `inngest/next`
* **Styling & UI**: 
  * `tailwindcss` (`^4`)
  * `@tailwindcss/postcss` (`^4`)
  * `shadcn` (`^4.3.1`)
  * `radix-ui` (`^1.4.3`)
  * `class-variance-authority` (`0.7.1`)
  * `clsx` (`^2.1.1`)
  * `tailwind-merge` (`^3.5.0`)
  * `tw-animate-css` (`^1.4.0`)
* **Charts & Analytics**: `recharts` (`^3.8.1`)
* **State & Form Handling**: `react-hook-form` (`^7.74.0`) with `@hookform/resolvers` (`^5.2.2`) and `zod` (`^4.3.6`)
* **Rich Editors**: `@uiw/react-md-editor` (`^4.1.0`)
* **Data Processing & PDF Parsing**: `unpdf` (`^1.6.2`) and `html2pdf.js` (`^0.14.0`)
* **Utilities**: `date-fns` (`^4.1.0`), `sonner` (`^2.0.7`), `react-spinners` (`^0.17.0`), `react-spinner` (`^0.2.7`), `lucide-react` (`^1.8.0`)

---

## 📂 Complete Directory Structure
```
d:\HARIOM\BtechFinalYearProject\sage-ai
├── .env
├── .gitignore
├── README.md
├── components.json
├── eslint.config.mjs
├── jsconfig.json
├── middleware.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── progress_report.md
├── project_overview.md
├── test-ai.cjs
├── test-ai.js
├── action/
│   ├── ai-assistant.js
│   ├── career-byte.js
│   ├── company-intel.js
│   ├── cover-letter.js
│   ├── dashboard.js
│   ├── interview-coach.js
│   ├── interview.js
│   ├── job-tracker.js
│   ├── linkedin.js
│   ├── networking.js
│   ├── portfolio.js
│   ├── resume.js
│   ├── salary-negotiator.js
│   ├── skill-gap.js
│   └── user.js
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   ├── not-found.jsx
│   ├── (auth)/
│   │   ├── layout.js
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.jsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.jsx
│   ├── (main)/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── ai-cover-letter/
│   │   │   ├── layout.js
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   ├── [id]/
│   │   │   │   └── page.jsx
│   │   │   ├── _components/
│   │   │   │   ├── cover-letter-generator.jsx
│   │   │   │   ├── cover-letter-list.jsx
│   │   │   │   └── cover-letter-preview.jsx
│   │   │   └── new/
│   │   │       └── page.jsx
│   │   ├── ai-tailor/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       └── tailor-form.jsx
│   │   ├── company-intel/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       ├── battle-plan-generator.jsx
│   │   │       └── battle-plan-view.jsx
│   │   ├── dashboard/
│   │   │   ├── layout.jsx
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       ├── application-funnel.jsx
│   │   │       ├── career-byte-card.jsx
│   │   │       ├── dashboard-view.jsx
│   │   │       ├── interview-trends.jsx
│   │   │       ├── performance-analytics.jsx
│   │   │       └── readiness-score.jsx
│   │   ├── interview/
│   │   │   ├── layout.js
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   ├── _components/
│   │   │   │   ├── performance-chart.jsx
│   │   │   │   ├── quiz-list.jsx
│   │   │   │   ├── quiz.jsx
│   │   │   │   └── stats-card.jsx
│   │   │   ├── coach/
│   │   │   │   ├── page.jsx
│   │   │   │   ├── _components/
│   │   │   │   │   ├── interview-session.jsx
│   │   │   │   │   ├── interview-setup.jsx
│   │   │   │   │   ├── session-report.jsx
│   │   │   │   │   └── voice-indicator.jsx
│   │   │   │   └── session/
│   │   │   │       └── page.jsx
│   │   │   └── mock/
│   │   │       └── page.jsx
│   │   ├── job-tracker/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       ├── add-job-dialog.jsx
│   │   │       └── kanban-board.jsx
│   │   ├── linkedin-optimizer/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       ├── optimizer-form.jsx
│   │   │       └── optimizer-result.jsx
│   │   ├── networking/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       └── referral-form.jsx
│   │   ├── onboarding/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       └── onboarding-form.jsx
│   │   ├── portfolio/
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       └── portfolio-builder.jsx
│   │   ├── resume/
│   │   │   ├── layout.js
│   │   │   ├── loading.jsx
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │       ├── entry-form.jsx
│   │   │       └── resume-builder.jsx
│   │   └── salary-negotiator/
│   │       ├── loading.jsx
│   │       ├── page.jsx
│   │       └── _components/
│   │           ├── negotiation-chat.jsx
│   │           └── negotiation-setup.jsx
│   ├── api/
│   │   └── inngest/
│   │       └── route.js
│   ├── components/
│   │   ├── ai-assistant-bubble.jsx
│   │   ├── header.jsx
│   │   ├── hero.jsx
│   │   ├── nav-actions.jsx
│   │   ├── scroll-to-top.jsx
│   │   ├── theme-provider.jsx
│   │   └── ui/
│   │       ├── accordion.jsx
│   │       ├── alert-dialog.jsx
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── dropdown-menu.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── progress.jsx
│   │       ├── radio-group.jsx
│   │       ├── select.jsx
│   │       ├── switch.jsx
│   │       └── textarea.jsx
│   ├── lib/
│   │   ├── helper.js
│   │   └── schema.js
│   └── p/
│       └── [customUrl]/
│           ├── page.jsx
│           └── _components/
│               └── template-modern.jsx
├── components/
│   └── ui/
│       └── (empty folders or duplicate config)
├── data/
│   ├── faqs.js
│   ├── feature.js
│   ├── howItWorks.js
│   ├── industries.js
│   └── testimonial.js
├── hooks/
│   ├── use-fetch.js
│   └── use-speech.js
├── lib/
│   ├── checkUser.js
│   ├── gemini.js
│   ├── prisma.js
│   ├── utils.js
│   └── inngest/
│       ├── client.js
│       └── function.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── public/
    ├── logo.png
    └── banner.png
```

---

## 🔑 Environment Variables
Extracted from imports, client drivers, and logic setup within `.env`, `lib/gemini.js`, `lib/prisma.js`, `lib/inngest/client.js`, and `middleware.js`:

* `DATABASE_URL`: Connection string for the PostgreSQL database (used in Prisma client).
* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk client configuration key.
* `CLERK_SECRET_KEY`: Clerk backend authentication secret.
* `GEMINI_API_KEY`: Primary API token for Google Generative AI.
* `GEMINI_API_KEY_2`: First rollover/fallback API token for Google Generative AI.
* `GEMINI_API_KEY_3`: Second rollover/fallback API token for Google Generative AI.
* `INNGEST_EVENT_KEY`: Inngest event transmission authentication key.
* `INNGEST_SIGNING_KEY`: Inngest payload validation signature.

---

## 📦 Third-Party Libraries & Exact Purpose
* `@clerk/nextjs`: Provides authentication, session state management, middleware route guards, and UI triggers (`<SignInButton>`, `<SignUpButton>`, `<UserButton>`).
* `@google/generative-ai`: Interacts directly with Gemini models for NLP tasks (ATS matching, feedback, coaching analysis, negotiation simulation).
* `@prisma/client` & `prisma`: ORM to schema and query the PostgreSQL database.
* `inngest`: Runs background workflows, schedules, and asynchronous routines.
* `recharts`: Draws responsive SVG elements for charts (Salary Range Radar, Performance Progress line, and Application Funnel charts).
* `react-hook-form` & `@hookform/resolvers/zod`: Standardizes profile and resume forms, managing validation states.
* `@uiw/react-md-editor`: Markdown editor/preview components.
* `unpdf`: Node utility to parse text streams and buffer layers directly from PDF resume uploads without spawning external systems.
* `html2pdf.js`: Invokes print drivers or PDF renders for cover letters and resume downloads.
* `date-fns`: Date parsing, layout rendering, and distance formatting.
* `sonner`: Toast notification center.
* `lucide-react`: The system's complete icon catalog.

---

# SECTION 2 — DATABASE SCHEMA
Database models are defined in [prisma/schema.prisma](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/prisma/schema.prisma):

```
DATABASE ENGINE: PostgreSQL
```

## 📋 Model Spec Details

### 1. `User`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to UUID)
  * `clerkUserId`: `String` (Unique constraint)
  * `email`: `String` (Unique constraint)
  * `name`: `String` (Optional)
  * `username`: `String` (Optional, Unique constraint)
  * `imageUrl`: `String` (Optional)
  * `industry`: `String` (Optional, Foreign Key to `IndustryInsight.industry`)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)
  * `bio`: `String` (Optional)
  * `experience`: `Int` (Optional)
  * `skills`: `String[]` (Array of text fields)
* **Relations**:
  * `industryInsight`: `IndustryInsight` (Optional, belongs to `User`)
  * `assessments`: `Assessment[]` (One-to-many)
  * `resume`: `Resume` (One-to-one, Optional)
  * `coverLetters`: `CoverLetter[]` (One-to-many)
  * `portfolio`: `Portfolio` (One-to-one, Optional)
  * `interviewSessions`: `InterviewSession[]` (One-to-many)
  * `companyIntels`: `CompanyIntel[]` (One-to-many)
  * `skillGapReports`: `SkillGapReport[]` (One-to-many)
  * `negotiationSessions`: `NegotiationSession[]` (One-to-many)
  * `careerBytes`: `CareerByte[]` (One-to-many)
  * `jobApplications`: `JobApplication[]` (One-to-many)
  * `careerHealthScores`: `CareerHealthScore[]` (One-to-many)
  * `offerComparisons`: `OfferComparison[]` (One-to-many)
  * `onboardingPlans`: `OnboardingPlan[]` (One-to-many)
  * `streak`: `UserStreak` (One-to-one, Optional)

### 2. `Assessment`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `quizScore`: `Float` (Required)
  * `questions`: `Json[]` (Array of structured objects)
  * `category`: `String` (Required)
  * `improvementTip`: `String` (Optional)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)
* **Indexes**:
  * `@@index([userId])`

### 3. `Resume`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Unique constraint, Foreign Key to `User.id`)
  * `content`: `String` (Required, mapped to DB `Text`)
  * `atsScore`: `Float` (Optional)
  * `feedback`: `String` (Optional)
  * `targetJobDescription`: `String` (Optional, mapped to DB `Text`)
  * `matchScore`: `Float` (Optional)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)

### 4. `CoverLetter`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `content`: `String` (Required, mapped to DB `Text`)
  * `jobDescription`: `String` (Optional)
  * `companyName`: `String` (Required)
  * `jobTitle`: `String` (Required)
  * `status`: `String` (Required, Defaults to `"draft"`)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)
* **Indexes**:
  * `@@index([userId])`

### 5. `IndustryInsight`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `industry`: `String` (Required, Unique constraint)
  * `salaryRanges`: `Json[]` (Required)
  * `growthRate`: `Float` (Required)
  * `demandLevel`: `DemandLevel` (Enum constraint)
  * `topSkills`: `String[]` (Required)
  * `marketOutlook`: `MarketOutlook` (Enum constraint)
  * `keyTrends`: `String[]` (Required)
  * `recommendedSkills`: `String[]` (Required)
  * `lastUpdated`: `DateTime` (Defaults to now)
  * `nextUpdate`: `DateTime` (Required)
* **Indexes**:
  * `@@index([industry])`

### 6. `Portfolio`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Unique constraint, Foreign Key to `User.id`)
  * `isPublished`: `Boolean` (Required, Defaults to `false`)
  * `content`: `String` (Optional, mapped to DB `Text`)
  * `templateId`: `String` (Required, Defaults to `"default"`)
  * `customUrl`: `String` (Optional, Unique constraint)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)

### 7. `InterviewSession`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `type`: `String` (Required, e.g., `"behavioral" | "technical" | "hr" | "mixed"`)
  * `targetRole`: `String` (Optional)
  * `company`: `String` (Optional)
  * `questions`: `Json[]` (Stores `{question, userAnswer, scores, feedback, starAnalysis, improvedAnswer, toneAnalysis}`)
  * `overallScore`: `Float` (Optional)
  * `readinessScore`: `Float` (Optional)
  * `strengths`: `String[]` (Required)
  * `weaknesses`: `String[]` (Required)
  * `improvementPlan`: `String` (Optional, mapped to DB `Text`)
  * `rejectionRisk`: `String` (Optional, mapped to DB `Text`)
  * `duration`: `Int` (Optional)
  * `createdAt`: `DateTime` (Defaults to now)
* **Indexes**:
  * `@@index([userId])`

### 8. `CompanyIntel`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `companyName`: `String` (Required)
  * `targetRole`: `String` (Optional)
  * `content`: `String` (Required, mapped to DB `Text`)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)
* **Indexes**:
  * `@@index([userId])`

### 9. `SkillGapReport`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `jobTitle`: `String` (Required)
  * `company`: `String` (Optional)
  * `jobDescription`: `String` (Required, mapped to DB `Text`)
  * `content`: `String` (Required, mapped to DB `Text`)
  * `readinessScore`: `Float` (Optional)
  * `createdAt`: `DateTime` (Defaults to now)
* **Indexes**:
  * `@@index([userId])`

### 10. `NegotiationSession`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `targetRole`: `String` (Required)
  * `company`: `String` (Optional)
  * `expectedSalary`: `Float` (Required)
  * `initialOffer`: `Float` (Optional)
  * `finalSalary`: `Float` (Optional)
  * `conversation`: `Json[]` (Stores array of `{role, message}`)
  * `score`: `Float` (Optional)
  * `feedback`: `String` (Optional, mapped to DB `Text`)
  * `createdAt`: `DateTime` (Defaults to now)
* **Indexes**:
  * `@@index([userId])`

### 11. `CareerByte`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `type`: `String` (Required, e.g., `"tip" | "question" | "trend" | "motivation"`)
  * `title`: `String` (Required)
  * `content`: `String` (Required, mapped to DB `Text`)
  * `industry`: `String` (Required)
  * `date`: `DateTime` (Defaults to now)
* **Constraints**:
  * `@@unique([userId, date])` (Compound Unique)
* **Indexes**:
  * `@@index([userId])`

### 12. `JobApplication`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `company`: `String` (Required)
  * `role`: `String` (Required)
  * `status`: `String` (Required, e.g., `"APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED"`)
  * `notes`: `String` (Optional, mapped to DB `Text`)
  * `nextAction`: `String` (Optional)
  * `lastFollowUp`: `DateTime` (Optional)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)
* **Relations**:
  * `onboardingPlan`: `OnboardingPlan` (Optional)
* **Indexes**:
  * `@@index([userId])`

### 13. `CareerHealthScore`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `score`: `Float` (Required)
  * `atsScoreWeight`: `Float` (Required)
  * `readinessWeight`: `Float` (Required)
  * `skillGapWeight`: `Float` (Required)
  * `kanbanWeight`: `Float` (Required)
  * `commentary`: `String` (Required, mapped to DB `Text`)
  * `createdAt`: `DateTime` (Defaults to now)
* **Relations**:
  * `user`: `User` (onDelete: Cascade)
* **Indexes**:
  * `@@index([userId])`

### 14. `OfferComparison`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `offers`: `Json` (Required, Array of target parameters)
  * `comparisonData`: `Json` (Required, analysis from Gemini)
  * `createdAt`: `DateTime` (Defaults to now)
* **Relations**:
  * `user`: `User` (onDelete: Cascade)
* **Indexes**:
  * `@@index([userId])`

### 15. `OnboardingPlan`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Foreign Key to `User.id`)
  * `jobApplicationId`: `String` (Required, Unique constraint, Foreign Key to `JobApplication.id`)
  * `role`: `String` (Required)
  * `company`: `String` (Required)
  * `phases`: `Json` (Required, Array of phases with milestone metrics)
  * `createdAt`: `DateTime` (Defaults to now)
  * `updatedAt`: `DateTime` (Auto-updated)
* **Relations**:
  * `user`: `User` (onDelete: Cascade)
  * `jobApplication`: `JobApplication` (onDelete: Cascade)
* **Indexes**:
  * `@@index([userId])`

### 16. `UserStreak`
* **Fields**:
  * `id`: `String` (Primary Key, Defaults to CUID)
  * `userId`: `String` (Required, Unique constraint, Foreign Key to `User.id`)
  * `currentStreak`: `Int` (Required, Defaults to `0`)
  * `longestStreak`: `Int` (Required, Defaults to `0`)
  * `lastActivityDate`: `DateTime` (Required, Defaults to now)
  * `earnedBadges`: `String[]` (Required, array of earned badges)
* **Relations**:
  * `user`: `User` (onDelete: Cascade)

---

## 🗂️ Enums & Mapped Values

### `DemandLevel`
* Values: `HIGH`, `MEDIUM`, `LOW`

### `MarketOutlook`
* Values: `POSITIVE`, `NEUTRAL`, `NEGATIVE`

---

# SECTION 3 — AUTHENTICATION & ROUTING

## 🔒 Clerk Integration & Middleware
Integrated via [middleware.js](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/middleware.js):
* **Matching Paths**: All paths except `_next/` internals and standard static files (images, fonts, text, webmanifest).
* **Protected Routes Matcher**: 
  * `/dashboard(.*)`
  * `/resume(.*)`
  * `/ai-cover-letter(.*)`
  * `/interview(.*)`
  * `/onboarding(.*)`
  * `/portfolio(.*)`
* **Public Routes Matcher**:
  * `/api/inngest`
  * `/` (Landing page)
  * `/p/(.*)` (Public portfolios)
* **Guards & Redirects**:
  1. Requests targeting a public route are instantly bypassed.
  2. If the user is unauthenticated (`!userId`) and the target path falls within `isProtectedRoute`, the middleware returns Clerk `redirectToSignIn()`.
  3. Authenticated requests passing to routes call a server component verification block: `Header` executes `checkUser()` ([lib/checkUser.js](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/checkUser.js)) to upsert the user from Clerk `currentUser()` into the PostgreSQL database.

---

## 🧭 Routes & Exact File Mappings

| URL Route | Exact File Path | Access Level |
| :--- | :--- | :--- |
| `/` | `app/(main)/page.js` | Public |
| `/sign-in` | `app/(auth)/sign-in/[[...sign-in]]/page.jsx` | Public |
| `/sign-up` | `app/(auth)/sign-up/[[...sign-up]]/page.jsx` | Public |
| `/dashboard` | `app/(main)/dashboard/page.jsx` | Protected / Onboarded |
| `/resume` | `app/(main)/resume/page.jsx` | Protected |
| `/portfolio` | `app/(main)/portfolio/page.jsx` | Protected / Onboarded |
| `/ai-tailor` | `app/(main)/ai-tailor/page.jsx` | Protected |
| `/ai-cover-letter` | `app/(main)/ai-cover-letter/page.jsx` | Protected |
| `/ai-cover-letter/new`| `app/(main)/ai-cover-letter/new/page.jsx` | Protected |
| `/ai-cover-letter/[id]`| `app/(main)/ai-cover-letter/[id]/page.jsx` | Protected |
| `/interview` | `app/(main)/interview/page.jsx` | Protected |
| `/interview/coach` | `app/(main)/interview/coach/page.jsx` | Protected / Onboarded |
| `/interview/coach/session` | `app/(main)/interview/coach/session/page.jsx` | Protected / Onboarded |
| `/interview/mock` | `app/(main)/interview/mock/page.jsx` | Protected |
| `/company-intel` | `app/(main)/company-intel/page.jsx` | Protected / Onboarded |
| `/skill-gap` | `app/(main)/skill-gap/page.jsx` | Protected / Onboarded |
| `/salary-negotiator` | `app/(main)/salary-negotiator/page.jsx` | Protected |
| `/linkedin-optimizer`| `app/(main)/linkedin-optimizer/page.jsx` | Protected |
| `/job-tracker` | `app/(main)/job-tracker/page.jsx` | Protected / Onboarded |
| `/networking` | `app/(main)/networking/page.jsx` | Protected |
| `/p/[customUrl]` | `app/p/[customUrl]/page.jsx` | Public |
| `/api/inngest` | `app/api/inngest/route.js` | Public |

---

## 🔀 Route Groups & Onboarding Redirection
* **`(auth)` Route Group**: Configures user accounts via `<SignIn>` and `<SignUp>` components inside centered flex layouts. Features immediate scroll restoration to coordinates `(0,0)` via `layout.js` effects.
* **`(main)` Route Group**: Main application environment. Embeds `Header`, `ScrollToTop`, `AIAssistantBubble`, and the global `footer`.
* **Onboarding Redirection Logic**:
  * Pages checking profile settings invoke `getUserOnboardingStatus()` ([action/user.js](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/user.js)).
  * If `isOnboarded` is false (checking if `User.industry` is null), Next.js `redirect("/onboarding")` is called.
  * Conversely, accessing `/onboarding` while onboarded redirects users back to `/dashboard`.

---

# SECTION 4 — FEATURE-BY-FEATURE AUDIT

## 4.1 — LANDING PAGE
### A. Route & File Location
* **URL Route**: `/`
* **Page Component**: `app/(main)/page.js` ([page.js](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/page.js))
* **Sub-components**:
  * `HeroSection`: `app/components/hero.jsx` ([hero.jsx](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/hero.jsx))
  * Radix Accordion elements (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`)
* **Server Action(s)**: *None*

### B. Functional Description
Displays features, workflow steps, testimonials, statistics, and FAQs.
* **User Flow**:
  1. Lands on home screen, reads the 3D scroll-animated banner.
  2. Clicks **"Get Started"** to navigate to `/dashboard` (redirecting to `/sign-in` if unauthenticated).
  3. Scrolls to read core features, how-it-works progression, user reviews, and FAQs.
  4. Clicks **"Start Your Journey Today"** at the bottom to sign up.
* **Inputs**: *None*
* **Outputs**: Displays statistics ("50+", "1000+", "95%", "24/7"), 8 feature cards, 4 process steps, 3 testimonial blocks, and 6 FAQs.
* **Conditional Logic**: *None*

### C. Server Logic
*None*

### D. Current UI Details
* **Layout**: Centered constraints (`max-w-5xl w-full mx-auto`) inside a flex-column layout. The Grid background is rendered via `.grid-background` overlay utility.
* **Color Scheme**: Dark-mode primary (`bg-background`). Gradient highlights generated via radial-gradient divs with blur tags (`blur-[120px]`). Cards render with primary borders (`border-primary/10`).
* **Typography**:
  * Main Headline: `text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl`
  * Section Headers: `text-3xl font-bold tracking-tighter`
  * Paragraphs: `text-muted-foreground text-sm md:text-xl`
* **Every UI Element**:
  * **Header**: Renders the application logo and a user session widget.
  * **Buttons**:
    * "Get Started": Primary filled variant, rounded-full, with an entrance scale animation.
    * "Learn More": Outline variant, rounded-full, links to `#how-it-works`.
    * "Start Your Journey Today": Primary filled, with an active bounce animation.
  * **Cards**: Dynamic glassmorphism borders (`border-primary/10 hover:border-white transition-all duration-300`).
  * **Icons**: `BrainCircuit`, `Briefcase`, `LineChart`, `ScrollText`, `Building2`, `Target`, `IndianRupee`, `Globe`, `Sparkles`, `ArrowRight`.
* **Animations**: Scroll-based custom 3D rotation (`rotateX`) interpolation on `/banner.png` (using `window.scrollY`).
* **Tailwind Class Strings**:
  * Main Wrapper: `flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-background overflow-hidden relative`
  * Cards: `border-2 border-primary/10 hover:border-white transition-all duration-300 bg-background/50 backdrop-blur-sm relative z-20 group`
  * Buttons: `h-10 px-6 text-base sm:h-12 sm:px-8 sm:text-lg rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto`

### E. Data Flow Diagram
```
User visits / -> Client-side scroll hooks evaluate rotateX bounds -> Rendering features -> Click trigger -> Route push to /dashboard
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`, `ScrollToTop`
* **Custom Hooks**: *None*

---

## 4.2 — USER ONBOARDING
### A. Route & File Location
* **URL Route**: `/onboarding`
* **Page Component**: `app/(main)/onboarding/page.jsx`
* **Sub-components**:
  * `OnboardingForm`: `app/(main)/onboarding/_components/onboarding-form.jsx`
* **Server Action(s)**:
  * `updateUser`: `action/user.js`
  * `getUserOnboardingStatus`: `action/user.js`

### B. Functional Description
Registers first-time login metadata, redirecting to `/dashboard` upon completion.
* **User Flow**:
  1. Enters page, views profile setup form.
  2. Selects primary industry, which dynamically populates a list of sub-specializations.
  3. Inputs years of experience, comma-separated key skills, and professional bio.
  4. Clicks **"Complete Profile"** to submit.
* **Inputs**:
  * `industry` (Select dropdown)
  * `subIndustry` (Select dropdown)
  * `experience` (Number field)
  * `skills` (Text field)
  * `bio` (Textarea)
* **Outputs**: Validation alerts from Zod schema, action load states.
* **Conditional Logic**: Specialization dropdown is hidden until an industry is selected.

### C. Server Action Logic
* **Action Call**: `updateUser(values)`
  * **Payload**: `{ industry, experience, bio, skills }`
  * **Database Query**:
    1. Selects the user: `db.user.findUnique({ where: { clerkUserId } })`
    2. Upserts `IndustryInsight` metadata: `db.industryInsight.upsert({ where: { industry } })`
    3. Updates `User` fields: `db.user.update({ where: { id: user.id }, data: { industry, experience, bio, skills } })`
  * **Returns**: `{ success: true, updatedUser }` or `{ success: false, error }`

### D. Current UI Details
* **Layout**: Centered card container (`max-w-lg mt-10 mb-24 mx-2`) inside a flex-column layout.
* **Color Scheme**: Dark-mode primary (`bg-background`).
* **Typography**:
  * CardTitle: `font-bold text-lg`
  * Description: `text-xs text-muted-foreground`
  * Label: `text-sm font-semibold`
* **Every UI Element**:
  * **Form Inputs**: Basic text fields with dynamic red error labels (`text-sm text-red-500`).
  * **Button**: "Complete Profile" with a loading spinner icon (`<Loader2 className="mr-2 h-4 w-4 animate-spin" />`).
* **Tailwind Class Strings**:
  * Main Card: `w-full max-w-lg mt-10 mb-24 mx-2`
  * Submit Button: `w-full mt-6`

### E. Data Flow Diagram
```
User inputs data -> onSubmit trigger -> updateUserFn() call -> DB upserts IndustryInsight & updates User -> Success toast -> router.push("/dashboard")
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: `useFetch` (manages asynchronous action loading, error, and return states)

---

## 4.3 — INDUSTRY INSIGHTS & DASHBOARD
### A. Route & File Location
* **URL Route**: `/dashboard`
* **Page Component**: `app/(main)/dashboard/page.jsx`
* **Sub-components**:
  * `DashboardView`: `app/(main)/dashboard/_components/dashboard-view.jsx`
  * `PerformanceAnalytics`: `app/(main)/dashboard/_components/performance-analytics.jsx`
  * `CareerByteCard`: `app/(main)/dashboard/_components/career-byte-card.jsx`
  * `ReadinessScore`: `app/(main)/dashboard/_components/readiness-score.jsx`
  * `InterviewTrends`: `app/(main)/dashboard/_components/interview-trends.jsx`
  * `ApplicationFunnel`: `app/(main)/dashboard/_components/application-funnel.jsx`
* **Server Action(s)**:
  * `getIndustryInsights`: `action/dashboard.js`
  * `getInterviewSessions`: `action/interview-coach.js`
  * `getSkillGapReports`: `action/skill-gap.js`
  * `getJobApplications`: `action/job-tracker.js`

### B. Functional Description
Aggregates industry trends, salary structures, user preparation stats, and job tracking funnels.
* **User Flow**:
  1. Enters page, reads the **"Daily Career Byte"** summary.
  2. Views the **"Career Readiness Score"** indicating overall market readiness.
  3. Switches tabs between **"Industry Insights"** and **"Performance Analytics"**.
  4. Interacts with the interactive SVG radar chart comparing salaries.
* **Inputs**: Tab selection between `insights` and `analytics`.
* **Outputs**:
  * Salary range comparisons (Min, Median, Max salary in Lakhs INR).
  * Growth rate progress bar, demand level indicator, and industry trends list.
  * Recharts Area Chart mapping interview progress; Recharts Funnel chart showing job applications status.
* **Conditional Logic**: If salary or industry insight data is outdated, a new AI payload is fetched automatically.

### C. Server Action Logic
* **Action Call**: `getIndustryInsights()`
  * **Database Query**: Mapped to `User` and `IndustryInsight` models.
  * **Fallback / AI Prompts**:
    * If `IndustryInsight` is null or outdated (`nextUpdate < now`), triggers `generateAIInsights(user.industry)` server action.
    * **Prompt Template**:
      ```
      Analyze the current state of the {industry} industry and provide insights in ONLY the following JSON format:
      {
        "salaryRanges": [
          { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
        ],
        ...
      }
      ```
    * Updates database record with new `lastUpdated` and `nextUpdate` dates.
  * **Returns**: Plain `IndustryInsight` model object.

### D. Current UI Details
* **Layout**: Main centered box structure (`max-w-7xl mx-auto px-4 md:px-8`).
* **Color Scheme**: Dark-mode theme (`bg-background`). High-impact HSL background overlays.
* **Typography**:
  * Main Headline: `text-4xl font-bold gradient-title tracking-tight`
  * Section Headers: `text-xl font-bold`
  * Card Values: `text-xl font-bold tracking-tight`
* **Every UI Element**:
  * **Readiness Score Circle**: A radial SVG progress indicator.
  * **Salary Radar Chart**: Displays interactive tooltips mapping salary values (`₹{item.value}L`).
  * **Tabs**: Form/Markdown switcher layout.
* **Tailwind Class Strings**:
  * Main Container: `space-y-6 pb-10`
  * Grid Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start`
  * Salary Card: `bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300`

### E. Data Flow Diagram
```
Dashboard mount -> getIndustryInsights() -> check date constraint -> (Outdated) generateAIInsights() -> DB Upsert -> UI Recharts radar render
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`, `ScrollToTop`
* **Custom Hooks**: *None*

---

## 4.4 — INTERVIEW PREPARATION & MOCK INTERVIEW
### A. Route & File Location
* **URL Routes**:
  * Setup & History: `/interview`
  * Session Room: `/interview/coach/session`
  * Mock Quiz: `/interview/mock`
* **Page Components**:
  * `/interview/page.jsx`
  * `/interview/coach/page.jsx`
  * `/interview/coach/session/page.jsx`
  * `/interview/mock/page.jsx`
* **Sub-components**:
  * `StatsCards`: `app/(main)/interview/_components/stats-card.jsx`
  * `PerformanceChart`: `app/(main)/interview/_components/performance-chart.jsx`
  * `QuizList`: `app/(main)/interview/_components/quiz-list.jsx`
  * `Quiz`: `app/(main)/interview/_components/quiz.jsx`
  * `InterviewSetup`: `app/(main)/interview/coach/_components/interview-setup.jsx`
  * `InterviewSession`: `app/(main)/interview/coach/_components/interview-session.jsx`
  * `SessionReport`: `app/(main)/interview/coach/_components/session-report.jsx`
  * `VoiceIndicator`: `app/(main)/interview/coach/_components/voice-indicator.jsx`
* **Server Action(s)**:
  * `generateQuiz`: `action/interview.js`
  * `saveQuizResult`: `action/interview.js`
  * `getAssessments`: `action/interview.js`
  * `generateInterviewQuestions`: `action/interview-coach.js`
  * `analyzeAnswer`: `action/interview-coach.js`
  * `saveInterviewSession`: `action/interview-coach.js`
  * `generateSessionReport`: `action/interview-coach.js`

### B. Functional Description
Simulates technical, behavioral, and HR interview rounds with speech recognition, tone scoring, and detailed session critiques.
* **User Flow (Mock Quiz)**:
  1. Enters `/interview/mock`, clicks **"Start Quiz"**.
  2. Selects an answer choice from 10 multiple-choice questions.
  3. Optionally checks **"Show Explanation"** before clicking **"Next"**.
  4. At the end, receives a score, review breakdown, and personalized learning tip.
* **User Flow (AI Coach Session)**:
  1. Navigates to `/interview/coach`, configures target role and interview type.
  2. In the Session Room, reads/hears the question. Speaks or types the response.
  3. Submits for AI analysis. Receives feedback, tone scores, and a stronger model answer.
  4. Repeats for all questions to generate a comprehensive session report.
* **Inputs**: Text answers (`userAnswer`), speech signals (`voiceMode`), target configuration parameters.
* **Outputs**:
  * Overall Readiness Score (0-100%).
  * Key strengths, weakness vectors, and **"Rejection Risk"** summary.
  * STAR method check, tone values, and a week-by-week learning roadmap.

### C. Server Action Logic
* **Action Call**: `analyzeAnswer(question, userAnswer, category)`
  * **AI Prompt**:
    ```
    You are an expert interview coach. Analyze the following answer...
    Return the response in this JSON format ONLY:
    {
      "scores": { "clarity": number, "relevance": number, "depth": number, "confidence": number },
      "starAnalysis": { "situation": boolean, "task": boolean, "action": boolean, "result": boolean },
      "feedback": "string",
      "improvedAnswer": "string",
      "toneAnalysis": { "overallTone": "confident...", "confidenceScore": number... }
    }
    ```
* **Action Call**: `generateInterviewQuestions(type, targetRole, company)`
  * **AI Prompt**: Generates 10 personalized questions using the candidate's resume as context.
  * **Fallback**: Returns 10 high-quality static questions if the API is unreachable.

### D. Current UI Details
* **Layout**: Split grids and full-width container options (`max-w-4xl mx-auto space-y-8 pb-20`).
* **Color Scheme**: Glassmorphism cards with primary borders (`border-primary/10`).
* **Typography**:
  * Main Title: `text-xl sm:text-2xl font-bold`
  * Questions: `text-base sm:text-lg font-bold leading-tight`
* **Every UI Element**:
  * **Voice Toggle Button**: Standard outlined pill. Shifts to a pulsing state when active.
  * **Visual Waveform Canvas**: Audio wave indicator.
  * **Answer Box**: Outlined text area.
* **Tailwind Class Strings**:
  * Progress Bar: `h-1.5`
  * Score Circle: `text-2xl sm:text-3xl font-black`
  * Custom Badge: `w-8 h-8 flex items-center justify-center p-0 rounded-lg text-sm font-black`

### E. Data Flow Diagram
```
Enable Voice -> Record audio -> Convert to text -> analyzeAnswer() -> DB update -> UI updates tone graphs & feedback
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble` (automatically hidden in `/session` paths)
* **Custom Hooks**:
  * `useSpeech`: Drives microphone inputs, handles filler words, speech speed calculations, and text-to-speech output.
  * `useFetch`: Handles network request states.

---

## 4.5 — BOARDROOM SALARY NEGOTIATOR
### A. Route & File Location
* **URL Route**: `/salary-negotiator`
* **Page Component**: `app/(main)/salary-negotiator/page.jsx`
* **Sub-components**:
  * `NegotiationSetup`: `app/(main)/salary-negotiator/_components/negotiation-setup.jsx`
  * `NegotiationChat`: `app/(main)/salary-negotiator/_components/negotiation-chat.jsx`
* **Server Action(s)**:
  * `startNegotiation`: `action/salary-negotiator.js`
  * `sendNegotiationMessage`: `action/salary-negotiator.js`
  * `finalizeNegotiation`: `action/salary-negotiator.js`

### B. Functional Description
A boardroom simulation where the user negotiates their compensation packages against a tough, lowballing recruiter AI.
* **User Flow**:
  1. User sets up their target role, target company, and target expected salary.
  2. Initiates the simulation. Receives a lowball initial offer (10-15% lower than expected) and a corporate justification.
  3. Sends counter-arguments defending their worth.
  4. The AI recruiter adjusts the offer (rising 2-3% if arguments are strong; remaining firm if arguments are weak).
  5. After 4-5 turns, the session is finalized to show the negotiation score and detailed critique.
* **Inputs**: Expected salary (numeric), company, role, custom chat messages.
* **Outputs**: Initial offer, recruiter responses, revised counter-offers, final score (0-100), and performance critique.
* **Conditional Logic**: Recruiter's willingness to increase the offer depends on the quality of the user's arguments.

### C. Server Action Logic
* **Action Call**: `startNegotiation(targetRole, company, expectedSalary)`
  * **AI Prompt**:
    ```
    You are a tough but professional recruiter at {company}. Make an initial offer that is 10-15% LOWER than their expected salary of INR {expectedSalary}...
    Return JSON only:
    { "initialOffer": number, "message": "string", "justification": "string" }
    ```
* **Action Call**: `sendNegotiationMessage(sessionId, userMessage, history)`
  * **AI Prompt**: Analyzes arguments. Increases the offer by 2-3% if arguments are strong, but never exceeds the target salary. Marks the session as `isFinal` on the 5th turn.
* **Action Call**: `finalizeNegotiation(sessionId, history)`
  * **AI Prompt**: Generates a performance score, feedback, and key negotiation templates.

### D. Current UI Details
* **Layout**: Chat message interface (`max-w-3xl mx-auto space-y-6 pb-10`).
* **Color Scheme**: Alternating message bubbles (Recruiter bubbles in `.bg-muted/50`; User bubbles in `.bg-primary`).
* **Typography**:
  * Expected Targets: `text-2xl font-bold`
  * Message Bubble text: `text-xs leading-relaxed`
* **Every UI Element**:
  * **Recruiter Avatar**: Standard robot logo.
  * **Action Button**: "Save Application".
* **Tailwind Class Strings**:
  * Main Container: `space-y-6 max-w-4xl mx-auto`
  * User Bubble: `bg-primary text-primary-foreground rounded-tr-none`
  * Recruiter Bubble: `bg-card text-foreground rounded-tl-none border border-border`

### E. Data Flow Diagram
```
Initialize Session -> startNegotiation() -> Initial offer -> User types counter -> sendNegotiationMessage() -> Updated counter-offer -> Finalize -> Score
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: `useFetch`

---

## 4.6 — AI SKILL GAP ANALYZER
### A. Route & File Location
* **URL Route**: `/skill-gap`
* **Page Component**: `app/(main)/skill-gap/page.jsx`
* **Sub-components**:
  * `SkillGapAnalyzer`: `app/(main)/skill-gap/_components/skill-gap-analyzer.jsx`
  * `SkillGapReportView`: `app/(main)/skill-gap/_components/skill-gap-report.jsx`
* **Server Action(s)**:
  * `analyzeSkillGap`: `action/skill-gap.js`
  * `deleteSkillGapReport`: `action/skill-gap.js`

### B. Functional Description
Compares job description requirements against the user's resume, outlining matching skills, missing skills, and a personalized 4-week learning roadmap.
* **User Flow**:
  1. Enters page, inputs target role, target company, and pastes the target job description.
  2. Clicks **"Analyze My Skills"**.
  3. Views the readiness score progress circle.
  4. Reviews the list of matching skills and critical skill gaps.
  5. Follows the weekly roadmap tasks and recommended resource links.
* **Inputs**: Target Job Title, Company (optional), Job Description (textarea).
* **Outputs**: Match readiness percentage, overall assessment, matching skills lists, missing skills with priority values, and a 4-week roadmap.

### C. Server Action Logic
* **Action Call**: `analyzeSkillGap(jobTitle, company, jobDescription)`
  * **AI Prompt**:
    ```
    Compare the candidate's resume against the job description...
    Return strictly in this JSON structure:
    {
      "readinessScore": number,
      "overallAssessment": "string",
      "matchingSkills": [ { "skill": "string", "confidence": number, "evidence": "string" } ],
      "missingSkills": [ { "skill": "string", "priority": "critical...", "reason": "string" } ],
      "roadmap": { "week1": { "focus": "string", "tasks": [...], "resources": [...] }, ... }
    }
    ```
  * **Database Query**: Saves the report to PostgreSQL: `db.skillGapReport.create({ data: { userId, jobTitle, company, jobDescription, content, readinessScore } })`
  * **Returns**: Plain `SkillGapReport` model object.

### D. Current UI Details
* **Layout**: Three-column dashboard breakdown (`grid grid-cols-1 md:grid-cols-3 gap-6`).
* **Color Scheme**: Success matching highlighted in green (`border-green-500/10 bg-green-500/5`); missing gaps highlighted in red (`border-red-500/10 bg-red-500/5`).
* **Typography**:
  * Readiness Score: `text-3xl font-bold`
  * Labels: `text-[10px] uppercase font-bold text-primary`
* **Every UI Element**:
  * **Readiness Matching Circle**: SVG ring showing the percentage match.
  * **Priority Badges**: Dynamic badges with conditional priority formatting (`bg-red-500/10 text-red-400` for critical; `bg-yellow-500/10 text-yellow-400` for important).
  * **Roadmap Weeks**: Grid layout showing the weekly focus, key tasks, and recommended resources.
* **Tailwind Class Strings**:
  * Main Card: `md:col-span-3 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent`
  * Tasks List: `text-xs text-foreground/80 flex items-start gap-2`

### E. Data Flow Diagram
```
Paste job description -> Click Analyze -> analyzeSkillGap() -> Match resume in DB -> Calculate score -> Save to DB -> Render roadmap grids
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: *None*

---

## 4.7 — RESUME BUILDER & AI TAILOR
### A. Route & File Location
* **URL Routes**:
  * Builder: `/resume`
  * Job Tailor: `/ai-tailor`
* **Page Components**:
  * `app/(main)/resume/page.jsx`
  * `app/(main)/ai-tailor/page.jsx`
* **Sub-components**:
  * `ResumeBuilder`: `app/(main)/resume/_components/resume-builder.jsx`
  * `EntryForm`: `app/(main)/resume/_components/entry-form.jsx`
  * `TailorForm`: `app/(main)/ai-tailor/_components/tailor-form.jsx`
* **Server Action(s)**:
  * `getResume`: `action/resume.js`
  * `saveResume`: `action/resume.js`
  * `improveWithAI`: `action/resume.js`
  * `parsePDFResume`: `action/resume.js`
  * `extractResumeFromPDF`: `action/resume.js`
  * `tailorResumeWithAI`: `action/resume.js`

### B. Functional Description
Allows users to build an ATS-friendly resume from scratch, upload an existing PDF, improve specific sections with AI, or tailor their resume to a specific job description.
* **User Flow (Resume Builder)**:
  1. Enters `/resume`. Form values are populated if a resume exists.
  2. Fills out contact details, professional summary, and skills list.
  3. Clicks **"Improve with AI"** on any section to optimize the text.
  4. Adds experience, education, and project details using the `EntryForm` dialog.
  5. Switches tabs to **"Markdown"** to preview, edit the raw markdown, or download as a PDF.
* **User Flow (AI Tailor)**:
  1. Enters `/ai-tailor`. Pastes a target job description and clicks **"1-Click Tailor"**.
  2. Receives a tailored resume and an ATS match score.
  3. Compares the original and optimized versions, then clicks **"Save"** to update the resume.
* **Inputs**: Text fields, date pickers, check boxes, custom markdown text.
* **Outputs**: Extracted PDF data, revised ATS-friendly summaries, and a downloadable PDF file.

### C. Server Action Logic
* **Action Call**: `improveWithAI({ current, type })`
  * **AI Prompt**: Rewrites the text for the specified section (summary, skills, experience, or projects) using action verbs, keywords, and metrics.
* **Action Call**: `extractResumeFromPDF({ base64, text })`
  * **AI Prompt**: Parses the PDF text (or uses multimodal fallback) and extracts structured details into a JSON payload.
* **Action Call**: `tailorResumeWithAI({ currentResume, jobDescription })`
  * **AI Prompt**: Re-writes the resume's summary, skills, and experience to align with the target job description.

### D. Current UI Details
* **Layout**: Two-column layout in Edit mode (`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8`); centered markdown preview area.
* **Color Scheme**: Tabs styled with primary variables (`data-active:bg-white data-active:text-black`). Alerts display in yellow (`border-l-yellow-500`).
* **Typography**:
  * Labels: `text-xs sm:text-sm`
  * Matching Badges: `text-[10px] sm:text-xs font-medium`
* **Every UI Element**:
  * **Upload Input**: Hidden input triggered via secondary button (`<Upload className="h-4 w-4 mr-2" />`).
  * **Match score progress bar**: Styled with primary theme values.
  * **Markdown Editor**: Integrated MDEditor previewing formatted text.
* **Tailwind Class Strings**:
  * Main Container: `space-y-6 sm:space-y-8`
  * Main Action Button: `w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-[0.98] h-10 sm:h-12 text-sm sm:text-base font-bold rounded-xl cursor-pointer`

### E. Data Flow Diagram
```
Paste job description -> Click Tailor -> tailorResumeWithAI() -> DB sync -> Render optimized MDEditor preview
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: `useFetch`

---

## 4.8 — AI PORTFOLIO BUILDER
### A. Route & File Location
* **URL Route**: `/portfolio`
* **Page Component**: `app/(main)/portfolio/page.jsx`
* **Sub-components**:
  * `PortfolioBuilder`: `app/(main)/portfolio/_components/portfolio-builder.jsx`
  * `ModernTemplate`: `app/p/[customUrl]/_components/template-modern.jsx`
* **Server Action(s)**:
  * `getPortfolio`: `action/portfolio.js`
  * `generatePortfolio`: `action/portfolio.js`
  * `updatePortfolioSettings`: `action/portfolio.js`

### B. Functional Description
Instantly generates a shareable, responsive portfolio website from the user's active resume.
* **User Flow**:
  1. Enters `/portfolio`. If no portfolio exists, clicks **"Generate My Portfolio"**.
  2. The AI parses the user's resume, creating a headline, about me section, and project highlights.
  3. User selects a template theme (Clean Professional vs. Modern Dark), sets their custom URL slug, and toggles the publish switch.
  4. Clicks **"Save Settings"** and views the live site at `/p/[customUrl]`.
* **Inputs**: Custom URL string, template ID selection, publish toggle switch.
* **Outputs**: Generated portfolio preview (headline, about me text, skills, experience, projects), and a live portfolio link.

### C. Server Action Logic
* **Action Call**: `generatePortfolio()`
  * **AI Prompt**:
    ```
    You are an expert web designer and copywriter. Convert the following resume into a structured JSON payload for a personal portfolio website...
    Return JSON only:
    { "headline": "...", "aboutMe": "...", "skills": [...], "experience": [...], "projects": [...] }
    ```
  * **Database Query**: Upserts the generated content: `db.portfolio.upsert({ where: { userId }, update: { content }, create: { userId, content, customUrl } })`
  * **Returns**: Plain `Portfolio` model object.

### D. Current UI Details
* **Layout**: Multi-panel setup (`grid grid-cols-1 md:grid-cols-3 gap-8`).
* **Color Scheme**: Active templates highlighted in primary purple (`border-primary bg-primary/5 shadow-lg`).
* **Typography**:
  * Titles: `text-xl md:text-2xl`
  * Headers: `text-sm font-semibold uppercase`
* **Every UI Element**:
  * **Publish Switch**: Standard toggle switch.
  * **Custom URL input group**: Text input prepended with a static prefix (`/p/`).
  * **Template cards**: Displays template previews with custom color bars (`bg-blue-500`, `bg-purple-600`).
* **Tailwind Class Strings**:
  * Settings Panel wrapper: `md:col-span-1 space-y-6`
  * Preview Panel wrapper: `md:col-span-2`

### E. Data Flow Diagram
```
Click Generate -> generatePortfolio() -> Read resume in DB -> Parse sections -> DB upsert -> Save -> Render preview cards
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: *None*

---

## 4.9 — AI JOB TRACKER (KANBAN)
### A. Route & File Location
* **URL Route**: `/job-tracker`
* **Page Component**: `app/(main)/job-tracker/page.jsx`
* **Sub-components**:
  * `KanbanBoard`: `app/(main)/job-tracker/_components/kanban-board.jsx`
  * `AddJobDialog`: `app/(main)/job-tracker/_components/add-job-dialog.jsx`
* **Server Action(s)**:
  * `addJobApplication`: `action/job-tracker.js`
  * `updateJobStatus`: `action/job-tracker.js`
  * `deleteJobApplication`: `action/job-tracker.js`
  * `getJobApplications`: `action/job-tracker.js`
  * `getAIJobAdvice`: `action/job-tracker.js`

### B. Functional Description
A drag-and-drop Kanban board to track job applications and receive status-specific AI advice.
* **User Flow**:
  1. Enters page, views existing application cards categorized by status.
  2. Clicks **"Add Application"**, fills out the form, and saves it.
  3. Clicks **"Ask AI for Next Step"** on any card to receive tailored advice.
  4. Uses the card dropdown menu to move applications to another stage or delete them.
* **Inputs**: Company name, Job role, status, notes.
* **Outputs**: Job application cards, total application count, and actionable AI advice.

### C. Server Action Logic
* **Action Call**: `getAIJobAdvice(jobId)`
  * **AI Prompt**:
    ```
    Analyze this job application and provide a specific "Next Action" or career advice...
    Return JSON only:
    { "nextAction": "string (1 short sentence)", "advice": "string" }
    ```
  * **Database Query**: Saves the advice to PostgreSQL: `db.jobApplication.update({ where: { id: jobId }, data: { nextAction: result.nextAction } })`

### D. Current UI Details
* **Layout**: Four-column horizontal layout (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`).
* **Color Scheme**: Columns styled with custom background colors (`bg-blue-500/10 text-blue-500` for applied; `bg-green-500/10` for offered).
* **Typography**:
  * Card Titles: `text-sm font-bold truncate`
  * Sub-text: `text-[10px] truncate`
* **Every UI Element**:
  * **Add Application Dialog**: Modal popup for creating jobs.
  * **Card Actions Dropdown**: Dropdown menu triggered by clicking `<MoreVertical className="h-8 w-8" />`.
  * **AI Suggestion Box**: Highlights suggestions in a custom box (`bg-primary/5 border border-primary/10`).
* **Tailwind Class Strings**:
  * Kanban column: `flex flex-col gap-4 min-h-[500px] p-2 rounded-2xl bg-muted/20 border border-dashed border-muted`
  * Job Card: `group border-primary/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm relative overflow-hidden`

### E. Data Flow Diagram
```
Click Ask AI -> getAIJobAdvice() -> Fetch job details -> Call Gemini -> Save nextAction -> DB update -> Render suggestion box
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: *None*

---

## 4.10 — LINKEDIN OPTIMIZER
### A. Route & File Location
* **URL Route**: `/linkedin-optimizer`
* **Page Component**: `app/(main)/linkedin-optimizer/page.jsx`
* **Sub-components**:
  * `OptimizerForm`: `app/(main)/linkedin-optimizer/_components/optimizer-form.jsx`
  * `OptimizerResult`: `app/(main)/linkedin-optimizer/_components/optimizer-result.jsx`
* **Server Action(s)**:
  * `optimizeLinkedInSection`: `action/linkedin.js`

### B. Functional Description
Rewrites and optimizes LinkedIn profiles for SEO and search discoverability.
* **User Flow**:
  1. Enters page, selects target profile section (headline, about summary, or experience description).
  2. Inputs target job role and pastes current text.
  3. Clicks **"Optimize with AI"**.
  4. Reviews the rewritten content, SEO keyword list, and before-and-after critique.
  5. Clicks **"Copy"** to copy the optimized text.
* **Inputs**: Section type, target role, current profile content.
* **Outputs**: Optimized profile text, recruiter visibility score, SEO keyword tags, and specific improvements breakdown.

### C. Server Action Logic
* **Action Call**: `optimizeLinkedInSection(sectionType, content, targetRole)`
  * **AI Prompt**:
    ```
    You are a professional LinkedIn profile optimizer... Optimize the following LinkedIn "{sectionType}" section for a "{targetRole}" role...
    Return JSON only:
    { "optimizedContent": "...", "seoKeywords": [...], "improvements": [ { "before": "...", "after": "...", "reason": "..." } ], "recruiterScore": number }
    ```

### D. Current UI Details
* **Layout**: Centered card setup (`max-w-3xl mx-auto space-y-8`).
* **Color Scheme**: Dark-mode theme (`bg-background`). Before-and-after logs colored in red/green.
* **Typography**:
  * Score value: `text-lg sm:text-2xl font-bold`
  * Sub-text: `text-[10px] sm:text-xs text-muted-foreground`
* **Every UI Element**:
  * **Copy Button**: Outline button showing dynamic copy states (`<Copy className="h-3 w-3" />` shifts to `<Check className="h-3 w-3" />`).
  * **SEO Badges**: Displays added keywords in primary badges (`bg-primary/10 text-primary border-primary/20`).
* **Tailwind Class Strings**:
  * Main Card: `bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl`
  * Before Box: `space-y-2 p-3 rounded-xl bg-muted/30 border border-muted`

### E. Data Flow Diagram
```
Submit form -> optimizeLinkedInSection() -> Call Gemini -> Receive rewritten JSON -> Render SEO badges and improvements checklist
```

### F. Dependencies & Shared Components
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: *None*

---

## 4.11 — AI COVER LETTER GENERATOR
### A. ROUTE & FILE LOCATION
* **URL Route**: `/ai-cover-letter`, `/ai-cover-letter/new`, and `/ai-cover-letter/[id]`
* **Page Component**: `app/(main)/ai-cover-letter/page.jsx`
* **Sub-components**:
  * `CoverLetterList`: `app/(main)/ai-cover-letter/_components/cover-letter-list.jsx`
  * `CoverLetterGenerator`: `app/(main)/ai-cover-letter/_components/cover-letter-generator.jsx`
  * `CoverLetterPreview`: `app/(main)/ai-cover-letter/_components/cover-letter-preview.jsx`
* **Server Action(s)**:
  * `getCoverLetters`: `action/cover-letter.js`
  * `getCoverLetter`: `action/cover-letter.js`
  * `generateCoverLetter`: `action/cover-letter.js`
  * `deleteCoverLetter`: `action/cover-letter.js`
  * `updateCoverLetter`: `action/cover-letter.js`
  * `improveWithAI`: `action/resume.js`

### B. WHAT THIS FEATURE DOES (FUNCTIONAL DESCRIPTION)
Allows users to create, manage, edit, and download highly tailored, ATS-friendly cover letters for their job applications.
* **User Flow (List page)**:
  1. Enters `/ai-cover-letter`, views a grid list of their past cover letters showing company name, job title, a short job description preview, and the creation date.
  2. Clicks **"Create New"** to navigate to the cover letter creator `/ai-cover-letter/new`.
  3. Clicks **"Eye" icon** to view/edit a specific cover letter.
  4. Clicks **"Trash" icon** to open an AlertDialog and delete a cover letter.
* **User Flow (New Cover Letter page)**:
  1. User enters company name, job title, and pastes the target job description.
  2. Optionally clicks **"Improve with AI"** to refine/format the pasted job description text before submitting.
  3. Clicks **"Generate Cover Letter"**. On success, gets redirected to `/ai-cover-letter/[id]`.
* **User Flow (Cover Letter Preview page)**:
  1. Views the generated cover letter rendered inside a Markdown Editor (`MDEditor`).
  2. Edits the raw markdown directly within the editor.
  3. Clicks **"Save Changes"** to persist edits.
  4. Clicks **"Download PDF"** which spawns a hidden iframe print driver to format the document cleanly and open the browser's system print dialog.
* **Inputs**:
  * `companyName` (text, required)
  * `jobTitle` (text, required)
  * `jobDescription` (textarea, required)
* **Outputs**: Grid of cover letters, real-time AI-optimized job descriptions, fully custom-generated cover letters, interactive markdown preview and editor workspace, and system-printed/downloadable PDF files.
* **Conditional Logic**: Shows an empty state card ("No Cover Letters Yet") if the user has no letters. Disable triggers on buttons during generation or saving states.

### C. SERVER ACTION / BACKEND LOGIC
* **Action Call**: `generateCoverLetter(data)`
  * **Parameters**: `{ companyName, jobTitle, jobDescription }`
  * **Database Queries**:
    1. Finds user: `db.user.findUnique({ where: { clerkUserId } })`
    2. Inserts new cover letter: `db.coverLetter.create({ data: { content, jobDescription, companyName, jobTitle, status: "completed", userId: user.id } })`
  * **AI Prompt**:
    ```
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
    ```
* **Action Call**: `updateCoverLetter(id, content)`
  * **Parameters**: `id` (string), `content` (string)
  * **Database Query**: Updates the cover letter record: `db.coverLetter.update({ where: { id, userId: user.id }, data: { content } })`

### D. CURRENT UI — MINUTE DETAIL
* **Layout**: Standard main area constraints with grid structures (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`) for lists; centered single-column layout (`max-w-3xl mx-auto`) for the markdown preview.
* **Color Scheme**: Glassmorphism cards with primary borders (`border-primary/10 hover:border-primary/30`). AlertDialog triggers destruction options highlighted in red (`bg-destructive text-destructive-foreground`).
* **Typography**:
  * Page Title: `text-3xl sm:text-4xl font-bold`
  * Card Titles: `text-base font-bold`
  * Card Subtitles: `text-xs text-muted-foreground`
  * Body Text: `text-xs text-muted-foreground`
* **Every UI Element**:
  * **Create New Button**: Filled variant with `<Plus className="h-4 w-4 mr-2" />` icon, styled with `cursor-pointer`.
  * **View Button**: Outlined button with `<Eye className="h-4 w-4" />` icon, styled with `cursor-pointer`.
  * **Delete Button**: Outlined button with `<Trash2 className="h-4 w-4" />` icon, styled with `text-destructive hover:bg-destructive/10 cursor-pointer`.
  * **Markdown Editor**: Integrated `MDEditor` set to dark color mode (`data-color-mode="dark"`), styled with `.bg-card`.
  * **Save Changes Button**: Outlined button with `<Save className="h-4 w-4 mr-2" />` or `<Loader2 className="animate-spin" />` in loading state, styled with `cursor-pointer`.
  * **Download PDF Button**: Outlined button with `<Download className="h-4 w-4 mr-2" />` icon, styled with `cursor-pointer`.
* **Animations**: Fade and slide transitions on tab/page routes. Loading spinner on generation.
* **Mobile Responsiveness**: Dynamic button stacks on small viewports. Font size shrinks from standard elements to smaller screens. Responsive cards span 1 column on mobile, 2 on tablet, and 3 on desktop.
* **Tailwind Class Strings**:
  * Main Card: `bg-card border-primary/10 hover:border-primary/30 transition-all duration-300`
  * Save Button: `text-xs sm:text-sm cursor-pointer`
  * Preview Wrapper: `border rounded-lg max-w-3xl mx-auto overflow-hidden shadow-sm`

### E. DATA FLOW DIAGRAM
```
Submit Details -> generateCoverLetter() -> Fetch resume/profile -> Gemini Core generate -> Create record in DB -> Redirect -> Set MDEditor State -> Print PDF via invisible iframe
```

### F. DEPENDENCIES & SHARED COMPONENTS
* **Shared Components**: `Header`, `AIAssistantBubble`, `ScrollToTop`
* **Custom Hooks**: `useFetch`

---

## 4.12 — COMPANY INTELLIGENCE / BATTLE PLAN
### A. ROUTE & FILE LOCATION
* **URL Route**: `/company-intel`
* **Page Component**: `app/(main)/company-intel/page.jsx`
* **Sub-components**:
  * `BattlePlanGenerator`: `app/(main)/company-intel/_components/battle-plan-generator.jsx`
  * `BattlePlanView`: `app/(main)/company-intel/_components/battle-plan-view.jsx`
* **Server Action(s)**:
  * `getCompanyBattlePlans`: `action/company-intel.js`
  * `generateCompanyBattlePlan`: `action/company-intel.js`
  * `deleteCompanyBattlePlan`: `action/company-intel.js`

### B. WHAT THIS FEATURE DOES (FUNCTIONAL DESCRIPTION)
Allows candidates to research target employers and obtain custom, high-fidelity AI battle plans mapping out culture, interview stages, common questions, salary benchmarks, and fit matrices.
* **User Flow**:
  1. Enters `/company-intel` (redirected to `/onboarding` if profile is incomplete).
  2. Fills out Company Name and optional Target Role, then clicks **"Generate Battle Plan"**.
  3. Views a toast loader showing researched status updates. On completion, the new plan appears at the top of the history list and automatically expands.
  4. Reviews the comprehensive plan tabs/cards including:
     - About Company (Mission, values, headquarters, employee count).
     - Interview Process (Rounds, expected duration, and dynamic Pro Tips).
     - "Why You're a Fit" (A custom resume match report).
     - Common Interview Questions (With category tags like behavioral/technical and approach tips).
     - Recent News items with summaries.
     - Expected Salary Range visualizer benchmarked in Lakhs INR.
  5. Clicks the **Trash** icon to delete past battle plans from the list.
* **Inputs**:
  * `companyName` (text, required)
  * `targetRole` (text, optional)
* **Outputs**: Custom company overview summaries, interview round pipelines, customized "Fit Analysis" based on active resume content, curated common questions grid, and expected salary range progress indicator.
* **Conditional Logic**: If user has no active resume, the "Why You're a Fit" card shows an instruction to upload a resume first.

### C. SERVER ACTION / BACKEND LOGIC
* **Action Call**: `generateCompanyBattlePlan(companyName, targetRole)`
  * **Parameters**: `companyName` (string), `targetRole` (string)
  * **Database Queries**:
    1. Reads user and active resume: `db.user.findUnique({ where: { clerkUserId }, include: { resume: true } })`
    2. Writes generated plan to DB: `db.companyIntel.create({ data: { userId, companyName, targetRole, content } })`
  * **AI Prompt**:
    ```
    You are a career intelligence analyst. Research "${companyName}" and create a comprehensive interview preparation "Battle Plan" for a "${targetRole}" role.

    The candidate's resume:
    """${resumeText}"""

    Return the response in this EXACT JSON format ONLY:
    {
      "companyOverview": {
        "mission": "string (1-2 sentences about the company mission)",
        "values": ["string (core company values)"],
        "culture": "string (2-3 sentences about work culture)",
        "size": "string (e.g. '180,000+ employees')",
        "headquarters": "string (city, country)"
      },
      ...
    }
    ```
  * **Parsing & Fallback**: Uses regex match (`text.match(/\{[\s\S]*\}/)`) to extract JSON blocks and parse safely.

### D. CURRENT UI — MINUTE DETAIL
* **Layout**: Top centered input form (`max-w-3xl mx-auto`) followed by a list of expandable/collapsible cards. Expanded battle plans render inside a two-column responsive grid layout.
* **Color Scheme**: Dark-mode primary panels (`bg-card/50`). Success fit block is colored in green (`border-green-500/10 bg-green-500/5`), questions categorized using HSL colored borders. Expected salary highlighted in yellow/primary gradients.
* **Typography**:
  * Title: `text-3xl md:text-4xl font-bold`
  * Card Header: `text-base font-bold`
  * Salary Text: `text-2xl font-bold`
* **Every UI Element**:
  * **Company Name Input**: Basic input styled with border overlays.
  * **Role Input**: Basic input field.
  * **Generate Button**: Secondary accent button with `<Sparkles className="h-5 w-5 mr-2" />` icon, styled with `cursor-pointer`.
  * **Trash Icon**: Small button inside each list row with `<Trash2 className="h-4 w-4" />` icon.
  * **Chevron Toggles**: `<ChevronUp>` and `<ChevronDown>` icons reflecting accordion open states.
  * **Badge Details**: HSL bordered badges showing rounds and categories.
  * **Loading state**: Pulse animation cards (`animate-pulse`) with sub-text indicators while researching.
* **Animations**: Expanding height animations, bounce icons during generation, and fade-in entries.
* **Mobile Responsiveness**: Layout shifts from two-column grids to single column blocks on mobile screens. Padding responsive scaling handles tight mobile layouts.
* **Tailwind Class Strings**:
  * Generator Card: `bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl`
  * Generate Button: `w-full sm:w-auto min-w-[200px] h-12 text-sm sm:text-base font-bold shadow-lg shadow-primary/20 cursor-pointer`
  * Fit Card: `border-green-500/10 bg-green-500/5`
  * Salary Card: `border-yellow-500/10 bg-yellow-500/5`

### E. DATA FLOW DIAGRAM
```
Submit Form -> generateCompanyBattlePlan() -> Read Resume -> Call Gemini -> Safe regex JSON parse -> db.companyIntel.create -> Prepend & Auto-Expand Accordion -> Render sub-charts
```

### F. DEPENDENCIES & SHARED COMPONENTS
* **Shared Components**: `Header`, `AIAssistantBubble`, `ScrollToTop`
* **Custom Hooks**: *None*

---

## 4.13 — REFERRAL / NETWORKING OUTREACH
### A. ROUTE & FILE LOCATION
* **URL Route**: `/networking`
* **Page Component**: `app/(main)/networking/page.jsx`
* **Sub-components**:
  * `ReferralForm`: `app/(main)/networking/_components/referral-form.jsx`
* **Server Action(s)**:
  * `generateReferralMessage`: `action/networking.js`

### B. WHAT THIS FEATURE DOES (FUNCTIONAL DESCRIPTION)
Enables candidates to draft highly effective cold outreach messages for LinkedIn connection requests and detailed referral request emails.
* **User Flow**:
  1. Enters `/networking`, reads target contact form.
  2. Fills out Company Name, Target Role, and optional details like Contact Name or Contact Role.
  3. Clicks **"Generate Messages"**.
  4. Receives two formatted message outputs under tab selections:
     - **LinkedIn Invite**: Short version (strictly under 300 characters for LinkedIn connection note constraints) showing character count.
     - **Full Message**: A detailed email template including a curated email Subject Line.
  5. Clicks **"Copy"** button on either tab to save the message instantly to the clipboard.
  6. Clicks **"Back to Generator"** to adjust form details.
* **Inputs**:
  * `company` (text, required)
  * `role` (text, required)
  * `contactName` (text, optional)
  * `contactRole` (text, optional)
* **Outputs**: Curated connection invite notes (character-capped), outreach email body with custom subject lines, networking tips cards, and a pre-flight checklist.
* **Conditional Logic**: Buttons are disabled while the AI drafts the messages.

### C. SERVER ACTION / BACKEND LOGIC
* **Action Call**: `generateReferralMessage(data)`
  * **Parameters**: `{ company, role, contactName, contactRole }`
  * **Database Queries**:
    1. Reads user and active resume: `db.user.findUnique({ where: { clerkUserId }, include: { resume: true } })`
  * **AI Prompt**:
    ```
    You are an expert at professional networking. Write a highly effective "Cold Outreach" message for LinkedIn or Email asking for a referral or introduction.
    
    Target Company: ${data.company}
    Target Role: ${data.role}
    Contact Name: ${data.contactName || "the professional"}
    Contact Role: ${data.contactRole || "someone at the company"}
    
    Candidate's Background (Resume):
    """${resumeText}"""
    
    Your Task:
    1. Write a message that is concise, professional, and has a clear value proposition.
    2. Reference specific skills or experiences from the resume that match the target company/role.
    ...
    ```

### D. CURRENT UI — MINUTE DETAIL
* **Layout**: Centered card form structure (`max-w-3xl mx-auto`), transitioning to an outreach dashboard with tab options (`Tabs`) and checklist panels.
* **Color Scheme**: Form highlights styled using primary brand variables (`bg-primary/10`). Tabs use standard Shadcn outlines. Connected copy buttons shift from outline variants to success highlights on click.
* **Typography**:
  * Title: `text-4xl font-bold`
  * Headers: `text-lg font-bold`
  * Checklist label: `text-xs text-muted-foreground`
* **Every UI Element**:
  * **Form Inputs**: Basic texts fields.
  * **Tabs**: `<TabsList>` showing LinkedIn Invite vs Full Message options.
  * **Copy Button**: Outline variant that dynamically toggles from `<Copy className="h-3 w-3" />` to `<Check className="h-3 w-3" />` upon click.
  * **Character Counter**: Small text alert at the bottom showing exact connections length.
  * **checklist list**: Displays tips and checklists with `<CheckCircle2>` icons.
* **Animations**: Fade-in and slide animations on output panels.
* **Mobile Responsiveness**: Responsive form elements adjust to small widths; tabs span horizontally with auto-scroll handles or full-width wrapping.
* **Tailwind Class Strings**:
  * Header Avatar: `h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2`
  * Submit Button: `w-auto px-10 h-12 text-base font-bold shadow-lg shadow-primary/20 cursor-pointer`
  * Output Card: `border-primary/10 shadow-xl overflow-hidden`
  * Output Code Container: `p-4 rounded-xl bg-muted/30 border border-muted font-medium text-sm leading-relaxed`

### E. DATA FLOW DIAGRAM
```
Submit Form -> generateReferralMessage() -> Read Resume -> Call Gemini -> Safely parse JSON -> Set tabs state -> Copy message to clipboard
```

### F. DEPENDENCIES & SHARED COMPONENTS
* **Shared Components**: `Header`, `AIAssistantBubble`
* **Custom Hooks**: *None*

---

# SECTION 5 — GLOBAL & SHARED COMPONENTS

## 1. `Header`
* **File Path**: `app/components/header.jsx` ([header.jsx](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/header.jsx))
* **Renders**: Sticky navigation header with the application logo, navigation links, and the Clerk `<UserButton>` component.
* **Props**: *None*
* **UI styling**: Blurry transparent header (`bg-background/80 backdrop-blur-md`). Implements custom Server Component wrappers (`SignedIn`, `SignedOut`) to show dynamic menu states.
* **Usage**: Rendered globally inside `app/(main)/layout.js`.

---

## 2. `NavActions`
* **File Path**: `app/components/nav-actions.jsx` ([nav-actions.jsx](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/nav-actions.jsx))
* **Renders**: The core tool navigation suite. Includes a two-column desktop grid for the professional suite and a simplified dropdown list for mobile.
* **Props**: *None*
* **UI styling**: Glassmorphism dropdown container (`bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl`).
* **Usage**: Rendered inside `Header` component.

---

## 3. `AIAssistantBubble`
* **File Path**: `app/components/ai-assistant-bubble.jsx` ([ai-assistant-bubble.jsx](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/ai-assistant-bubble.jsx))
* **Renders**: A floating chat widget displaying the context-aware career coach.
* **Props**: *None*
* **UI styling**: Glassmorphic bubble featuring card expansions (`w-[320px] sm:w-[350px] md:w-[400px] h-[450px] sm:h-[500px] shadow-2xl border-primary/20`).
* **Usage**: Rendered globally in `MainLayout`. **Automatically hidden** when the user is inside an active, high-focus interview coaching session.

---

## 4. `ScrollToTop`
* **File Path**: `app/components/scroll-to-top.jsx` ([scroll-to-top.jsx](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/scroll-to-top.jsx))
* **Renders**: A utility wrapper that resets the window scroll position to coordinates `(0,0)` whenever the active pathname changes.
* **Props**: *None*
* **Usage**: Rendered globally in `MainLayout`.

---

## 5. `ThemeProvider`
* **File Path**: `app/components/theme-provider.jsx` ([theme-provider.jsx](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/theme-provider.jsx))
* **Renders**: Next-themes provider configuring dark-mode variables across CSS hooks.
* **Props**: `children` (`ReactNode`, Required), `props` (`any`, Optional).
* **Usage**: Rendered globally in `RootLayout`.

---

# SECTION 6 — BACKGROUND JOBS & CRON
Background jobs are implemented in [lib/inngest/function.js](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/inngest/function.js):

## 1. `generateIndustryInsights`
* **ID**: `generate-industry-insights`
* **Name**: Generate Industry Insights
* **Trigger Event**: Cron schedule `0 0 * * 0` (executed every Sunday at midnight).
* **Workflow Steps**:
  1. **Get Industries**: Fetches a list of all registered industry sectors from PostgreSQL:
     ```javascript
     await db.industryInsight.findMany({ select: { industry: true } })
     ```
  2. **Generate insights**: Iterates through each industry and prompts the Gemini API to analyze current salary structures, growth rates, skills, and trends.
  3. **Update database**: Saves the updated insights to the database, setting the next update time to 7 days in the future:
     ```javascript
     await db.industryInsight.update({ where: { industry }, data: { ...insights, lastUpdated: new Date(), nextUpdate: new Date(...) } })
     ```

---

# SECTION 7 — AI INTEGRATION LAYER
Specialized AI integration utilities are implemented in [lib/gemini.js](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/gemini.js):

## 💻 Primary Interface Signature
```javascript
export async function getAIResponse(prompt, options = {})
```
* **Parameters**:
  * `prompt` (`String`, Required): Text prompt sent to the Gemini model.
  * `options` (`Object`, Optional): Supports additional parameters (e.g. base64-encoded PDF files).

---

## 🛠️ Model Fallback Chain
If the primary model is busy or unavailable, the system automatically cascades through the fallback chain in this order:
1. `gemini-2.5-flash`
2. `gemini-2.5-flash-lite`
3. `gemini-2.0-flash`
4. `gemini-1.5-flash`
5. `gemini-1.5-pro`

---

## 🔄 API Key Rotation & Retry Strategy
* **API Key Cycling**: Collects up to three Gemini API keys defined in the environment:
  ```javascript
  const API_KEYS = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean);
  ```
  If all models on a key return `429` (Rate limits) errors, the system switches to the next active key.
* **Exponential Backoff**: If a model returns a `429` or `503` (Service unavailable) error, the system waits using an exponential backoff formula ($2^{\text{attempt}} \times 1000$ milliseconds) before retrying.
* **Smart Error Classification**: If a model returns a `404` error (indicating the model doesn't exist or is deprecated), it is instantly skipped without wasting retries.
* **Response Delivery**: Returns raw generated strings to Server Actions for parsing.

---

# SECTION 8 — CURRENT UI DESIGN SYSTEM AUDIT

## 🎨 Design Tokens & Component Libraries
* **Framework**: Built on **Shadcn UI** components using **Radix UI** primitives.
* **CSS variables**: oklch variables defined in `app/globals.css` ([globals.css](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/globals.css)):
  * Primary: `oklch(0.205 0 0)` (Dark theme) / `oklch(0.922 0 0)` (Light theme).
  * Destructive: `oklch(0.577 0.245 27.325)`.
  * Border: `oklch(0.922 0 0)`.
* **Typography**:
  * Font Family: **Inter** (configured globally in `app/layout.js`).
  * MDEditor text styled with Segoe UI, Tahoma, and Verdana fallbacks.
* **Grid Overlays**: Grid lines are rendered via the `.grid-background` overlay selector.
* **Icons**: Handled exclusively using the **Lucide-react** library.

---

## ⚠️ UI UX Design Inconsistencies
* **Typography Hierarchy**: Several headings (e.g., in `/job-tracker` and `/linkedin-optimizer`) use duplicate font sizes like `text-xl sm:text-xl sm:text-2xl font-bold`, resulting in inconsistent scaling.
* **Alert Design Patterns**: The markdown alert uses a hardcoded yellow layout (`border-2 border-yellow-600`), while other forms use standard Shadcn alert components.
* **Color inconsistency**: Matching scores and priorities use varying shade structures (e.g., green matching displays range from `bg-green-500/10 text-green-400` to `text-green-500 bg-green-500/10`).
* **Interactive Buttons**: The pointer styles of several buttons are set to `cursor-pointer`, while others rely on default browser pointer styles.

---

# SECTION 9 — PAGES THAT NEED THE MOST REDESIGN ATTENTION

## 1. AI Coach Session (`/interview/coach/session`)
* **Complexity**: High. Integrates real-time speech recognition, voice synthesis, filler-word tracking, audio waveform indicators, and multi-layered feedback screens.
* **Tailwind Consistency**: Uses hardcoded background panels (`bg-zinc-800/50`) and custom border overrides (`border-zinc-700/50`).
* **Empty/Loading states**: Skeletons display while loading, but empty states are missing if an active session is interrupted.

## 2. Resume Builder (`/resume`)
* **Complexity**: High. Manages nested form sections (summary, skills, experience, education, projects) alongside an MDEditor workspace and PDF download iframe.
* **Inconsistencies**: Uses hardcoded border alerts (`border-yellow-600`) and custom raw print style rules.
* **Interactions**: Frequent tab switching and form submission actions.

## 3. Boardroom Salary Negotiator (`/salary-negotiator`)
* **Complexity**: High. Displays a mock chat workspace with dynamic recruiter responses, lowball counter-offers, and negotiation metrics.
* **Interactions**: Step-by-step chat transitions and interactive counter-offer updates.

---

# SECTION 10 — COMPLETE FILE INVENTORY

## 📁 File Registry

### ⚙️ Root Project Files
* [`middleware.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/middleware.js): Implements Clerk route guards and onboarding redirections.
* [`package.json`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/package.json): Technical dependencies and build scripts.
* [`postcss.config.mjs`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/postcss.config.mjs): PostCSS build configurations.
* [`eslint.config.mjs`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/eslint.config.mjs): ESLint rules.
* [`jsconfig.json`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/jsconfig.json): Javascript paths.
* [`components.json`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/components.json): Shadcn CLI configuration settings.
* [`project_overview.md`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/project_overview.md): High-level feature specifications.
* [`progress_report.md`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/progress_report.md): Phase completion reports.

### 🔌 Library Files
* [`lib/checkUser.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/checkUser.js): Upserts active Clerk users into PostgreSQL.
* [`lib/gemini.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/gemini.js): Resilient AI model cycling utility.
* [`lib/prisma.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/prisma.js): Initializes the Prisma client.
* [`lib/utils.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/lib/utils.js): Renders Tailwind-merge operations.
* [`app/lib/helper.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/lib/helper.js): Renders markdown transformations.
* [`app/lib/schema.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/lib/schema.js): Zod validation schemas.

### 🛠️ Server Actions
* [`action/user.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/user.js): Manages user profile updates and checks onboarding status.
* [`action/resume.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/resume.js): PDF parsing, text extraction, and resume tailoring actions.
* [`action/cover-letter.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/cover-letter.js): Cover letter generation, deletion, and updates.
* [`action/dashboard.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/dashboard.js): Fetches industry insights and salary ranges.
* [`action/interview.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/interview.js): Assessment generation and score tracking.
* [`action/interview-coach.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/interview-coach.js): Renders real-time interview coach evaluations.
* [`action/salary-negotiator.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/salary-negotiator.js): Simulated salary negotiations.
* [`action/skill-gap.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/skill-gap.js): Skill gap analyses.
* [`action/linkedin.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/linkedin.js): LinkedIn profile optimizations.
* [`action/networking.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/networking.js): Networking templates.
* [`action/portfolio.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/portfolio.js): AI portfolio creations.
* [`action/career-byte.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/career-byte.js): Daily tip generations.
* [`action/ai-assistant.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/action/ai-assistant.js): Sage AI chat response actions.

### 🖥️ Page Layouts & Frontends
* [`app/layout.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/layout.js): Root layout.
* [`app/globals.css`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/globals.css): Global style sheet.
* [`app/not-found.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/not-found.jsx): 404 page.
* [`app/(auth)/layout.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(auth)/layout.js): Auth page layout wrapper.
* [`app/(auth)/sign-in/[[...sign-in]]/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(auth)/sign-in/[[...sign-in]]/page.jsx): Login page.
* [`app/(auth)/sign-up/[[...sign-up]]/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(auth)/sign-up/[[...sign-up]]/page.jsx): Sign up page.
* [`app/(main)/layout.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/layout.js): Dashboard layout wrapper.
* [`app/(main)/page.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/page.js): Marketing landing page.
* [`app/(main)/onboarding/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/onboarding/page.jsx): Onboarding setup page.
* [`app/(main)/dashboard/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/page.jsx): Main dashboard page.
* [`app/(main)/resume/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/resume/page.jsx): Resume page.
* [`app/(main)/portfolio/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/portfolio/page.jsx): Portfolio builder page.
* [`app/(main)/ai-tailor/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-tailor/page.jsx): Job tailor page.
* [`app/(main)/ai-cover-letter/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-cover-letter/page.jsx): Cover letters list page.
* [`app/(main)/ai-cover-letter/new/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-cover-letter/new/page.jsx): New cover letter form.
* [`app/(main)/ai-cover-letter/[id]/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-cover-letter/[id]/page.jsx): Saved cover letter page.
* [`app/(main)/interview/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/page.jsx): Interview preparation list page.
* [`app/(main)/interview/coach/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/coach/page.jsx): Interview coach setup page.
* [`app/(main)/interview/coach/session/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/coach/session/page.jsx): Active interview coaching room.
* [`app/(main)/interview/mock/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/mock/page.jsx): Mock interview quiz page.
* [`app/(main)/company-intel/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/company-intel/page.jsx): Company intelligence page.
* [`app/(main)/skill-gap/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/skill-gap/page.jsx): Skill gap analyzer page.
* [`app/(main)/salary-negotiator/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/salary-negotiator/page.jsx): Salary negotiator page.
* [`app/(main)/linkedin-optimizer/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/linkedin-optimizer/page.jsx): LinkedIn optimizer page.
* [`app/(main)/job-tracker/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/job-tracker/page.jsx): Kanban board tracker.
* [`app/(main)/networking/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/networking/page.jsx): Referral generator page.
* [`app/p/[customUrl]/page.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/p/[customUrl]/page.jsx): Public portfolio view page.

### 🛡️ Shared Components
* [`app/components/header.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/header.jsx): Main navigation header.
* [`app/components/nav-actions.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/nav-actions.jsx): AI tools navigation list.
* [`app/components/ai-assistant-bubble.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/ai-assistant-bubble.jsx): Career coach floating bubble.
* [`app/components/scroll-to-top.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/scroll-to-top.jsx): Router navigation window resetting hook.
* [`app/components/theme-provider.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/theme-provider.jsx): Light/Dark theme provider.
* [`app/components/hero.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/components/hero.jsx): Marketing landing page hero.

### 🛠️ Feature Components
* [`app/(main)/onboarding/_components/onboarding-form.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/onboarding/_components/onboarding-form.jsx): Form values parser.
* [`app/(main)/dashboard/_components/dashboard-view.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/_components/dashboard-view.jsx): Industry insight dashboards.
* [`app/(main)/dashboard/_components/performance-analytics.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/_components/performance-analytics.jsx): Area progress chart dashboards.
* [`app/(main)/dashboard/_components/career-byte-card.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/_components/career-byte-card.jsx): Daily tip cards.
* [`app/(main)/dashboard/_components/readiness-score.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/_components/readiness-score.jsx): Composite gauge calculators.
* [`app/(main)/dashboard/_components/interview-trends.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/_components/interview-trends.jsx): Session trends dashboards.
* [`app/(main)/dashboard/_components/application-funnel.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/dashboard/_components/application-funnel.jsx): Kanban status indicators.
* [`app/(main)/resume/_components/resume-builder.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/resume/_components/resume-builder.jsx): Modular form wizard builder.
* [`app/(main)/resume/_components/entry-form.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/resume/_components/entry-form.jsx): Accordion details editor.
* [`app/(main)/portfolio/_components/portfolio-builder.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/portfolio/_components/portfolio-builder.jsx): Theme choices settings panel.
* [`app/(main)/ai-tailor/_components/tailor-form.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-tailor/_components/tailor-form.jsx): One-click optimization wizard.
* [`app/(main)/ai-cover-letter/_components/cover-letter-generator.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-cover-letter/_components/cover-letter-generator.jsx): Prompt inputs selector.
* [`app/(main)/ai-cover-letter/_components/cover-letter-list.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-cover-letter/_components/cover-letter-list.jsx): History grids selector.
* [`app/(main)/ai-cover-letter/_components/cover-letter-preview.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/ai-cover-letter/_components/cover-letter-preview.jsx): Formatter printing frame.
* [`app/(main)/interview/_components/stats-card.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/_components/stats-card.jsx): Readiness statistics widget.
* [`app/(main)/interview/_components/performance-chart.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/_components/performance-chart.jsx): Area chart widget.
* [`app/(main)/interview/_components/quiz-list.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/_components/quiz-list.jsx): Past quizzes widget.
* [`app/(main)/interview/_components/quiz.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/_components/quiz.jsx): Mock interview workspace.
* [`app/(main)/interview/coach/_components/interview-setup.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/coach/_components/interview-setup.jsx): Coach parameters selector.
* [`app/(main)/interview/coach/_components/interview-session.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/coach/_components/interview-session.jsx): Active interview coaching workspace.
* [`app/(main)/interview/coach/_components/session-report.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/coach/_components/session-report.jsx): Readiness evaluation dashboard.
* [`app/(main)/interview/coach/_components/voice-indicator.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/interview/coach/_components/voice-indicator.jsx): Audio indicator.
* [`app/(main)/company-intel/_components/battle-plan-generator.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/company-intel/_components/battle-plan-generator.jsx): Insiders search forms.
* [`app/(main)/company-intel/_components/battle-plan-view.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/company-intel/_components/battle-plan-view.jsx): Grid results dashboard.
* [`app/(main)/skill-gap/_components/skill-gap-analyzer.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/skill-gap/_components/skill-gap-analyzer.jsx): Analyzer form.
* [`app/(main)/skill-gap/_components/skill-gap-report.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/skill-gap/_components/skill-gap-report.jsx): Dashboard visualizer.
* [`app/(main)/salary-negotiator/_components/negotiation-setup.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/salary-negotiator/_components/negotiation-setup.jsx): Targets form.
* [`app/(main)/salary-negotiator/_components/negotiation-chat.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/salary-negotiator/_components/negotiation-chat.jsx): Simulated chat simulator.
* [`app/(main)/linkedin-optimizer/_components/optimizer-form.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/linkedin-optimizer/_components/optimizer-form.jsx): Form selection.
* [`app/(main)/linkedin-optimizer/_components/optimizer-result.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/linkedin-optimizer/_components/optimizer-result.jsx): Results workspace.
* [`app/(main)/job-tracker/_components/add-job-dialog.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/job-tracker/_components/add-job-dialog.jsx): Creation modal.
* [`app/(main)/job-tracker/_components/kanban-board.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/job-tracker/_components/kanban-board.jsx): Status columns grids.
* [`app/(main)/networking/_components/referral-form.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/(main)/networking/_components/referral-form.jsx): Outreach generators.
* [`app/p/[customUrl]/_components/template-modern.jsx`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/app/p/[customUrl]/_components/template-modern.jsx): Modern template dashboard.

### 🧪 Test & Scratch Files
* [`test-ai.js`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/test-ai.js): AI model testing script.
* [`test-ai.cjs`](file:///d:/HARIOM/BtechFinalYearProject/sage-ai/test-ai.cjs): AI model CommonJS testing script.

---

### ⚠️ Unused or Orphaned Files
* `test-ai.js` and `test-ai.cjs`: Both files serve as raw playground scripts located outside standard route configurations and are not imported by any production bundles.
* `components/ui/`: Duplicate empty folders left over from initial config setups are present in the root path.

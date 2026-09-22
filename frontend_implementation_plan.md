# PrepAgent — Complete Frontend Implementation Plan

Build a production-grade, aesthetically stunning web frontend for **PrepAgent** based on [Implementation.md](file:///c:/Users/anuj1/OneDrive/Desktop/Anuj/Code/PrepAgent/Implementation.md). The application will leverage React 19, Vite, Tailwind CSS v4, Shadcn UI components, Lucide icons, Recharts, TanStack Query, and Zustand, strictly adhering to the existing folder structure within `frontend/src/`.

---

## User Review Required

> [!IMPORTANT]
> **API & Mock Fallback Architecture**: The backend currently implements **Auth**, **Profile**, and **Assessments** modules. To deliver a complete, fully functional, and testable end-to-end experience across all 6 phases of [Implementation.md](file:///c:/Users/anuj1/OneDrive/Desktop/Anuj/Code/PrepAgent/Implementation.md) (including Skill-Gap, Roadmap generation with SSE streaming, AI Coach Chat with SSE, Curated Resources, Reports, Notifications, and Admin), the frontend will connect directly to the real backend endpoints (`http://localhost:5000/api/v1`) while seamlessly falling back to rich, realistic simulated responses when an endpoint is not yet reachable or returns 404/network errors.

> [!NOTE]
> **Path Alias & Folder Correction**:
> - Fix the `@/*` alias in `frontend/tsconfig.app.json` and `frontend/tsconfig.json` so `@/*` maps to `src/*`.
> - Move existing misplaced files from root `@/components/ui/button.tsx` and `@/lib/utils.ts` into `src/components/ui/` and `src/lib/`, removing the root `@` directory.

---

## Architecture & Design System

### 1. Visual & UI Guidelines
- **Palette**: Sleek dark/light modern developer aesthetics inspired by modern AI developer tools (Linear, Vercel, Supabase).
- **Typography**: Inter Variable with crisp hierarchy.
- **Micro-interactions**: Smooth transitions, glowing accents on active items, glassmorphism cards (`backdrop-blur-md bg-card/80 border border-border/40`), and real-time streaming text effects.
- **Charts**: Interactive Recharts components for Skill-Gap radar, topic mastery bars, and milestone completion velocity.

### 2. State & Data Layer
- **Auth Store (`src/stores/authStore.ts`)**: Zustand store with `persist` handling JWT tokens, student/admin user profiles, and login/logout state.
- **API Client (`src/lib/axios.ts`)**: Axios instance with automatic `Authorization: Bearer <token>` injection, 401 token refresh queue, and unified error handling.
- **Streaming Client (`src/lib/sse.ts`)**: SSE utility supporting chunk-by-chunk token streaming for both Roadmap generation progress events and AI Coach Chat responses.
- **TanStack Query (`src/lib/queryClient.ts`)**: Server-state caching, optimistic updates, and background refetches.

---

## Proposed Changes

```
frontend/
├── tsconfig.app.json                      [MODIFY] Fix path alias mapping
├── tsconfig.json                          [MODIFY] Add path alias compilerOptions
├── src/
│   ├── index.css                          [MODIFY] Clean Tailwind v4 theme & shadcn tokens
│   ├── types/                             [NEW] TypeScript interfaces for all modules
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   ├── assessment.ts
│   │   ├── skillgap.ts
│   │   ├── roadmap.ts
│   │   ├── chat.ts
│   │   ├── resource.ts
│   │   ├── notification.ts
│   │   └── admin.ts
│   ├── lib/
│   │   ├── utils.ts                       [NEW] cn helper
│   │   ├── axios.ts                       [MODIFY] Auth headers & refresh interceptor
│   │   ├── sse.ts                         [MODIFY] Real SSE + mock fallback stream
│   │   └── queryClient.ts                 [MODIFY] Optimized query settings
│   ├── stores/
│   │   └── authStore.ts                   [NEW] Zustand auth & session store
│   ├── components/
│   │   ├── ui/                            [NEW] Shadcn UI primitive components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── select.tsx
│   │   ├── layout/                        [NEW] Application layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── common/                        [NEW] Shared UI components
│   │   │   ├── PageHeader.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── EmptyState.tsx
│   │   └── charts/                        [NEW] Recharts visualizations
│   │       ├── SkillGapRadarChart.tsx
│   │       ├── TopicMasteryBarChart.tsx
│   │       └── ProgressPaceChart.tsx
│   ├── features/
│   │   ├── auth/                          [NEW] Login & Register pages and hooks
│   │   ├── profile/                       [NEW] Student profile & target companies form
│   │   ├── assessment/                    [NEW] Adaptive question test-runner & history
│   │   ├── skillgap/                      [NEW] Skill-gap matrix vs company benchmarks
│   │   ├── roadmap/                       [NEW] AI roadmap timeline & SSE generator modal
│   │   ├── chat/                          [NEW] AI Placement Coach streaming chat
│   │   ├── resources/                     [NEW] Curated prep resources with filtering
│   │   ├── report/                        [NEW] Progress & readiness report with export
│   │   ├── notifications/                 [NEW] Notification center drawer & popover
│   │   └── admin/                         [NEW] Admin CRUD & analytics overview
│   └── app/
│       ├── router.tsx                     [MODIFY] Full React Router configuration
│       ├── providers.tsx                  [MODIFY] TanStack Query & Auth hydration
│       └── App.tsx                        [MODIFY] Clean RouterProvider mount
```

---

## Detailed Feature Implementation

### 1. `features/auth/`
- **Login & Register**: Modern split-card layout, client-side validation using Zod + React Hook Form, password strength meter, role selector (student vs. demo admin), and instant demo login button for rapid testing.
- **Session management**: Automatic refresh token rotation, persistent login via `localStorage`, and role-based route gating (`requireRole('admin')`).

### 2. `features/profile/`
- **Profile Hub**: Complete profile view and editing interface matching backend schema:
  - Degree, institution, graduation year.
  - Programming skills & technical subjects tag manager (type-to-add, popular suggestions).
  - Target companies multi-select (Google, Amazon, Microsoft, Uber, Meta, etc.).
  - Prep timeline slider (weeks: 1–52).
- Triggers automatic "roadmap stale" notification flag on update.

### 3. `features/assessment/`
- **Adaptive Assessment Session**:
  - Test runner supporting **MCQ**, **technical short answer**, and **coding challenges** (with syntax-highlighted code editor area and sample test cases).
  - Live difficulty indicator that adaptively shifts between `easy`, `medium`, and `hard` based on rolling accuracy.
  - Instant submission feedback and session completion screen with overall score percentage and per-topic mastery breakdown.
  - Assessment history table with filter and pagination.

### 4. `features/skillgap/`
- **Skill Gap Matrix & Radar**:
  - Compares student's assessed proficiency (1: beginner → 4: expert) against target company expectations.
  - Interactive Radar & Bar charts visually showing gap severity (`Critical`, `Moderate`, `On Track`).
  - Action button: *"Generate Tailored AI Roadmap from Gaps"*.

### 5. `features/roadmap/`
- **Interactive AI Roadmap**:
  - Week-by-week timeline cards with weekly goals checklist, topics, and linked ChromaDB resource recommendations.
  - Milestone status toggles (`pending`, `started`, `completed`, `skipped`) with instant progress bar calculation.
  - **SSE Generator Dialog**: Real-time animated graph execution visualizer showing nodes:
    `profile` ➔ `skillAssessment` ➔ `skillGap` ➔ `roadmapGeneration` ➔ `resourceRecommendation` ➔ `persist`.
  - Roadmap version history switcher (active vs. superseded versions).

### 6. `features/chat/`
- **AI Placement Coach Chat**:
  - Clean, high-performance chat interface with real-time SSE token-by-token streaming.
  - Contextual intelligence: Profile summary + RAG resources + recent conversation history.
  - Quick prompt pills (e.g., *"Help me prep for Amazon Leadership Principles"*, *"Explain Trie complexity"*).
  - Markdown formatting support for code blocks, tables, and lists.

### 7. `features/resources/`
- **Curated Practice Resources Directory**:
  - Searchable problem bank, technical articles, and interview questions.
  - Multi-faceted filters: Topic, Difficulty, Company Tag.
  - External links, solved status, and "Add to Study List" feature.

### 8. `features/report/`
- **Readiness & Progress Report**:
  - Overall placement readiness score (0–100%).
  - Roadmap velocity (pace vs. plan), assessment history graph, weak-topic warnings.
  - Export report action (JSON download and printable PDF format).

### 9. `features/notifications/`
- **Notification Center**:
  - Header notification bell with unread count badge.
  - Drawer/popover showing milestone reminders, reassessment due alerts, and roadmap stale notices.
  - Single-click "Mark as Read" and "Mark All as Read".

### 10. `features/admin/`
- **Admin Console**:
  - Platform overview: Active students, assessments taken, roadmap completion rates, most common skill gaps.
  - Question Bank Manager (filter, add, edit, delete questions).
  - Company Requirements Manager (target skill expectations per company).

---

## Verification Plan

### Automated Checks
- `npm run typecheck` (`tsc -b`): Ensure 0 TypeScript compilation errors.
- `npx vite build`: Production build bundle verification.

### Browser Verification
- Start local frontend (`npm run dev`) and test with browser agent:
  1. Open landing page, navigate to Login / Register.
  2. Test Demo Login, verify dashboard displays profile and stats.
  3. Start and complete an Assessment session, verify adaptive questions and results screen.
  4. View Skill Gap radar and generate Roadmap with live SSE streaming animation.
  5. Check weekly roadmap milestone status toggling.
  6. Send a message to AI Placement Coach, verify streaming response.
  7. Browse and filter Practice Resources.
  8. Open Notification drawer and test marking items as read.
  9. View Admin dashboard and verify responsive sidebar layout.

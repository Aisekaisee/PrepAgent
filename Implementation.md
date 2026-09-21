# PrepAgent — Backend Implementation Plan

> **Scope**: Node.js / Express.js (TypeScript) single-service backend  
> **Timeline**: 16 weeks across 6 phases  
> **Architecture**: 5-layer module pattern (Route → Validation → Controller → Service → Repository) + LangGraph.js agent layer  
> **Stack**: PostgreSQL · ChromaDB · LangChain.js · LangGraph.js · Gemini API (primary) / OpenAI (fallback)

---

## Quick Reference — Phase Map

| Phase | Weeks | Theme | Key Deliverables |
|---|---|---|---|
| **1** | 1–2 | Project Foundation | Repo, toolchain, DB, server skeleton, CI |
| **2** | 3–5 | Auth & Profile | Register/login, JWT rotation, profile CRUD |
| **3** | 6–9 | Skill Assessment Engine | Question bank, adaptive sessions, grading |
| **4** | 10–12 | Skill-Gap & Roadmap Agent | Gap analysis, LangGraph.js pipeline, RAG resources |
| **5** | 13–14 | Chat Agent & Resources | SSE chat, RAG chain, conversation memory |
| **6** | 15–16 | Notifications, Admin, Reports & Hardening | Scheduling, admin CRUD, PDF reports, security audit |

---

## Phase 1 — Project Foundation (Weeks 1–2)

### Goals
Stand up a production-ready skeleton: TypeScript strict mode, database connectivity, middleware stack, CI pipeline, and environment configuration — all before a single feature is written. Every subsequent phase builds cleanly on this base.

---

### 1.1 Repository & Toolchain Setup

**Tasks:**
- [ ] Initialize Git repo with `.gitignore` (Node, env files, build artifacts)
- [ ] `npm init` → `tsconfig.json` with `strict: true`, `moduleResolution: "bundler"`, `outDir: dist`
- [ ] Install core dev dependencies:
  ```
  typescript ts-node-dev @types/node
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  prettier eslint-config-prettier
  husky lint-staged
  ```
- [ ] Configure ESLint (`eslint.config.mjs`) with TypeScript rules; Prettier (`.prettierrc`)
- [ ] Set up Husky pre-commit hook → runs `lint-staged` (lint + format check on staged files)
- [ ] Configure Conventional Commits via `commitlint` + Husky `commit-msg` hook
- [ ] Add `npm` scripts: `dev`, `build`, `typecheck`, `lint`, `test`, `test:integration`

**Deliverable:** `git commit` is rejected if lint or commit message format fails.

---

### 1.2 Project Directory Structure

Create the canonical folder layout exactly as specified in PRD §7.1:

```
src/
  modules/
    auth/
    profile/
    assessment/
    skill-gap/
    roadmap/
    resources/
    chat/
    notifications/
    admin/
  agents/
    graphs/
    nodes/
    prompts/
    llm/
  db/
    schema/
    migrations/
    client.ts
  vector/
    chromaClient.ts
  middleware/
    auth.middleware.ts
    error.middleware.ts
    rateLimiter.middleware.ts
    validate.middleware.ts
  config/
    env.ts
  utils/
    AppError.ts
    asyncHandler.ts
    logger.ts
  server.ts
  app.ts
```

---

### 1.3 Environment Configuration

**File: `src/config/env.ts`**
- [ ] Load `.env` via `dotenv`
- [ ] Define a **Zod schema** for all required environment variables:
  ```
  DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
  GEMINI_API_KEY, OPENAI_API_KEY, SENDGRID_API_KEY,
  CHROMA_HOST, PORT, NODE_ENV, CORS_ORIGIN, SENTRY_DSN
  ```
- [ ] `env.ts` parses and exports a typed `env` object; **throws at boot** if any required var is missing
- [ ] `.env.example` committed to repo (no real secrets)

---

### 1.4 Database Setup — PostgreSQL

**File: `src/db/client.ts`**
- [ ] Install `pg`, `@types/pg`, `node-pg-migrate`
- [ ] Create a singleton `Pool` instance exported as `db`
- [ ] Configure `node-pg-migrate` for versioned migration files under `src/db/migrations/`
- [ ] Write **Migration 001** — initial schema (all 11 core entities from PRD §4):

  Key constraints to include:
  - `users.email` — UNIQUE
  - `profiles.user_id` — FK → `users.id` ON DELETE CASCADE
  - `roadmaps` — composite index on `(user_id, status)`
  - `roadmap_items.roadmap_id` — FK → `roadmaps.id`
  - `chat_messages.user_id` — FK → `users.id`

- [ ] `npm run migrate:up` command wired to `node-pg-migrate up`
- [ ] Seed script (`src/db/seed.ts`) with sample questions and company requirements for dev/test

---

### 1.5 ChromaDB Setup

**File: `src/vector/chromaClient.ts`**
- [ ] Install `chromadb` (JS client)
- [ ] Export a singleton ChromaDB client connected to `env.CHROMA_HOST`
- [ ] Create a `resources` collection on first boot (idempotent `getOrCreateCollection`)
- [ ] Health-check function: `pingChroma()` used in server startup

---

### 1.6 Express Application & Core Middleware

**Files: `src/app.ts`, `src/server.ts`**
- [ ] Install: `express`, `helmet`, `cors`, `express-rate-limit`, `express-async-handler`, `pino`, `pino-http`, `@sentry/node`
- [ ] `app.ts` — Express app factory (no `listen` call, pure setup):
  - `helmet()` — secure HTTP headers
  - `cors({ origin: env.CORS_ORIGIN })`
  - `pino-http` request logger with request-id generation
  - `express.json()` body parser
  - Global rate limiter (100 req/min per IP default)
  - Mount all module routers under `/api/v1`
  - 404 handler
  - Centralized error handler (last middleware)
- [ ] `server.ts` — calls `app.ts`, runs DB health check, starts listening

**File: `src/utils/AppError.ts`**
```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly httpStatus: number,
    message: string
  ) { super(message); }
}
```

**File: `src/middleware/error.middleware.ts`**
- [ ] Catches `AppError` → structured JSON `{ error: { code, message } }`
- [ ] Catches unknown errors → 500 with generic message (full error logged, not leaked)

**File: `src/utils/logger.ts`**
- [ ] `pino` instance with `level` from env; exported as `logger`
- [ ] **No `console.log` anywhere in application code**

---

### 1.7 CI Pipeline — GitHub Actions

**File: `.github/workflows/ci.yml`**
- [ ] Triggers on: `push` to `main`, every PR
- [ ] Jobs (sequential on failure):
  1. `lint` — `npm run lint`
  2. `typecheck` — `npm run typecheck`
  3. `test:unit` — `npm test`
  4. `test:integration` — spins up Postgres (service container), runs `npm run test:integration`
- [ ] Merge blocked if any job fails

---

### 1.8 Testing Infrastructure

- [ ] Install: `jest`, `ts-jest`, `supertest`, `@types/supertest`, `@types/jest`
- [ ] `jest.config.ts` — two projects: `unit` (mock everything) and `integration` (real DB)
- [ ] `src/utils/testDb.ts` — test DB helper: truncate tables before each integration test suite

**Phase 1 Acceptance Criteria:**
- [ ] `npm run dev` starts the server without errors; `GET /api/v1/health` returns `200`
- [ ] All DB migrations run cleanly on a fresh Postgres instance
- [ ] ChromaDB collection is created on startup
- [ ] CI pipeline runs green on an empty-feature PR
- [ ] Pre-commit hook rejects a file with a lint error

---

## Phase 2 — Auth & Profile (Weeks 3–5)

### Goals
Implement secure authentication (register, login, token rotation, logout) and full profile CRUD. These are the gating features — nothing else can be built until users can be identified.

---

### 2.1 Auth Module

#### Database (Migration 002)
- [ ] Ensure `users` table has: `id UUID PK DEFAULT gen_random_uuid()`, `email TEXT UNIQUE NOT NULL`, `password_hash TEXT NOT NULL`, `role TEXT NOT NULL DEFAULT 'student'`, `created_at TIMESTAMPTZ DEFAULT now()`
- [ ] `refresh_tokens` table: `id UUID PK`, `user_id FK`, `token_hash TEXT`, `expires_at TIMESTAMPTZ`, `revoked_at TIMESTAMPTZ`

#### Repository — `auth.repository.ts`
- [ ] `findUserByEmail(email)` → `User | null`
- [ ] `createUser(email, passwordHash)` → `User`
- [ ] `saveRefreshToken(userId, tokenHash, expiresAt)` → `RefreshToken`
- [ ] `findRefreshToken(tokenHash)` → `RefreshToken | null`
- [ ] `revokeRefreshToken(tokenHash)` → `void`
- [ ] `revokeAllRefreshTokensForUser(userId)` → `void` (used on logout)

#### Service — `auth.service.ts`
- [ ] Install: `bcrypt`, `@types/bcrypt`, `jsonwebtoken`, `@types/jsonwebtoken`
- [ ] `register(email, password)`:
  - Check duplicate email → throw `AppError('EMAIL_IN_USE', 409)`
  - Hash password: `bcrypt.hash(password, 12)`
  - Create user in DB
  - Issue access + refresh token pair
- [ ] `login(email, password)`:
  - Find user → throw `AppError('INVALID_CREDENTIALS', 401)` if not found or hash mismatch
  - Issue token pair
- [ ] `refreshTokens(incomingRefreshToken)`:
  - Verify JWT signature and expiry
  - Look up token hash in DB — throw `AppError('INVALID_TOKEN', 401)` if revoked or not found
  - Rotate: revoke old token, issue new pair
- [ ] `logout(refreshToken)`: revoke token in DB
- [ ] **Token helper** (private utility):
  - Access token: JWT signed with `JWT_ACCESS_SECRET`, 15-min expiry, payload `{ sub: userId, role }`
  - Refresh token: JWT signed with `JWT_REFRESH_SECRET`, 7-day expiry; only the `bcrypt` hash stored in DB

#### Validation — `auth.validation.ts`
- [ ] `registerSchema`: `{ email: z.string().email(), password: z.string().min(8) }`
- [ ] `loginSchema`: same fields
- [ ] `refreshSchema`: `{ refreshToken: z.string() }`

#### Controller — `auth.controller.ts`
- [ ] `register`, `login`, `refresh`, `logout` — each reads validated `req.body`, calls service, returns `200`/`201` with `{ accessToken, refreshToken }` (or `204` for logout)

#### Routes — `auth.routes.ts`
```
POST /auth/register  → validate(registerSchema) → authController.register
POST /auth/login     → validate(loginSchema)    → authController.login
POST /auth/refresh   → validate(refreshSchema)  → authController.refresh
POST /auth/logout    → authController.logout
```

#### Auth Middleware — `src/middleware/auth.middleware.ts`
- [ ] `authenticate`: extracts `Bearer <token>` from `Authorization` header, verifies JWT, attaches `req.user = { userId, role }` — throws `AppError('UNAUTHORIZED', 401)` on failure
- [ ] `requireRole(role)`: checks `req.user.role` — throws `AppError('FORBIDDEN', 403)` if mismatch

---

### 2.2 Profile Module

#### Database (Migration 003 — if adjustments needed)
- [ ] `profiles` table: `user_id UUID PK FK→users`, `education JSONB`, `programming_skills TEXT[]`, `technical_subjects TEXT[]`, `target_companies TEXT[]`, `timeline_weeks INT`, `updated_at TIMESTAMPTZ`
- [ ] `profile_history` table: `id UUID PK`, `user_id FK`, `snapshot JSONB`, `changed_at TIMESTAMPTZ` (for roadmap re-generation trigger)

#### Repository — `profile.repository.ts`
- [ ] `findByUserId(userId)` → `Profile | null`
- [ ] `upsertProfile(userId, data)` → `Profile`
- [ ] `recordHistory(userId, snapshot)` → `void`

#### Service — `profile.service.ts`
- [ ] `getProfile(userId)` → fetch profile or throw `AppError('PROFILE_NOT_FOUND', 404)`
- [ ] `updateProfile(userId, data)`:
  - Fetch existing profile
  - Save history snapshot before update
  - Upsert new profile
  - Return updated profile (also sets a `roadmap_stale` flag on the user record)

#### Validation — `profile.validation.ts`
```typescript
const profileUpdateSchema = z.object({
  education: z.object({ degree: z.string(), institution: z.string(), year: z.number() }).optional(),
  programmingSkills: z.array(z.string()).optional(),
  technicalSubjects: z.array(z.string()).optional(),
  targetCompanies: z.array(z.string()).optional(),
  timelineWeeks: z.number().int().min(1).max(52).optional(),
});
```

#### Routes — `profile.routes.ts`
```
GET  /profile  → authenticate → profileController.get
PUT  /profile  → authenticate → validate(profileUpdateSchema) → profileController.update
```

---

### 2.3 Phase 2 Tests

**Unit tests:**
- [ ] `auth.service.test.ts` — mock `auth.repository`, test register dupe email, login bad password, token rotation logic
- [ ] `profile.service.test.ts` — mock `profile.repository`, test upsert and history recording

**Integration tests:**
- [ ] `auth.routes.test.ts` — full HTTP round-trip: register → login → refresh → logout via `supertest`
- [ ] `profile.routes.test.ts` — auth-gated: unauthenticated GET returns 401, authenticated PUT persists changes

**Phase 2 Acceptance Criteria:**
- [ ] Register → Login → token refresh cycle works end-to-end
- [ ] Reused or revoked refresh token returns 401
- [ ] Profile update stores a history snapshot
- [ ] All auth routes reject requests missing or with invalid JWT
- [ ] Passwords never appear in logs or response bodies

---

## Phase 3 — Skill Assessment Engine (Weeks 6–9)

### Goals
Build the question bank and adaptive assessment session lifecycle: start, fetch next question (adaptive difficulty), submit answers, auto-grade (MCQ exact-match + LLM-assisted code grading), and persist results.

---

### 3.1 Question Bank

#### Database (Migration 004)
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('coding','aptitude','technical')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  company_tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL,    -- { prompt, options[], codeTemplate?, testCases? }
  answer_key JSONB NOT NULL, -- { correct_option?, expectedOutput?, rubric? }
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX questions_topic_difficulty_idx ON questions(topic, difficulty);
```

#### Seed Data
- [ ] Write `src/db/seeds/questions.seed.ts` with at least 30 sample questions (10 per type) across 5 topics

#### Repository — `assessment.repository.ts`
- [ ] `findQuestionById(id)` → `Question`
- [ ] `findQuestionsByFilters({ topic, difficulty, excludeIds[] })` → `Question[]`
- [ ] `createSession(userId, topic?)` → `AssessmentSession`
- [ ] `findSessionById(id)` → `AssessmentSession | null`
- [ ] `saveAnswer(sessionId, questionId, answer, isCorrect)` → `QuestionAnswer`
- [ ] `getSessionAnswers(sessionId)` → `QuestionAnswer[]`
- [ ] `finalizeSession(sessionId, score, topicBreakdown)` → `AssessmentSession`
- [ ] `listSessionsByUser(userId, pagination)` → paginated `AssessmentSession[]`

#### Database (Migration 005) — Assessment session tables
```sql
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  topic_breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','submitted'))
);

CREATE TABLE question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  student_answer JSONB NOT NULL,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 3.2 Adaptive Question Selection

**`assessment.service.ts` → `getNextQuestion(sessionId, userId)`** logic:
1. Fetch session, verify ownership and `status = 'active'`
2. Fetch all answers so far for this session
3. Compute rolling accuracy over last 5 answers:
   - `accuracy < 0.4` → target `easy`
   - `0.4 ≤ accuracy < 0.75` → target `medium`
   - `accuracy ≥ 0.75` → target `hard`
4. Fetch unused questions for session's topic at computed difficulty
5. Return random selection from available questions
6. If no unused questions at that difficulty, fall back to any unused question

---

### 3.3 Grading System

#### Auto-grading (synchronous) — `src/modules/assessment/grader.ts`
- [ ] `gradeAnswer(question, studentAnswer)` → `{ isCorrect: boolean, feedback?: string }`
- [ ] MCQ / aptitude: exact-match `answer_key.correct_option === studentAnswer.selected`
- [ ] Short-answer technical: normalized string comparison (lowercase, trim)
- [ ] Coding questions: → defer to LLM rubric grader

#### LLM-Assisted Code Grading — `src/agents/nodes/codeGrader.node.ts`
- [ ] Prompt: submit code + problem statement + rubric → Gemini → structured output `{ score: 0-10, feedback: string, isCorrect: boolean }`
- [ ] Zod schema validation on LLM response; one retry on validation failure
- [ ] If LLM grader fails: mark as `is_correct = null` (pending manual review) rather than crashing

---

### 3.4 Assessment Service — Full Lifecycle

**`assessment.service.ts`** methods:

| Method | Description |
|---|---|
| `startSession(userId, topic?)` | Create `AssessmentSession` record, return session id |
| `getNextQuestion(sessionId, userId)` | Adaptive selection as described above |
| `submitAnswer(sessionId, userId, questionId, answer)` | Grade answer, persist `QuestionAnswer`, return `isCorrect` + feedback |
| `finalizeSession(sessionId, userId)` | Compute aggregate score + per-topic breakdown, update session `status='submitted'` |
| `getHistory(userId, pagination)` | Return paginated past sessions with scores |

---

### 3.5 Validation — `assessment.validation.ts`

```typescript
const startSessionSchema = z.object({ topic: z.string().optional() });
const answerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.union([
    z.object({ selectedOption: z.string() }),
    z.object({ code: z.string() }),
    z.object({ text: z.string() }),
  ]),
});
```

---

### 3.6 Routes — `assessment.routes.ts`

```
POST /assessments                    → authenticate → validate(startSessionSchema) → controller.start
GET  /assessments/:id/next-question  → authenticate → controller.nextQuestion
POST /assessments/:id/answer         → authenticate → validate(answerSchema) → controller.answer
POST /assessments/:id/submit         → authenticate → controller.submit
GET  /assessments/history            → authenticate → controller.history
```

Rate limit: `POST /assessments/:id/answer` — 60 req/min per user

---

### 3.7 Phase 3 Tests

**Unit tests:**
- [ ] `grader.test.ts` — MCQ correct/incorrect, edge cases (case sensitivity, whitespace)
- [ ] `assessment.service.test.ts` — mock repo, test adaptive difficulty logic, finalize score computation
- [ ] `codeGrader.node.test.ts` — mock LLM call, test schema validation + retry logic

**Integration tests:**
- [ ] Full session lifecycle: start → 5 answers → submit → verify score in DB
- [ ] Adaptive difficulty: confirm easier questions served after streaks of wrong answers

**Phase 3 Acceptance Criteria:**
- [ ] Full assessment session lifecycle works end-to-end
- [ ] MCQ grading is instant (synchronous)
- [ ] Adaptive difficulty correctly adjusts based on rolling accuracy
- [ ] LLM grader failure results in graceful degradation, not a 500 error
- [ ] Assessment history is paginated correctly

---

## Phase 4 — Skill-Gap Analysis & Roadmap Agent (Weeks 10–12)

### Goals
Implement the gap-analysis computation (student proficiency vs. company requirements) and the full LangGraph.js roadmap generation pipeline with ChromaDB-powered resource recommendations. This is the core AI feature of PrepAgent.

---

### 4.1 Company Requirements & Skill-Gap Module

#### Database (Migration 006)
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE company_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  topic TEXT NOT NULL,
  expected_level TEXT NOT NULL CHECK (expected_level IN ('beginner','intermediate','advanced','expert')),
  UNIQUE(company_id, topic)
);
```

#### Skill-Gap Service — `skill-gap.service.ts`

`computeGap(userId)` algorithm:
1. Fetch user's `profile.targetCompanies`
2. Fetch `CompanyRequirement` rows for those companies
3. Fetch user's latest `AssessmentSession` results → build proficiency vector `{ topic → score }`
4. For each required topic: `gap = expectedLevel - studentProficiency`
5. Rank by gap severity (descending)
6. Return: `{ gaps: [{ topic, required, current, severity, rank }] }`

**Proficiency level mapping:** `beginner=1, intermediate=2, advanced=3, expert=4`

#### Routes — `skill-gap.routes.ts`
```
GET /skill-gap → authenticate → controller.getGap
```

---

### 4.2 LangGraph.js Roadmap Generation Pipeline

#### Dependencies
```
@langchain/core @langchain/google-genai @langchain/openai
langchain langgraph zod
```

#### LLM Provider Abstraction — `src/agents/llm/`

**`types.ts`**
```typescript
export interface LLMProvider {
  generate<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;
}
```

- **`gemini.ts`** — wraps `@langchain/google-genai` with structured output via Zod schema
- **`openai.ts`** — wraps `@langchain/openai` with function calling
- **`index.ts`** — exports `getLLM()` factory: default Gemini, auto-fallback to OpenAI on error/timeout

---

#### Graph State — `src/agents/graphs/roadmap.state.ts`

```typescript
interface RoadmapGraphState {
  userId: string;
  skillProfile: SkillVector | null;
  assessedProfile: SkillVector | null;
  gapList: GapItem[] | null;
  roadmapDraft: RoadmapDraft | null;
  roadmap: FinalRoadmap | null;
  errors: string[];
  retryCount: number;
}
```

---

#### Node Implementations — `src/agents/nodes/`

| Node File | Input | Responsibility | Output |
|---|---|---|---|
| `profileNode.ts` | raw `Profile` | Normalize into typed `SkillVector` | `skillProfile` |
| `skillAssessmentNode.ts` | `skillProfile` + assessment results | Merge assessed proficiency into skill vector | `assessedProfile` |
| `skillGapNode.ts` | `assessedProfile` + company requirements | Compute ranked gap list | `gapList` |
| `roadmapGenerationNode.ts` | `gapList` + timeline + LLM | Prompt LLM for week-by-week plan; Zod validate; retry max 2x | `roadmapDraft` |
| `resourceRecommendationNode.ts` | `roadmapDraft` | Query ChromaDB per topic; populate `resource_refs` | `roadmap` |
| `persistAndReturnNode.ts` | `roadmap` | Write to PostgreSQL (only write node); supersede old versions | — |

**Design rules for all nodes:**
- Every LLM call has a 15s hard timeout with graceful degradation
- Only `persistAndReturnNode` writes to the DB — no partial writes on failure
- Nodes are pure functions over state (LLM and DB calls injected as dependencies for testability)

#### Roadmap Output Schema (Zod)
```typescript
const RoadmapDraftSchema = z.object({
  weeks: z.array(z.object({
    weekNo: z.number(),
    topic: z.string(),
    goals: z.array(z.string()),
    resourceHints: z.array(z.string()),
  }))
});
```

#### Graph Assembly — `src/agents/graphs/roadmap.graph.ts`
```
profile → skillAssessment → skillGap ─(loop-back)→ skillAssessment
                                     ─(continue)→ roadmapGeneration
                                                  → resourceRecommendation
                                                  → persistAndReturn
```

---

#### Database (Migration 007) — Roadmap & Resources tables
```sql
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','superseded')),
  source TEXT NOT NULL DEFAULT 'ai_generated',
  weeks JSONB NOT NULL
);

CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  week_no INT NOT NULL,
  topic TEXT NOT NULL,
  goals TEXT[] DEFAULT '{}',
  resource_refs UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','started','completed','skipped')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('problem','article','question')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  company_tags TEXT[] DEFAULT '{}',
  title TEXT NOT NULL,
  url TEXT,
  content TEXT,
  embedding_id TEXT,  -- ChromaDB document ID
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

#### Roadmap Service — `roadmap.service.ts`

| Method | Description |
|---|---|
| `generateRoadmap(userId, progressCallback)` | Invoke graph, stream progress events, return final `Roadmap` |
| `getActiveRoadmap(userId)` | Fetch active roadmap + items + resources |
| `getRoadmapHistory(userId)` | Paginated list of past roadmap versions |
| `updateItemStatus(userId, itemId, status)` | Update `roadmap_items.status`; verify ownership |

#### Routes — `roadmap.routes.ts`
```
POST  /roadmap/generate      → authenticate → controller.generate       (SSE)
GET   /roadmap               → authenticate → controller.getActive
GET   /roadmap/history       → authenticate → controller.getHistory
PATCH /roadmap/items/:id     → authenticate → validate(itemStatusSchema) → controller.updateItem
```
Rate limit: `POST /roadmap/generate` — 5 req/hour per user

---

#### Resource Ingestion Script — `src/scripts/ingestResources.ts`
- [ ] Reads resources from a JSON/CSV file
- [ ] Embeds each resource's content via Gemini embeddings API
- [ ] Upserts into ChromaDB with metadata `{ topic, difficulty, company_tags, resource_id }`
- [ ] Inserts/updates `resources` table in PostgreSQL
- [ ] Run: `npm run ingest:resources -- --file=resources.json`

---

### 4.3 Phase 4 Tests

**Unit tests (each node with mocked LLM and DB):**
- [ ] `profileNode.test.ts` — input normalization edge cases
- [ ] `skillGapNode.test.ts` — gap computation math, ranking correctness
- [ ] `roadmapGenerationNode.test.ts` — Zod retry logic, timeout behavior
- [ ] `resourceRecommendationNode.test.ts` — mock ChromaDB client

**Integration / E2E tests:**
- [ ] `roadmap.graph.test.ts` — full graph run, mocked LLM + real test DB; verify versioning
- [ ] `roadmap.routes.test.ts` — SSE endpoint; verify `text/event-stream` and final roadmap event

**Phase 4 Acceptance Criteria:**
- [ ] `POST /roadmap/generate` streams progress events and returns a valid roadmap via SSE
- [ ] Roadmap versioning: regenerating creates new version, old becomes `superseded`
- [ ] LLM output schema validation enforced — malformed output triggers retry, not a crash
- [ ] Resources associated with roadmap items via ChromaDB retrieval
- [ ] `GET /skill-gap` returns ranked weak topics for the current user

---

## Phase 5 — Chat Agent & Resources API (Weeks 13–14)

### Goals
Build the placement-coach chat agent (SSE-streamed, RAG-powered) and the resources filter endpoint. By end of this phase, the core AI feature set is complete.

---

### 5.1 Chat Agent

#### Database (Migration 008)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','agent')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX chat_messages_user_created_idx ON chat_messages(user_id, created_at DESC);
```

#### Chat Graph — `src/agents/graphs/chat.graph.ts`
Single-node RAG chain (lighter than roadmap graph):

1. **Retrieve** — query ChromaDB with current message + profile context → top-5 chunks
2. **Construct Prompt** — system instructions + student profile summary + last N chat messages (default N=10) + retrieved chunks + current message
3. **Stream LLM** — call Gemini (streaming mode) → forward tokens via SSE
4. **Persist** — save user message + agent response to `chat_messages`

**Conversation Memory:**
- Pass last 10 messages as context (configurable)
- If conversation > 20 messages: summarize older messages via one LLM call; use as rolling context

#### Chat Service — `chat.service.ts`
- [ ] `sendMessage(userId, message, sseCallback)`: persist user message → run RAG chain (stream via callback) → persist agent response
- [ ] `getHistory(userId, pagination)` → paginated `ChatMessage[]` (newest first)

#### SSE Streaming Implementation
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"token","content":"..."}
data: {"type":"done","source":"ai_generated"}
data: {"type":"error","code":"..."}
: ping  (every 15s, prevents proxy timeouts)
```

#### Routes — `chat.routes.ts`
```
POST /chat/message   → authenticate → validate(chatMessageSchema) → controller.send  (SSE)
GET  /chat/history   → authenticate → controller.history
```
Rate limit: `POST /chat/message` — 20 req/hour per user

---

### 5.2 Resources API

#### Repository — `resources.repository.ts`
- [ ] `findResources({ topic?, difficulty?, companyTag?, page, limit })` → paginated `Resource[]`
- [ ] `findResourcesByIds(ids[])` → `Resource[]`

#### Routes — `resources.routes.ts`
```
GET /resources → authenticate → validate(resourceFilterSchema) → controller.list
```
Query params: `?topic=&difficulty=&company=&page=&limit=`

---

### 5.3 Phase 5 Tests

**Unit tests:**
- [ ] `chat.service.test.ts` — mock ChromaDB, mock LLM streaming; verify message persistence
- [ ] Memory management: verify summarization triggers after threshold

**Integration tests:**
- [ ] `chat.routes.test.ts` — SSE round-trip; verify streaming events
- [ ] `resources.routes.test.ts` — filter by topic/difficulty/company; pagination

**Phase 5 Acceptance Criteria:**
- [ ] Chat endpoint streams tokens in real time via SSE
- [ ] Chat context correctly includes profile summary + RAG chunks + recent history
- [ ] Conversation history persisted and retrievable with pagination
- [ ] Resource filter endpoint returns correctly filtered, paginated results
- [ ] All AI-generated content labeled `source: "ai_generated"` in responses

---

## Phase 6 — Notifications, Admin, Reports & Hardening (Weeks 15–16)

### Goals
Complete notifications, admin CRUD, and progress reports. Then perform a comprehensive security audit, performance profiling, and final CI hardening.

---

### 6.1 Notifications Module

#### Database (Migration 009)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'milestone_reminder', 'reassessment_due', 'roadmap_stale'
  payload JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Notification Service — `notifications.service.ts`
- [ ] `listNotifications(userId, pagination)` → paginated list (unread first)
- [ ] `markRead(userId, notificationId)` → update `read_at`
- [ ] `createNotification(userId, type, payload)` → internal method for scheduler

#### Scheduler — `src/utils/scheduler.ts`
- [ ] Install `node-cron`
- [ ] **Job 1** — Daily at 08:00: scan users with active roadmaps where `updated_at < 3 days` → create `milestone_reminder`
- [ ] **Job 2** — Weekly: scan users with last assessment > 14 days ago → create `reassessment_due`
- [ ] **Job 3** — On profile update (event-driven): create `roadmap_stale` notification

#### Email Dispatch — `src/utils/emailService.ts`
- [ ] Install `@sendgrid/mail` or `nodemailer`
- [ ] `sendEmail(to, subject, htmlBody)` wrapper; sends for `reassessment_due` and `roadmap_stale` types

#### Routes — `notifications.routes.ts`
```
GET   /notifications          → authenticate → controller.list
PATCH /notifications/:id/read  → authenticate → controller.markRead
```

---

### 6.2 Admin Module

All routes: `authenticate + requireRole('admin')`.

#### Database (Migration 010)
```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

#### Admin Service — `admin.service.ts`
- [ ] **Questions CRUD**: `createQuestion`, `updateQuestion`, `deleteQuestion` — delegates to assessment repo + logs audit
- [ ] **Resources CRUD**: `createResource`, `updateResource`, `deleteResource` — also updates ChromaDB embedding
- [ ] **Company Requirements CRUD**: `createCompanyReq`, `updateCompanyReq`, `deleteCompanyReq`
- [ ] **Analytics** `getAnalytics()`:
  - Active students (last 7 days)
  - Total assessments taken
  - Average roadmap completion rate
  - Most common skill gaps

#### Routes — `admin.routes.ts`
```
POST/PUT/DELETE  /admin/questions             → controller.*Question
POST/PUT/DELETE  /admin/resources             → controller.*Resource
POST/PUT/DELETE  /admin/company-requirements  → controller.*CompanyReq
GET              /admin/analytics             → controller.getAnalytics
```

---

### 6.3 Reports Module

#### Reports Service — `reports.service.ts`
- [ ] Install `pdfkit` or `pdf-lib`
- [ ] `generateProgressReport(userId, format: 'pdf'|'json')`:
  - Fetch active roadmap + completion stats
  - Fetch assessment history (last 3 sessions)
  - Compute: % topics completed, pace vs. plan
- [ ] `generateSkillGapReport(userId, format: 'pdf'|'json')`:
  - Run `skill-gap.service.computeGap(userId)`
  - Format ranked gap table

#### Routes — `reports.routes.ts`
```
GET /reports/progress   → authenticate → controller.progressReport   (?format=pdf|json)
GET /reports/skill-gap  → authenticate → controller.skillGapReport   (?format=pdf|json)
```

---

### 6.4 OpenAPI Documentation

- [ ] Install `swagger-ui-express`, `swagger-jsdoc`
- [ ] Annotate all route files with JSDoc `@openapi` comments
- [ ] Generate `openapi.json`: `npm run docs:generate`
- [ ] Serve Swagger UI at `/api/v1/docs` in `development` and `staging` only
- [ ] CI check: `npm run docs:check` fails if spec is out of sync

---

### 6.5 Security Hardening

- [ ] Run `npm audit` — resolve all high/critical vulnerabilities
- [ ] Review all Zod validation schemas for missing fields or injection vectors
- [ ] Confirm admin routes blocked for `role !== 'admin'` via integration test
- [ ] Audit LLM prompt templates for prompt injection — sanitize user-controlled content before injecting into prompts
- [ ] Confirm `Authorization` header is never logged at any log level
- [ ] Test refresh token revocation — reuse must return 401
- [ ] Add `express-rate-limit` metrics logging — alert on repeated limit hits

---

### 6.6 Performance Profiling

- [ ] Profile `GET /roadmap` with populated DB — ensure < 300ms p95
- [ ] Add in-memory LRU cache (5-min TTL) for repeated ChromaDB topic queries
- [ ] Ensure SSE connections are cleaned up on client disconnect (no memory leaks)
- [ ] Run `EXPLAIN ANALYZE` on N slowest Postgres queries; add indexes as needed

---

### 6.7 Final CI & Deployment Hardening

- [ ] Add Sentry error tracking — confirm source maps uploaded
- [ ] **Docker**: multi-stage `Dockerfile` (build → production) + `docker-compose.yml` (app + postgres + chroma)
- [ ] `.env.staging` and `.env.production` templates committed (no real secrets)
- [ ] CI adds: `docker build` step + `npm audit --audit-level=high` (fails on high severity)
- [ ] `README.md` updated with setup, env vars, and run instructions

---

### 6.8 Phase 6 Tests

**Unit tests:**
- [ ] `notifications.service.test.ts` — scheduler logic, notification creation
- [ ] `admin.service.test.ts` — CRUD operations + audit log recording
- [ ] `reports.service.test.ts` — progress computation, gap report formatting

**Integration tests:**
- [ ] Admin role gate: confirm `403` for student role on all admin routes
- [ ] Full notification lifecycle: create → list → mark read
- [ ] Report generation: `GET /reports/progress?format=json` returns valid schema

**Phase 6 Acceptance Criteria:**
- [ ] Scheduler jobs run on cron schedule and produce notifications
- [ ] Admin CRUD operations are audit-logged
- [ ] Reports generated in both JSON and PDF formats
- [ ] `npm audit` passes with no high/critical vulnerabilities
- [ ] Docker container builds and runs with all env vars set
- [ ] CI pipeline fully green end-to-end

---

## Cross-Cutting Concerns (All Phases)

### Error Handling Convention
Every service throws typed `AppError` instances; controllers translate via centralized error middleware. No raw `Error` escapes the service layer.

```typescript
// Service throws:
throw new AppError('RESOURCE_NOT_FOUND', 404, 'Roadmap item not found');

// HTTP response:
{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "Roadmap item not found" } }
```

### Logging Convention
- **Request level**: `pino-http` — `requestId`, `method`, `url`, `statusCode`, `responseTime`
- **Application level**: `logger.info/warn/error` with structured context
- **Never log**: passwords, JWT tokens, API keys, raw LLM prompts with user data

### Rate Limiting Summary

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 10 req/min per IP |
| `POST /auth/register` | 5 req/min per IP |
| `POST /assessments/:id/answer` | 60 req/min per user |
| `POST /roadmap/generate` | 5 req/hour per user |
| `POST /chat/message` | 20 req/hour per user |
| All other routes | 100 req/min per IP (global) |

### Migration Versioning

| Migration | Contents |
|---|---|
| `001_initial_schema` | users, profiles, base tables |
| `002_refresh_tokens` | refresh_tokens table |
| `003_profile_history` | profile_history table |
| `004_questions` | questions table + indexes |
| `005_assessment_sessions` | assessment_sessions, question_answers |
| `006_company_requirements` | companies, company_requirements |
| `007_roadmap_resources` | roadmaps, roadmap_items, resources |
| `008_chat_messages` | chat_messages |
| `009_notifications` | notifications |
| `010_admin_audit` | admin_audit_logs |

---

## Delivery Timeline Summary

| Milestone | End of Week | Feature Gate |
|---|---|---|
| Server boots | 2 | Health check, DB connected, CI green |
| Auth live | 5 | Register/login/token rotation working |
| Assessment MVP | 9 | Full adaptive session + grading |
| Roadmap agent live | 12 | SSE roadmap generation, gap analysis |
| Chat agent live | 14 | Streaming chat, RAG context |
| Production-ready | 16 | All features, security audit, Docker |

```
Weeks 1-2:   [████░░░░░░░░░░░░]  Phase 1: Foundation
Weeks 3-5:   [░░░██████░░░░░░░]  Phase 2: Auth & Profile
Weeks 6-9:   [░░░░░░░████████░]  Phase 3: Assessment Engine
Weeks 10-12: [████░░░░░░░░░░░░]  Phase 4: Skill-Gap & Roadmap Agent
Weeks 13-14: [░░░░████░░░░░░░░]  Phase 5: Chat & Resources
Weeks 15-16: [░░░░░░░░░░░░████]  Phase 6: Notifications, Admin, Hardening
```

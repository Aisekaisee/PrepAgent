# PrepAgent — Demo Guide for Judges

> **The Story of Arjun:** A student who stopped studying blindly and started preparing intelligently.

---

## Before You Begin

Make sure the following are running:

```bash
# Terminal 1 — PostgreSQL (or via Docker)
# Terminal 2 — ChromaDB
docker run -p 8000:8000 chromadb/chroma

# Terminal 3 — PrepAgent backend
cd backend
npm run migrate:up     # Run once to set up all 7 migrations + seed company data
npm run dev            # Server starts on port 5000
```

Confirm the server is alive:
```bash
curl http://localhost:5000/api/v1/health
# → { "status": "ok", "message": "api is running" }
```

> Set the `BASE_URL` variable in your terminal for convenience:
> ```bash
> BASE_URL=http://localhost:5000/api/v1
> ```

---

## Act 1 — Arjun Signs Up

Arjun is a final-year CS student. He wants to crack a placement at Google or Amazon. He's been studying random topics for weeks, but has no idea if he's actually ready, or what gaps he needs to close. He signs up for PrepAgent.

### Step 1.1 — Register

```bash
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arjun@example.com",
    "password": "securePass123"
  }'
```

**Expected response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

> **What just happened?** The system hashed Arjun's password with `bcrypt` (cost factor 12), created his account, and issued a short-lived **15-minute access token** + a **7-day refresh token** stored as a hash in the database. His raw password never touches a log or a response body.

Save the tokens:
```bash
ACCESS_TOKEN="<paste accessToken here>"
REFRESH_TOKEN="<paste refreshToken here>"
```

---

### Step 1.2 — Build his Profile

Arjun tells PrepAgent about himself — what he knows, how long he has, and where he wants to work.

```bash
curl -s -X PUT $BASE_URL/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "education": {
      "degree": "B.Tech Computer Science",
      "institution": "VIT University",
      "year": 2025
    },
    "programmingSkills": ["Python", "JavaScript", "C++"],
    "technicalSubjects": ["data-structures", "algorithms", "databases", "operating-systems"],
    "targetCompanies": ["Google", "Amazon"],
    "timelineWeeks": 12
  }'
```

**Expected response:**
```json
{
  "user_id": "...",
  "programming_skills": ["Python", "JavaScript", "C++"],
  "technical_subjects": ["data-structures", "algorithms", "databases", "operating-systems"],
  "target_companies": ["Google", "Amazon"],
  "timeline_weeks": 12
}
```

> **What just happened?** PrepAgent saved his profile and also captured a **history snapshot** — so if he updates his profile later (changes target companies, extends timeline), the system detects the change and knows his roadmap needs regeneration.

Verify his profile:
```bash
curl -s $BASE_URL/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Act 2 — The Assessment: How Good is Arjun, Really?

Before PrepAgent can build a roadmap, it needs to understand where Arjun actually stands — not just what he *thinks* he knows. It puts him through an adaptive assessment.

### Step 2.1 — Start a Session

```bash
curl -s -X POST $BASE_URL/assessments \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "topic": "data-structures" }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "sess_abc123",
    "userId": "...",
    "topic": "data-structures",
    "status": "active",
    "startedAt": "2026-09-23T10:00:00Z"
  }
}
```

```bash
SESSION_ID="<paste session id here>"
```

---

### Step 2.2 — Answer Questions Adaptively

The system doesn't throw random questions at Arjun. It starts at **medium difficulty** and adapts based on his rolling accuracy.

**Get the first question:**
```bash
curl -s $BASE_URL/assessments/$SESSION_ID/next-question \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "q_001",
    "type": "aptitude",
    "topic": "data-structures",
    "difficulty": "medium",
    "content": {
      "prompt": "What is the time complexity of inserting into a max-heap?",
      "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"]
    }
  }
}
```

> Notice: the `answerKey` is **never included** in the response. It is stripped server-side before leaving the service layer.

**Submit an answer:**
```bash
curl -s -X POST $BASE_URL/assessments/$SESSION_ID/answer \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q_001",
    "answer": { "selectedOption": "O(log n)" }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "answerId": "...",
    "isCorrect": true,
    "feedback": null
  }
}
```

> **What just happened?** The answer was graded **synchronously** (MCQ exact-match). For coding questions, the system defers to the **LLM-assisted rubric grader** (`codeGrader.node.ts`) which uses Gemini. If Gemini fails, the answer is marked `is_correct: null` for manual review — the API never crashes.

**Show the adaptive difficulty:** Answer 3–4 questions incorrectly, then call `next-question` again. The system's rolling accuracy window (last 5 answers) will shift it to **easy** questions.

---

### Step 2.3 — Submit the Session

```bash
curl -s -X POST $BASE_URL/assessments/$SESSION_ID/submit \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "sess_abc123",
    "score": 72.50,
    "topicBreakdown": {
      "data-structures": { "total": 8, "correct": 6 }
    },
    "status": "submitted"
  }
}
```

> The `score` is a percentage. The `topicBreakdown` JSONB field drives everything that comes next — this is the proficiency signal that feeds the AI pipeline.

---

## Act 3 — The Intelligence Kicks In: Skill Gap Analysis

Now that Arjun has an assessment score, PrepAgent can compare his proficiency against what **Google and Amazon actually require**.

### Step 3.1 — Get the Skill Gap

```bash
curl -s $BASE_URL/skill-gap \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected response:**
```json
{
  "targetCompanies": ["Google", "Amazon"],
  "computedAt": "2026-09-23T10:15:00Z",
  "gaps": [
    {
      "rank": 1,
      "topic": "algorithms",
      "required": "expert",
      "requiredScore": 4,
      "current": "none",
      "currentScore": 0,
      "severity": 4
    },
    {
      "rank": 2,
      "topic": "system-design",
      "required": "advanced",
      "requiredScore": 3,
      "current": "none",
      "currentScore": 0,
      "severity": 3
    },
    {
      "rank": 3,
      "topic": "data-structures",
      "required": "expert",
      "requiredScore": 4,
      "current": "intermediate",
      "currentScore": 2,
      "severity": 2
    },
    {
      "rank": 4,
      "topic": "databases",
      "required": "intermediate",
      "requiredScore": 2,
      "current": "intermediate",
      "currentScore": 2,
      "severity": 0
    }
  ]
}
```

> **What just happened?** The system queried the seeded `company_requirements` table (which was populated automatically during `migrate:up` with real requirements for Google, Amazon, Microsoft, Meta, Flipkart, and Adobe), compared them against Arjun's assessment `topicBreakdown`, and ranked every topic gap by severity. Arjun can now see, with a number, exactly how far behind he is on each topic — and in what order to attack them.

---

## Act 4 — The Roadmap Agent: AI Builds His Plan

This is the centrepiece of PrepAgent. A 6-node **LangGraph.js** pipeline runs to produce a personalized, week-by-week study plan — streamed live to the caller via **Server-Sent Events (SSE)**.

### Step 4.1 — Generate the Roadmap

Open a new terminal tab. This call streams — keep watching it:

```bash
curl -s -N -X POST $BASE_URL/roadmap/generate \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: text/event-stream"
```

**You will see events appear one by one in real time:**
```
data: {"type":"progress","node":"profileNode","message":"Analyzing your profile..."}

data: {"type":"progress","node":"assessedProfile","message":"Profile analyzed ✓"}

data: {"type":"progress","node":"assessedProfile","message":"Assessment data merged ✓"}

data: {"type":"progress","node":"gapList","message":"Skill gaps computed ✓"}

data: {"type":"progress","node":"roadmapDraft","message":"Roadmap structure generated ✓"}

data: {"type":"progress","node":"roadmap","message":"Resources matched ✓"}

data: {"type":"progress","node":"persistAndReturnNode","message":"Roadmap saved ✓"}

data: {"type":"done","source":"ai_generated","roadmap":{
  "id": "rm_xyz789",
  "version": 1,
  "status": "active",
  "weeks": [...]
}}
```

> **What just happened, step by step:**
>
> 1. **Profile Node** — Normalised Arjun's programming skills and subjects into a typed skill vector (1–4 scale).
> 2. **Skill Assessment Node** — Merged his assessment scores, overriding the profile baselines with actual measured proficiency.
> 3. **Skill Gap Node** — Computed the ranked gap list against Google + Amazon requirements.
> 4. **Roadmap Generation Node** — Called **Gemini 1.5-flash** with the gap list and a 12-week timeline. Validated the output against a strict **Zod schema**. Would retry up to 2× if the schema failed. Would fall back to **OpenAI** if Gemini timed out (15s limit). Would degrade gracefully to a topic-list roadmap rather than crash the request.
> 5. **Resource Recommendation Node** — For each week's topic, queried **ChromaDB** (vector store) to find the top-3 semantically matching resources and resolved their PostgreSQL UUIDs.
> 6. **Persist & Return Node** — The **only write node**: ran a single database transaction that marked any previous roadmap as `superseded` and inserted the new roadmap + all week items atomically. Zero partial writes on failure.

---

### Step 4.2 — View the Active Roadmap

```bash
curl -s $BASE_URL/roadmap \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected response (truncated):**
```json
{
  "source": "ai_generated",
  "roadmap": {
    "id": "rm_xyz789",
    "version": 1,
    "status": "active"
  },
  "items": [
    {
      "id": "item_001",
      "weekNo": 1,
      "topic": "algorithms",
      "goals": [
        "Understand Big-O analysis deeply",
        "Master sorting algorithms: merge sort, quicksort, heap sort",
        "Solve 10 LeetCode medium sorting problems"
      ],
      "resourceRefs": [],
      "status": "pending"
    },
    {
      "id": "item_002",
      "weekNo": 2,
      "topic": "data-structures",
      "goals": [
        "Deep-dive into trees and graphs",
        "Implement BFS, DFS from scratch",
        "Solve 15 LeetCode problems: trees, graphs"
      ],
      "status": "pending"
    }
  ]
}
```

---

### Step 4.3 — Arjun Completes Week 1

```bash
curl -s -X PATCH $BASE_URL/roadmap/items/item_001 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "completed" }'
```

**Expected response:**
```json
{
  "id": "item_001",
  "weekNo": 1,
  "topic": "algorithms",
  "status": "completed",
  "updatedAt": "2026-09-23T14:00:00Z"
}
```

---

### Step 4.4 — Roadmap Versioning (Regenerate after Profile Update)

Three weeks in, Arjun decides to also add **Microsoft** as a target company and drop his timeline to 8 weeks. He updates his profile — the system captures the change in `profile_history`. He regenerates:

```bash
curl -s -X PUT $BASE_URL/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetCompanies": ["Google", "Amazon", "Microsoft"],
    "timelineWeeks": 8
  }'

# Then regenerate:
curl -s -N -X POST $BASE_URL/roadmap/generate \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: text/event-stream"
```

The old roadmap is automatically marked `status: "superseded"`. A new `version: 2` roadmap is created.

View the version history:
```bash
curl -s $BASE_URL/roadmap/history \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "data": [
    { "version": 2, "status": "active",     "generatedAt": "2026-09-23T15:00:00Z" },
    { "version": 1, "status": "superseded", "generatedAt": "2026-09-23T10:30:00Z" }
  ]
}
```

---

## Act 5 — Browse Learning Resources

PrepAgent's vector store holds curated resources. Arjun can browse them filtered by topic, difficulty, or company.

```bash
# All hard algorithm resources tagged for Google
curl -s "$BASE_URL/resources?topic=algorithms&difficulty=hard&company=Google" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "data": [
    {
      "id": "res_001",
      "type": "problem",
      "topic": "algorithms",
      "difficulty": "hard",
      "companyTags": ["Google", "Meta"],
      "title": "Median of Two Sorted Arrays",
      "url": "https://leetcode.com/problems/median-of-two-sorted-arrays/"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

---

## Act 6 — Security & Robustness (Show the Judges the Engineering)

These are the things you demonstrate to make the judges nod.

### 6.1 — JWT is Short-Lived and Rotatable

```bash
# 15 minutes after login, the access token expires.
# Silently refresh without re-authenticating:
curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{ \"refreshToken\": \"$REFRESH_TOKEN\" }"
```

New token pair returned. Old refresh token is **revoked** in the database.

### 6.2 — Revoked Token is Rejected

```bash
# Try reusing the OLD refresh token:
curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{ \"refreshToken\": \"$REFRESH_TOKEN\" }"
```

```json
{ "error": { "code": "INVALID_TOKEN", "message": "Refresh token has been revoked" } }
```

### 6.3 — Unauthenticated Requests are Blocked

```bash
curl -s $BASE_URL/roadmap
```
```json
{ "error": { "code": "UNAUTHORIZED", "message": "No token provided" } }
```

### 6.4 — Input Validation Rejects Bad Data

```bash
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "not-an-email", "password": "short" }'
```
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### 6.5 — Rate Limiting Protects the AI Endpoints

```bash
# Call /roadmap/generate 6 times in an hour
# The 6th call returns:
```
```json
{ "error": { "code": "RATE_LIMITED", "message": "Maximum 5 roadmap generations per hour" } }
```

### 6.6 — Unknown Routes Return a Clean 404

```bash
curl -s $BASE_URL/some-random-path
```
```json
{ "error": { "code": "NOT_FOUND", "message": "Route not found" } }
```

---

## Full API Reference (Quick Cheatsheet)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create account → token pair |
| `POST` | `/auth/login` | ❌ | Login → token pair |
| `POST` | `/auth/refresh` | ❌ | Rotate access token |
| `POST` | `/auth/logout` | ❌ | Revoke refresh token |
| `GET` | `/profile` | ✅ | Get profile |
| `PUT` | `/profile` | ✅ | Update profile |
| `POST` | `/assessments` | ✅ | Start assessment session |
| `GET` | `/assessments/:id/next-question` | ✅ | Get next adaptive question |
| `POST` | `/assessments/:id/answer` | ✅ | Submit answer (graded instantly) |
| `POST` | `/assessments/:id/submit` | ✅ | Finalize session → score |
| `GET` | `/assessments/history` | ✅ | Past sessions + scores |
| `GET` | `/skill-gap` | ✅ | Ranked gap list vs. target companies |
| `POST` | `/roadmap/generate` | ✅ | **SSE** — AI pipeline → roadmap |
| `GET` | `/roadmap` | ✅ | Active roadmap + items |
| `GET` | `/roadmap/history` | ✅ | All roadmap versions |
| `PATCH` | `/roadmap/items/:id` | ✅ | Update item status |
| `GET` | `/resources` | ✅ | Filter resources by topic/difficulty/company |
| `GET` | `/api/v1/health` | ❌ | Health check |

---

## The Story in One Paragraph (for your verbal pitch)

> *Arjun signed up, told PrepAgent his skills and his dream companies. The system immediately knew — based on real requirements seeded from Google and Amazon — that his biggest gap was algorithms at the expert level. He took an adaptive assessment that pushed him with harder questions when he was right and eased off when he struggled. The moment he submitted, a 6-node AI pipeline powered by Gemini streamed a 12-week, week-by-week roadmap to his screen in real time. Every week was ranked by how badly he needed it. The roadmap knew not to block on a failed LLM call — if Gemini didn't respond in 15 seconds, it fell back to OpenAI, and if that failed too, it degraded gracefully to a basic topic list rather than crashing his request. Every token was validated, every route was protected, and every database write was transactional. This is not a tutorial project — this is a production-grade AI backend.*

---

## Architecture Highlight (for the technical judges)

```
Client
  │
  ▼
Express (Helmet · CORS · Rate Limiting · Pino logging)
  │
  ├── Route → Validation (Zod) → Controller → Service → Repository
  │                                               │
  │                                    ┌──────────▼──────────┐
  │                                    │  LangGraph Pipeline  │
  │                                    │  profileNode         │
  │                                    │  skillAssessmentNode │
  │                                    │  skillGapNode        │
  │                                    │  roadmapGenNode      │──► Gemini / OpenAI
  │                                    │  resourceRecNode     │──► ChromaDB
  │                                    │  persistReturnNode   │──► PostgreSQL (tx)
  │                                    └──────────────────────┘
  │
  ├── PostgreSQL  (auth · profiles · assessments · roadmaps · resources)
  └── ChromaDB    (resource embeddings — semantic search)
```

> **Tech Stack:** Node.js · TypeScript (strict) · Express 5 · PostgreSQL · ChromaDB · LangChain.js · LangGraph.js · Gemini API · OpenAI API · Zod · bcrypt · JWT · Pino

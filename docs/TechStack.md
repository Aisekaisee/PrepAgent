# PrepAgent — Final Tech Stack
 
*Agentic Placement Preparation Coach*
 
## Frontend
 
| Layer | Choice |
|---|---|
| Framework | React.js (Vite build tooling) |
| Styling | Tailwind CSS + shared design tokens |
| Server-state | TanStack Query |
| Local/UI state | Zustand + React Context (auth/session) |
| Charts | Recharts (skill-gap radar, progress bars) |
| Forms | React Hook Form + Zod validation |
| Routing | React Router |
 
## Backend
 
| Layer | Choice |
|---|---|
| API server (single service) | Node.js / Express.js (TypeScript) |
| AI/agent layer | LangChain.js + LangGraph.js, running in the same Express service |
| Relational database | PostgreSQL |
| Vector/knowledge store | ChromaDB (JS client) |
| LLM providers | Google Gemini API (primary), OpenAI API (fallback) |
| PDF processing | pdf-parse / pdf-lib (resource ingestion) |
| Email/notifications | SMTP / SendGrid |
| Auth | JWT-based sessions, bcrypt password hashing |
| Version control / CI | Git & GitHub |
# DocWise — AI-Powered Document Q&A Platform

> Upload any PDF or document. Ask questions in plain English. Get accurate, cited answers instantly.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is DocWise?

DocWise is a multi-tenant SaaS platform that lets users upload PDF/DOCX documents and interact with them through a conversational AI chatbot. Built on **Retrieval-Augmented Generation (RAG)** architecture, every answer is grounded in your actual documents — not hallucinated.

**Target users:** Legal teams, HR departments, researchers, support teams, students — anyone who reads documents.

---

## Key Features

| Feature | Description |
|---|---|
| Document upload | PDF, DOCX, TXT support with drag-and-drop |
| AI chat | Ask questions, get cited answers with streaming |
| Multi-doc QA | Query across multiple documents simultaneously |
| Source citations | Every answer shows the exact chunk + page |
| Chat history | Persistent conversation threads |
| Multi-tenant | Complete data isolation per user |
| Admin dashboard | User management, analytics, billing oversight |
| API access | REST API for Pro/Enterprise users |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Zustand |
| Backend | Node.js, Fastify, Prisma |
| LLM | Claude claude-sonnet-4-6 (Anthropic) |
| Embeddings | text-embedding-3-small (OpenAI) |
| Vector DB | Pinecone (namespaced per tenant) |
| Database | PostgreSQL |
| Cache | Redis (Upstash) |
| File Storage | Cloudflare R2 / AWS S3 |
| Auth | JWT + bcrypt |
| Billing | Stripe |
| Email | Resend |
| Deploy | Railway / Render |

---

## Quick Start (Local Development)

```bash
# 1. Clone
git clone https://github.com/yourusername/docwise.git
cd docwise

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Fill in your API keys (see ARCHITECTURE.md for details)

# 4. Setup database
cd backend
npx prisma migrate dev
npx prisma db seed

# 5. Run both servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

Visit `http://localhost:3000` — backend runs on `http://localhost:4000`

---

## Project Structure

```
docwise/
├── frontend/          # Next.js 14 app
├── backend/           # Fastify API server
├── evals/             # Accuracy evaluation scripts
├── docs/              # All documentation
│   ├── ARCHITECTURE.md
│   ├── CONTEXT.md
│   ├── PROMPT.md
│   ├── TASK.md
│   └── NOTES.md
└── .github/
    └── workflows/     # CI/CD pipelines
```

---

## Documentation

| File | Purpose |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, infrastructure |
| [CONTEXT.md](docs/CONTEXT.md) | Business logic, RAG pipeline explanation |
| [PROMPT.md](docs/PROMPT.md) | AI prompt engineering guide |
| [TASK.md](docs/TASK.md) | Development task list for AI coding assistants |
| [NOTES.md](docs/NOTES.md) | Dev notes, decisions, gotchas |

---

## Development Plan

See [TASK.md](docs/TASK.md) for the full 30-day sprint plan.

---

## License

MIT — see [LICENSE](LICENSE)

# DocWise — AI-Powered Document Intelligence Platform

> **Transform your documents into interactive knowledge.** Upload PDFs, ask questions, and get precise, cited answers powered by RAG technology.

DocWise is a premium SaaS platform built for researchers, legal teams, and businesses. It solves the "needle in the haystack" problem by allowing you to chat with your document library using advanced Retrieval-Augmented Generation (RAG).

---

## ✨ Key Features

### 🧠 Intelligent RAG Pipeline
-   **Context-Aware Chat**: Claude Sonnet 4 (claude-sonnet-4-20250514) integrated for high-quality, human-like reasoning.
-   **Source Citations**: Every answer includes clickable excerpts from the original documents to prevent hallucinations.
-   **Multi-Document Analysis**: Select multiple files in the sidebar to query across your entire knowledge base simultaneously.
-   **Semantic Search**: Powered by Pinecone vector storage and OpenAI embeddings.

### 💼 SaaS Infrastructure
-   **Usage Enforcement**: Built-in monthly quotas for documents and questions based on user plans (**Free, Starter, Pro**).
-   **Secure Authentication**: JWT-based auth with email verification and self-service **Password Recovery**.
-   **Audit Logging**: Detailed tracking of security events (logins, uploads, deletions) for compliance.
-   **Stripe Integration**: Automated billing and customer portal for subscription management.

### ⚡ Technical Excellence
-   **Real-time Streaming**: Instant AI responses via Server-Sent Events (SSE).
-   **Zero-Setup Dev**: Ships with **SQLite** for instant local development without complex database configuration.
-   **Evaluation Suite**: In-built RAG evaluator to measure response accuracy against a "Golden Dataset".

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Zustand |
| **Backend** | Fastify, Node.js, Prisma ORM |
| **AI/ML** | Claude Sonnet 4 (claude-sonnet-4-20250514), OpenAI Embeddings, Cohere Rerank v3 |
| **Database** | SQLite (Local) / PostgreSQL (Prod), Pinecone (Vector) |
| **Security** | JWT, Bcrypt, Audit Logs |
| **Billing** | Stripe (Checkout & Billing Portal) |
| **Email** | Nodemailer / Resend |

---

## 🚀 Getting Started

### 📦 Prerequisites
- Node.js 20+
- npm or pnpm

### 🛠️ Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/TRUSHAKHACHARIYA/DocWise.git
   cd DocWise
   
   # Install Backend
   cd backend && npm install
   
   # Install Frontend
   cd ../frontend && npm install
   ```

2. **Environment Configuration**
   Copy the example environment files and add your API keys.
   ```bash
   # In /backend
   cp .env.example .env
   
   # In /frontend
   cp .env.example .env.local
   ```
   *Required Keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PINECONE_API_KEY`, `STRIPE_SECRET_KEY`.*

3. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

4. **Launch**
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm run dev
   
   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```

Visit **http://localhost:3000** to start analyzing!

---

## 📊 Evaluation & Testing
To ensure the AI responses are high-quality, run the evaluation suite:
```bash
cd backend
npx ts-node evals/run_eval.ts
```
Results will be saved to `backend/evals/results/latest_run.json`.

---

## 📁 Project Structure
```text
DocWise/
├── frontend/          # Next.js Application
├── backend/           # Fastify API Server
│   ├── prisma/        # Database Schema & Migrations
│   ├── src/services/  # RAG, Auth, Usage, & Billing Logic
│   └── evals/         # RAG Quality Testing Pipeline
├── docs/              # Architecture & Deployment Guides
└── evals/             # Global Evaluation Datasets
```

---

## 📜 License
Licensed under the [MIT License](LICENSE).

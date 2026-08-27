# DocWise — Secure Multi-Document AI Workspace

> **Grounded answers with citations across your document library.** Built for teams and research-heavy professionals who need control, audit trails, and governance—not another single-PDF chat tool.

DocWise is a premium SaaS platform for legal, compliance, and research teams. Query across large document libraries with Retrieval-Augmented Generation (RAG), verifiable source citations, admin controls, and usage-based billing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue)](https://www.typescriptlang.org/)

---

## ✨ Key Features

### 🧠 Intelligent RAG Pipeline
-   **Context-Aware Chat**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`) for high-quality, grounded reasoning.
-   **Source Citations**: Every answer includes clickable excerpts; citations jump to and highlight the source passage in the PDF viewer.
-   **Multi-Document Analysis**: Select multiple files in the sidebar to query across your entire knowledge base simultaneously.
-   **Semantic Search**: Powered by Pinecone vector storage with configurable embeddings (OpenAI, Anthropic, or Cohere).
-   **Scanned PDF OCR**: Tesseract fallback for image-based PDFs (up to 25 pages).
-   **Token-Based Chunking**: 512-token chunks with 64-token overlap for improved retrieval quality.

### 💼 SaaS Infrastructure
-   **Usage Enforcement**: Built-in monthly quotas for documents and questions based on user plans (**Free, Starter, Pro, Enterprise**).
-   **Real Storage Tracking**: Plan-based storage limits enforced from actual document `sizeBytes`.
-   **Secure Authentication**: JWT with HttpOnly refresh cookies, plus API key auth (`Bearer dw_...`) for Pro+ programmatic access.
-   **Account Deletion**: Password-confirmed permanent deletion with S3, Pinecone, and audit log cleanup.
-   **Background Processing**: Document ingestion via **BullMQ** and **Redis**—handles large PDFs without timeouts.
-   **Audit Logging**: Detailed tracking of security events (logins, uploads, deletions) for compliance.
-   **Admin Analytics**: Real signup, usage, and activity metrics via `/api/admin/analytics/summary`.
-   **NMI Integration**: Automated billing and customer portal for subscription management.
-   **Multi-tenant Architecture**: Isolated user spaces with role-based access control (User/Admin).

### ⚡ Technical Excellence
-   **Real-time Streaming**: Instant AI responses via Server-Sent Events (SSE).
-   **PostgreSQL Database**: Production-ready relational storage with Prisma migrations (local dev via Docker Compose).
-   **Evaluation Suite**: In-built RAG evaluator to measure response accuracy against a "Golden Dataset".
-   **Document Processing**: PDF and Word documents with text extraction, OCR fallback, and token-aware chunking.
-   **Vector Search**: Pinecone integration for semantic similarity search across documents.
-   **Developer Settings**: API key management UI at `/settings/developer` for Pro+ users.

### 🗺️ Roadmap (In Progress)
See [`docs/PLAN.md`](docs/PLAN.md) for the full strategic roadmap.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Zustand, Axios |
| **Backend** | Fastify, Node.js 20+, TypeScript 6.0, Prisma ORM |
| **AI/ML** | Claude 3.5 Sonnet, OpenAI/Anthropic/Cohere Embeddings, Cohere Rerank v3 |
| **Database** | PostgreSQL (local via Docker / Neon / Supabase in prod), Pinecone (Vector), Redis (Queue & RL) |
| **Security** | JWT (HttpOnly Cookies), API Keys (`dw_...`), Bcrypt, Helmet, Redis Rate Limiting, Audit Logs |
| **Storage** | AWS S3 / R2 for file storage |
| **Billing** | NMI (Checkout & Billing Portal) |
| **Email** | Nodemailer / Resend |
| **Testing** | Vitest, Golden QA Dataset, Pipeline E2E |
| **Monitoring** | Sentry (Frontend & Backend), Custom Audit System |

---

## 🚀 Getting Started

### 📦 Prerequisites
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm**
- **Docker Desktop** - Required for local PostgreSQL and Redis via `npm run db:up` ([Docker Compose](docker-compose.yml) runs Postgres 15 + Redis 7). Without Docker, use hosted Postgres (Neon/Supabase) and an external Redis instance—set `DATABASE_URL` and `REDIS_URL` accordingly.
- **Git** for version control
- **API Keys** for external services (see Environment Setup)

### 🛠️ Installation

#### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/TRUSHAKHACHARIYA/DocWise.git
cd DocWise

# Install all workspace dependencies (monorepo setup)
npm install

# Or install individually
# Backend
cd backend && npm install
# Frontend  
cd ../frontend && npm install
```

#### 2. Environment Configuration
Create environment files in both backend and frontend directories:

**Backend Environment (`backend/.env`)**
```env
# Database (PostgreSQL — use docker compose for local dev)
DATABASE_URL="postgresql://docwise:docwise@localhost:5432/docwise"

# Authentication
JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-min-32-chars"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# AI Services
OPENAI_API_KEY="sk-your-openai-api-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
COHERE_API_KEY="your-cohere-api-key"

# Vector Database
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="us-east-1-aws"
PINECONE_INDEX="docwise-dev"

# NMI (for payments)
NMI_PRIVATE_API_KEY="sk_test_your-NMI-secret-key"
NMI_WEBHOOK_SECRET="whsec_your-webhook-secret"
NMI_PLAN_STARTER="price_your-starter-price-id"
NMI_PLAN_PRO="price_your-pro-price-id"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# AWS S3/R2 (for file storage)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="docwise-files"

# Redis (Required for Rate Limiting & Background Jobs)
REDIS_URL="redis://localhost:6379"

# Sentry (Optional, for error tracking)
SENTRY_DSN="your-sentry-dsn"
```

**Frontend Environment (`frontend/.env.local`)**
```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# NMI
NEXT_PUBLIC_NMI_COLLECT_JS_KEY="pk_test_your-NMI-publishable-key"

# Sentry (optional, for error tracking)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

#### 3. Database Setup
```bash
# Start PostgreSQL + Redis locally (Docker required)
npm run db:up

cd backend

# Generate Prisma client
npx prisma generate

# Apply migrations
npm run db:migrate

# (Optional) Seed with sample data
node seed-demo.js
```

#### 4. Launch Development Servers
```bash
# Start PostgreSQL + Redis (if not already running)
npm run db:up

# Terminal 1: Backend + Frontend (monorepo)
npm run dev
```

Or run separately:

```bash
# Terminal 1: Backend Server (Port 4000)
cd backend && npm run dev

# Terminal 2: Frontend Server (Port 3000)
cd frontend && npm run dev
```

Visit **http://localhost:3000** to start analyzing documents!

#### 5. Workspace Scripts (Root Level)
```bash
# Development
npm run dev:frontend    # Start frontend only
npm run dev:backend     # Start backend only

# Quality Assurance
npm run validate        # Run all validation checks
npm run typecheck       # Type check both frontend and backend
npm run test           # Run backend tests
npm run lint           # Lint frontend code

# Build
npm run build          # Build both frontend and backend

# Quality Gates
npm run eval:gate      # Run evaluation quality gate
npm run perf:budget    # Check performance budget
npm run release:check  # Pre-release checks

# Database (Docker)
npm run db:up          # Start PostgreSQL + Redis containers
npm run db:down        # Stop containers
npm run db:migrate     # Apply Prisma migrations
npm run db:setup       # db:up + db:migrate in one step
```

---

## 🧪 Testing & Quality Assurance

### Testing Suite
DocWise includes comprehensive testing to ensure reliability and accuracy:

#### Unit & Integration Tests
```bash
# Run backend tests
cd backend && npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck
```

#### RAG Evaluation System
To ensure AI responses are high-quality, run the evaluation suite:
```bash
cd backend
npx ts-node evals/run_eval.ts
```
Results will be saved to `backend/evals/results/latest_run.json`.

#### Quality Gates (Root Level)
```bash
npm run validate        # Run all validation checks
npm run eval:gate       # Run evaluation quality gate
npm run perf:budget     # Check performance budget
npm run release:check   # Pre-release checks
npm run smoke:e2e       # Smoke E2E tests
```

#### Frontend Quality
```bash
npm run lint            # ESLint for frontend
npm run validate:frontend  # Frontend validation only
```

#### Backend Quality
```bash
npm run validate:backend   # Backend validation only
```

---

## 🌐 Complete Feature Ecosystem

### Interactive Feature Flow Diagram
```mermaid
graph TB
    %% User Interface Layer
    subgraph "🎨 User Interface Layer"
        UI[Landing Page]
        AUTH[Authentication Portal]
        DASH[Dashboard]
        CHAT[Chat Interface]
        ADMIN[Admin Panel]
        BILLING[Billing Portal]
    end

    %% Core Features
    subgraph "🚀 Core Features"
        DOC_MGMT[Document Management]
        RAG_CHAT[RAG-Powered Chat]
        MULTI_DOC[Multi-Document Analysis]
        SEMANTIC[Semantic Search]
        REAL_TIME[Real-time Streaming]
        CITATIONS[Source Citations]
    end

    %% AI & Processing
    subgraph "🧠 AI & Processing"
        PDF_PARSE[PDF Processing]
        DOCX_PARSE[Word Processing]
        OCR[Scanned PDF OCR]
        EMBEDDINGS[OpenAI Embeddings]
        VEC_STORE[Pinecone Vector DB]
        RERANK[Cohere Rerank v3]
        CLAUDE[Claude 3.5 Sonnet]
    end

    %% SaaS Infrastructure
    subgraph "💼 SaaS Infrastructure"
        USER_MGMT[User Management]
        SUBS[Subscription Plans]
        USAGE_TRACK[Usage Tracking]
        AUDIT[Audit Logging]
        RATE_LIMIT[Rate Limiting]
        EMAIL[Email Service]
    end

    %% Payment & Billing
    subgraph "💳 Payment & Billing"
        NMI[NMI Integration]
        WEBHOOKS[Webhook Processing]
        INVOICES[Invoice Generation]
        CUSTOMER_PORTAL[Customer Portal]
    end

    %% Security & Compliance
    subgraph "🔒 Security & Compliance"
        JWT_AUTH[JWT Authentication]
        RBAC[Role-Based Access]
        DATA_ENCRYPT[Data Encryption]
        SECURITY_LOGS[Security Logs]
        COMPLIANCE[Compliance Tracking]
    end

    %% Storage & Database
    subgraph "🗄️ Storage & Database"
        POSTGRES[(PostgreSQL)]
        S3_STORAGE[AWS S3/R2 Storage]
        REDIS[(Redis Cache)]
        FILE_MGMT[File Management]
    end

    %% Monitoring & Analytics
    subgraph "📊 Monitoring & Analytics"
        PERFORMANCE[Performance Metrics]
        ERROR_TRACKING[Error Tracking]
        USER_ANALYTICS[User Analytics]
        SYSTEM_HEALTH[System Health]
        ALERTS[Alert System]
    end

    %% Connections - User Flow
    UI --> AUTH
    AUTH --> DASH
    DASH --> DOC_MGMT
    DASH --> CHAT
    DASH --> BILLING
    DASH --> ADMIN

    %% Core Feature Connections
    DOC_MGMT --> PDF_PARSE
    DOC_MGMT --> DOCX_PARSE
    DOC_MGMT --> FILE_MGMT
    PDF_PARSE --> OCR
    PDF_PARSE --> EMBEDDINGS
    DOCX_PARSE --> EMBEDDINGS
    EMBEDDINGS --> VEC_STORE

    CHAT --> RAG_CHAT
    RAG_CHAT --> SEMANTIC
    RAG_CHAT --> MULTI_DOC
    RAG_CHAT --> REAL_TIME
    RAG_CHAT --> CITATIONS
    SEMANTIC --> VEC_STORE
    SEMANTIC --> RERANK
    RERANK --> CLAUDE
    CLAUDE --> REAL_TIME

    %% SaaS Infrastructure Connections
    AUTH --> USER_MGMT
    USER_MGMT --> SUBS
    USER_MGMT --> USAGE_TRACK
    USAGE_TRACK --> AUDIT
    AUTH --> RATE_LIMIT
    USER_MGMT --> EMAIL

    %% Payment Connections
    BILLING --> NMI
    NMI --> WEBHOOKS
    NMI --> INVOICES
    NMI --> CUSTOMER_PORTAL
    SUBS --> NMI

    %% Security Connections
    AUTH --> JWT_AUTH
    USER_MGMT --> RBAC
    FILE_MGMT --> DATA_ENCRYPT
    AUDIT --> SECURITY_LOGS
    USER_MGMT --> COMPLIANCE

    %% Storage Connections
    USER_MGMT --> POSTGRES
    DOC_MGMT --> POSTGRES
    FILE_MGMT --> S3_STORAGE
    SEMANTIC --> REDIS

    %% Monitoring Connections
    RAG_CHAT --> PERFORMANCE
    CLAUDE --> ERROR_TRACKING
    USER_MGMT --> USER_ANALYTICS
    POSTGRES --> SYSTEM_HEALTH
    ERROR_TRACKING --> ALERTS

    %% Admin Connections
    ADMIN --> USER_MGMT
    ADMIN --> AUDIT
    ADMIN --> USER_ANALYTICS
    ADMIN --> SYSTEM_HEALTH

    %% Styling
    classDef uiLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef coreFeatures fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef aiProcessing fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef saasInfra fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef payment fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef security fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef storage fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef monitoring fill:#e0f2f1,stroke:#004d40,stroke-width:2px

    class UI,AUTH,DASH,CHAT,ADMIN,BILLING uiLayer
    class DOC_MGMT,RAG_CHAT,MULTI_DOC,SEMANTIC,REAL_TIME,CITATIONS coreFeatures
    class PDF_PARSE,DOCX_PARSE,OCR,EMBEDDINGS,VEC_STORE,RERANK,CLAUDE aiProcessing
    class USER_MGMT,SUBS,USAGE_TRACK,AUDIT,RATE_LIMIT,EMAIL saasInfra
    class NMI,WEBHOOKS,INVOICES,CUSTOMER_PORTAL payment
    class JWT_AUTH,RBAC,DATA_ENCRYPT,SECURITY_LOGS,COMPLIANCE security
    class POSTGRES,S3_STORAGE,REDIS,FILE_MGMT storage
    class PERFORMANCE,ERROR_TRACKING,USER_ANALYTICS,SYSTEM_HEALTH,ALERTS monitoring
```

### Feature Interaction Matrix
| Feature Category | Core Components | User Benefits | Technical Implementation |
|-----------------|-----------------|----------------|-------------------------|
| **📄 Document Processing** | PDF Parser, OCR, Word Parser, Token Chunker, File Storage | Upload any document, automatic text extraction including scanned PDFs | pdf-parse, Tesseract OCR, Mammoth.js, 512/64 token chunking, AWS S3/R2 |
| **🤖 AI-Powered Chat** | RAG Pipeline, Claude LLM, Citations + PDF Highlight | Get accurate answers with clickable, highlighted sources | Claude 3.5 Sonnet, Embeddings, Pinecone, Cohere Rerank |
| **🔍 Smart Search** | Semantic Search, Vector DB, Multi-doc analysis | Find information across all documents | Pinecone Vector Search, Similarity Matching |
| **👥 User Management** | Authentication, API Keys, Roles, Subscription plans | Secure access with tiered features and programmatic API | JWT, API keys (`dw_...`), bcrypt, NMI Integration |
| **💳 Billing System** | Payment processing, Usage tracking, Webhooks | Automated billing with usage limits | NMI Tokenized Checkout, Customer Portal |
| **📊 Analytics & Monitoring** | Admin analytics, Performance metrics, Error tracking | System reliability and real usage insights | `/api/admin/analytics/summary`, Sentry integration |
| **🔒 Security & Compliance** | Audit logs, Data encryption, Access control | Enterprise-grade security | JWT Auth, Role-based access, Audit trails |

### User Journey Flow
```mermaid
journey
    title DocWise User Experience Journey
    section Onboarding
      Visit Website: 5: User
      Sign Up: 4: User
      Email Verification: 3: User
      Select Plan: 4: User
    section Document Management
      Upload First Document: 5: User
      Processing Complete: 4: User
      View Document Library: 5: User
      Organize Documents: 4: User
    section AI Interaction
      Ask First Question: 5: User
      Receive AI Response: 5: User
      View Citations: 4: User
      Follow-up Questions: 5: User
    section Advanced Features
      Multi-Document Query: 5: User
      Semantic Search: 4: User
      Export Results: 4: User
      Manage Usage: 3: User
    section Admin (if applicable)
      User Management: 4: Admin
      View Analytics: 4: Admin
      System Health: 3: Admin
      Audit Logs: 3: Admin
```

### Real-time Feature Interactions
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant AI as AI Services
    participant DB as Database
    participant V as Vector DB
    participant S as Storage

    U->>F: Upload Document
    F->>A: POST /api/documents
    A->>S: Store file
    A->>AI: Process document (PDF/Word)
    AI->>AI: Extract text & metadata
    AI->>AI: Generate embeddings
    AI->>V: Store vectors
    AI->>DB: Update document status
    A->>F: Return success
    F->>U: Show processing complete

    U->>F: Ask question
    F->>A: POST /api/chat (SSE)
    A->>V: Semantic search
    V->>A: Return relevant chunks
    A->>AI: Rerank results
    AI->>AI: Generate response with Claude
    A->>F: Stream response (SSE)
    F->>U: Display real-time answer
```

---

## 🏗️ Architecture Overview

### System Design
```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  Next.js 15 (App Router) + Tailwind + Zustand       │
│  Pages: Landing, Auth, Dashboard, Chat, Admin        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + SSE (streaming)
┌──────────────────────▼──────────────────────────────┐
│                    API LAYER                         │
│  Fastify (Node.js 20)  — Port 4000                  │
│  Routes: /auth /documents /chat /admin /webhooks     │
│  Middleware: JWT/API key auth, rate limit, usage limit │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
┌──────┐ ┌──────────┐ ┌───────┐ ┌──────────┐
│ PG   │ │ Pinecone │ │  R2   │ │  Redis   │
│ DB   │ │ Vector DB│ │  S3   │ │  Cache   │
└──────┘ └──────────┘ └───────┘ └──────────┘
                       │
              ┌────────▼────────┐
              │  External APIs   │
              │  OpenAI Embed    │
              │  Anthropic LLM   │
              │  Cohere Rerank   │
              │  NMI Billing  │
              │  Resend Email    │
              └─────────────────┘
```

### Project Structure
```text
DocWise/
├── docker-compose.yml        # Local PostgreSQL 15 + Redis 7
├── frontend/                 # Next.js 15 Application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── store/           # Zustand state management
│   ├── public/              # Static assets
│   └── tailwind.config.js   # Tailwind configuration
├── backend/                  # Fastify API Server
│   ├── prisma/              # Database Schema & Migrations
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Migration files
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # RAG, Auth, Usage, & Billing Logic
│   │   ├── middleware/      # Authentication, validation
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript definitions
│   ├── evals/               # RAG Quality Testing Pipeline
│   └── uploads/              # Temporary file storage
├── docs/                     # Architecture, strategy & deployment
│   ├── PLAN.md               # Strategic roadmap, positioning, GTM
│   ├── TASK.md               # Engineering day-by-day build plan
│   ├── ARCHITECTURE.md       # Detailed system architecture
│   ├── DEPLOYMENT_GUIDE.md   # Production deployment guide
│   ├── dev/deployment_plan.md # Deployment checklist
│   ├── CONTEXT.md            # Business logic documentation
│   └── PROMPT.md             # AI prompt engineering
├── scripts/                  # Build & deployment scripts
│   ├── check-docs-sync.mjs   # Documentation sync checker
│   ├── eval-gate.mjs         # Evaluation quality gate
│   ├── perf-budget-check.mjs # Performance budget checker
│   └── smoke-e2e.mjs         # E2E smoke tests
├── evals/                    # Global Evaluation Datasets
├── .github/                  # GitHub Actions workflows
├── package.json              # Monorepo configuration
└── README.md                 # This file
```

### Database Schema
The application uses Prisma ORM with the following key models:
- **User**: Authentication, roles, subscription plans
- **Document**: File metadata, processing status, `sizeBytes` for storage tracking
- **Message**: Chat history with citations
- **ApiKey**: Programmatic access keys (`dw_...` prefix) for Pro+ users
- **Subscription**: NMI integration for billing
- **AuditLog**: Security and compliance tracking

---

## 🚀 Deployment

### Production Deployment Guide
For detailed production deployment instructions, see [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

#### Quick Deployment Overview
1. **Backend**: Deploy to Railway/Render with PostgreSQL
2. **Frontend**: Deploy to Vercel/Netlify
3. **Database**: PostgreSQL (production), Pinecone (vector)
4. **Storage**: AWS S3 or Cloudflare R2
5. **Monitoring**: Sentry for error tracking

#### Environment Variables for Production
Key production environment variables include:
- `DATABASE_URL`: PostgreSQL connection string
- `NMI_PRIVATE_API_KEY`: Live NMI API key
- `PINECONE_API_KEY`: Production Pinecone credentials
- `JWT_*_SECRET`: Secure token secrets

---

## 📚 API Documentation

### Core Endpoints
- **Authentication**: `/api/auth/*` — Login, register, password reset, token refresh
- **User**: `/api/user/*` — Profile, usage, API keys, account deletion
- **Documents**: `/api/documents/*` — Upload, list, delete documents
- **Chat**: `/api/chat/*` — Query documents with RAG (SSE streaming)
- **Admin**: `/api/admin/*` — User management, analytics, queue triage
- **Webhooks**: `/api/webhooks/*` — NMI billing integration

### Authentication
- **JWT**: Access token + HttpOnly refresh cookie (`/api/auth/refresh`)
- **API keys**: `Authorization: Bearer dw_...` for programmatic access (Pro+)
- Role-based access control (USER/ADMIN)
- Email verification for account activation

### User Endpoints
- `GET /api/user/me` — Profile, plan, and usage (documents, questions, `storageUsedMB`)
- `DELETE /api/user/account` — Password-confirmed permanent deletion (S3 + Pinecone cleanup)

### Admin Endpoints
- `GET /api/admin/analytics/summary` — Signups, active users, document and question usage

---

## 🔧 Configuration

### Supported Document Types
- **PDF**: Text extraction with metadata; Tesseract OCR fallback for scanned/image PDFs (max 25 pages)
- **Word Documents**: .docx format support
- **Planned**: Markdown, plain text, web pages

### AI Model Configuration
- **Primary LLM**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)
- **Embeddings**: Configurable via `EMBEDDING_PROVIDER` — OpenAI (`text-embedding-3-small`), Anthropic (`claude-embedding-3`), or Cohere (`embed-multilingual-v3.0`)
- **Chunking**: 512 tokens per chunk, 64-token overlap
- **Reranking**: Cohere Rerank v3 for improved relevance

### Usage Limits by Plan
| Plan | Documents/Month | Questions/Month | Features |
|------|-----------------|-----------------|----------|
| Free | 5 | 20 | Basic RAG, Limited storage |
| Starter | 50 | 500 | Advanced search, Email support |
| Pro | 500 | 5000 | Priority processing, API access |
| Enterprise | Unlimited | Unlimited | Custom models, Dedicated support |

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm run validate`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Quality Standards
- All code must pass TypeScript type checking
- Tests required for new features
- Follow existing code style and patterns
- Update documentation for API changes

---

## 🔧 Troubleshooting

### Common Issues
1. **Docker not running**: `npm run db:up` fails — start Docker Desktop, then retry
2. **Database connection**: Ensure `DATABASE_URL` points to a running PostgreSQL instance
3. **Redis required**: BullMQ ingestion and rate limiting need Redis at `REDIS_URL` (included in Docker Compose)
4. **`npm` not recognized (Windows)**: Install [Node.js LTS](https://nodejs.org/) and restart your terminal
5. **API keys**: Verify all required API keys are set in environment
6. **CORS issues**: Check `FRONTEND_URL` matches your frontend domain
7. **File upload**: Ensure S3/R2 credentials are configured and bucket permissions are correct

### Debug Mode
Enable debug logging by setting `DEBUG=docwise:*` in your environment.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Anthropic** for Claude AI capabilities
- **OpenAI** for embedding models
- **Pinecone** for vector database infrastructure
- **NMI** for payment processing
- **Vercel** for frontend hosting platform

---

## 📞 Support

- **Product roadmap**: [`docs/PLAN.md`](docs/PLAN.md) — positioning, competitive landscape, phased roadmap
- **Engineering plan**: [`docs/TASK.md`](docs/TASK.md) — day-by-day build tasks
- **Architecture & deployment**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)
- **Issues**: Open an issue on GitHub for bug reports
- **Email**: Contact support for enterprise inquiries

---

*Built with ❤️ for the document intelligence community*



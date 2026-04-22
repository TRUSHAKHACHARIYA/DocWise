# ARCHITECTURE.md — System Design

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  Next.js 14 (App Router) + Tailwind + Zustand       │
│  Pages: Landing, Auth, Dashboard, Chat, Admin        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + SSE (streaming)
┌──────────────────────▼──────────────────────────────┐
│                    API LAYER                         │
│  Fastify (Node.js 20)  — Port 4000                  │
│  Routes: /auth /documents /chat /admin /webhooks     │
│  Middleware: JWT auth, rate limit, usage limit       │
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

---

## 2. Folder Structure

```
docwise/
│
├── README.md
├── .gitignore
├── .env.example
│
├── docs/
│   ├── ARCHITECTURE.md       ← this file
│   ├── CONTEXT.md            ← business logic
│   ├── PROMPT.md             ← AI prompt templates
│   ├── TASK.md               ← dev task list
│   └── NOTES.md              ← dev notes & decisions
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.local.example
│   │
│   └── src/
│       ├── app/                        # Next.js App Router
│       │   ├── layout.tsx              # Root layout
│       │   ├── page.tsx                # Landing page
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx          # Dashboard shell
│       │   │   ├── dashboard/page.tsx  # User home
│       │   │   ├── documents/page.tsx  # Doc manager
│       │   │   ├── chat/
│       │   │   │   ├── page.tsx        # New chat
│       │   │   │   └── [sessionId]/page.tsx
│       │   │   ├── settings/page.tsx
│       │   │   └── billing/page.tsx
│       │   └── (admin)/
│       │       ├── layout.tsx          # Admin shell
│       │       ├── admin/page.tsx      # Admin overview
│       │       ├── admin/users/page.tsx
│       │       ├── admin/analytics/page.tsx
│       │       └── admin/settings/page.tsx
│       │
│       ├── components/
│       │   ├── ui/                     # Reusable base components
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Spinner.tsx
│       │   │   └── Toast.tsx
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   ├── chat/
│       │   │   ├── ChatWindow.tsx      # Main chat interface
│       │   │   ├── MessageBubble.tsx   # Single message
│       │   │   ├── SourceCard.tsx      # Citation display
│       │   │   ├── ChatInput.tsx       # Input + send
│       │   │   └── SessionSidebar.tsx  # Chat history list
│       │   ├── documents/
│       │   │   ├── UploadZone.tsx      # Drag-drop uploader
│       │   │   ├── DocumentCard.tsx
│       │   │   └── DocumentList.tsx
│       │   └── dashboard/
│       │       ├── StatsCard.tsx
│       │       ├── UsageBar.tsx
│       │       └── RecentChats.tsx
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useChat.ts              # SSE streaming hook
│       │   ├── useDocuments.ts
│       │   └── useUsage.ts
│       │
│       ├── lib/
│       │   ├── api.ts                  # Axios client + interceptors
│       │   ├── auth.ts                 # Token management
│       │   └── utils.ts
│       │
│       ├── store/
│       │   ├── authStore.ts            # Zustand auth state
│       │   ├── chatStore.ts
│       │   └── documentStore.ts
│       │
│       └── types/
│           ├── auth.ts
│           ├── chat.ts
│           └── document.ts
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # DB schema
│   │   └── seed.ts                     # Initial admin user
│   │
│   └── src/
│       ├── app.ts                      # Fastify setup
│       ├── server.ts                   # Entry point
│       │
│       ├── config/
│       │   ├── env.ts                  # Zod-validated env vars
│       │   ├── pinecone.ts
│       │   ├── redis.ts
│       │   └── s3.ts
│       │
│       ├── routes/
│       │   ├── auth.ts                 # /auth/*
│       │   ├── documents.ts            # /documents/*
│       │   ├── chat.ts                 # /chat/*
│       │   ├── admin.ts                # /admin/*
│       │   ├── billing.ts              # /billing/*
│       │   └── webhooks.ts             # /webhooks/nmi
│       │
│       ├── services/
│       │   ├── parser.ts               # PDF/DOCX → raw text
│       │   ├── chunker.ts              # text → chunks
│       │   ├── embedder.ts             # chunks → vectors
│       │   ├── vectorStore.ts          # Pinecone CRUD
│       │   ├── retriever.ts            # query → top chunks
│       │   ├── reranker.ts             # Cohere rerank
│       │   ├── llm.ts                  # Claude prompt + stream
│       │   ├── promptBuilder.ts        # Build final prompt
│       │   ├── fileStorage.ts          # R2/S3 upload/delete
│       │   ├── usage.ts                # Track + enforce limits
│       │   └── email.ts                # Resend email service
│       │
│       ├── middleware/
│       │   ├── auth.ts                 # JWT verification
│       │   ├── adminOnly.ts            # Role check
│       │   ├── rateLimit.ts            # Redis-based rate limiter
│       │   └── usageLimits.ts          # Plan limit check
│       │
│       ├── models/                     # TypeScript types (mirrors Prisma)
│       │   ├── user.ts
│       │   ├── document.ts
│       │   └── chat.ts
│       │
│       └── utils/
│           ├── logger.ts               # Pino logger
│           ├── errors.ts               # Custom error classes
│           └── helpers.ts
│
├── evals/
│   ├── README.md
│   ├── datasets/
│   │   ├── golden_qa.json              # Ground truth Q&A pairs
│   │   └── test_documents/             # PDFs used in evals
│   ├── scripts/
│   │   ├── run_eval.ts                 # Main eval runner
│   │   ├── metrics.ts                  # RAGAS-style metrics
│   │   └── generate_dataset.ts         # Auto-generate test cases
│   └── results/
│       └── .gitkeep
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                      # Run tests on PR
    │   ├── deploy-staging.yml          # Deploy to staging on dev merge
    │   └── deploy-prod.yml             # Deploy to prod on main merge
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 3. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { USER ADMIN }
enum Plan { FREE STARTER PRO ENTERPRISE }
enum DocStatus { PROCESSING READY FAILED }
enum SubStatus { ACTIVE CANCELLED PAST_DUE TRIALING }
enum MessageRole { USER ASSISTANT }

model User {
  id               String    @id @default(uuid())
  email            String    @unique
  passwordHash     String
  name             String
  role             Role      @default(USER)
  plan             Plan      @default(FREE)
  NMICustomerId String?
  verifiedAt       DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  documents     Document[]
  chatSessions  ChatSession[]
  usageLogs     UsageLog[]
  subscription  Subscription?
  apiKeys       ApiKey[]
}

model Document {
  id         String    @id @default(uuid())
  userId     String
  name       String
  s3Key      String
  sizeBytes  Int
  mimeType   String
  chunkCount Int       @default(0)
  pageCount  Int       @default(0)
  status     DocStatus @default(PROCESSING)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  chatSessions ChatSessionDoc[]
}

model ChatSession {
  id        String   @id @default(uuid())
  userId    String
  title     String   @default("New Chat")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents ChatSessionDoc[]
  messages  Message[]
}

model ChatSessionDoc {
  sessionId  String
  documentId String

  session  ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  document Document    @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@id([sessionId, documentId])
}

model Message {
  id          String      @id @default(uuid())
  sessionId   String
  role        MessageRole
  content     String      @db.Text
  sources     Json?       // [{chunkId, text, page, score, docName}]
  tokensUsed  Int         @default(0)
  createdAt   DateTime    @default(now())

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model UsageLog {
  id              String   @id @default(uuid())
  userId          String
  month           String   // "2025-01"
  questionsUsed   Int      @default(0)
  tokensUsed      Int      @default(0)
  docsUploaded    Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month])
}

model Subscription {
  id                String    @id @default(uuid())
  userId            String    @unique
  NMISubId       String    @unique
  plan              Plan
  status            SubStatus
  currentPeriodEnd  DateTime
  createdAt         DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ApiKey {
  id         String    @id @default(uuid())
  userId     String
  keyHash    String    @unique
  name       String
  lastUsedAt DateTime?
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String
  action     String
  targetType String?
  targetId   String?
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([actorId])
  @@index([createdAt])
}
```

---

## 4. API Endpoints

### Auth
```
POST /auth/register        Register new user
POST /auth/login           Login, returns JWT pair
POST /auth/refresh         Refresh access token
POST /auth/logout          Revoke refresh token
POST /auth/verify-email    Verify email with token
POST /auth/forgot-password Send reset email
POST /auth/reset-password  Set new password
```

### Documents
```
GET  /documents            List user's documents
POST /documents/upload     Upload + ingest document
GET  /documents/:id        Get document metadata
DELETE /documents/:id      Delete doc + vectors + file
GET  /documents/:id/status Ingestion status (polling)
```

### Chat
```
GET  /chat/sessions              List chat sessions
POST /chat/sessions              Create new session
GET  /chat/sessions/:id          Get session + messages
DELETE /chat/sessions/:id        Delete session
POST /chat/sessions/:id/message  Send message → SSE stream
GET  /chat/sessions/:id/export   Export as PDF/MD
```

### Admin
```
GET  /admin/users              List all users
GET  /admin/users/:id          Get user details
PATCH /admin/users/:id         Update user (plan, role, ban)
DELETE /admin/users/:id        Delete user
GET  /admin/analytics          Usage stats, revenue
GET  /admin/system             API costs, DB size
POST /admin/announcements      Send announcement
```

### Billing
```
POST /billing/create-checkout    NMI Tokenized Checkout session
POST /billing/portal             NMI billing portal
GET  /billing/plans              Get available plans
POST /webhooks/nmi            NMI webhook handler
```

---

## 5. Environment Variables

```env
# backend/.env

# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/docwise

# Auth
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
COHERE_API_KEY=...

# Vector DB
PINECONE_API_KEY=...
PINECONE_INDEX=docwise-index
PINECONE_ENVIRONMENT=us-east-1-aws

# File Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=docwise-files
R2_PUBLIC_URL=https://files.yourdomain.com

# Cache
REDIS_URL=redis://localhost:6379

# Billing
NMI_PRIVATE_API_KEY=sk_test_...
NMI_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@docwise.ai

# Monitoring
SENTRY_DSN=https://...
```

---

## 6. CI/CD Pipeline

```
Feature branch → PR → CI runs tests → Merge to dev → Auto-deploy staging → Manual approve → Merge to main → Auto-deploy production
```

GitHub Actions:
- `ci.yml` — lint + unit tests + integration tests on every PR
- `deploy-staging.yml` — deploy to Railway staging on merge to `dev`
- `deploy-prod.yml` — deploy to Railway production on merge to `main`



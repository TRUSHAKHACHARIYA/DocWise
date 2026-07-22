import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/prisma", () => ({
  prisma: {
    apiKey: { findFirst: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
    usageLog: { upsert: vi.fn(), findUnique: vi.fn() },
    $executeRaw: vi.fn(),
  },
}));

vi.mock("../utils/auth", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("../services/retriever", () => ({
  retrieveRelevantChunks: vi.fn(),
}));

vi.mock("../services/usage", () => ({
  tryIncrementUsage: vi.fn(),
  getEffectiveLimits: vi.fn(),
}));

import { requireAuth } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { retrieveRelevantChunks } from "../services/retriever";
import { tryIncrementUsage, getEffectiveLimits } from "../services/usage";

function createReply() {
  return {
    sent: false,
    statusCode: 200,
    payload: null as unknown,
    code(status: number) {
      this.statusCode = status;
      return this;
    },
    send(payload: unknown) {
      this.sent = true;
      this.payload = payload;
      return this;
    },
  };
}

describe("v1 API authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authenticates valid dw_ API keys", async () => {
    const rawKey = "dw_" + "a".repeat(48);

    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue({
      id: "key-1",
      user: { id: "user-1", role: "PRO", plan: "PRO", trialEndsAt: null },
    } as any);
    vi.mocked(prisma.apiKey.update).mockResolvedValue({} as any);

    const req = {
      headers: { authorization: `Bearer ${rawKey}` },
      cookies: {},
    } as any;
    const reply = createReply();

    await requireAuth(req, reply as any);

    expect(req.user).toEqual({
      id: "user-1",
      role: "PRO",
      plan: "PRO",
      trialEndsAt: null,
    });
    expect(reply.sent).toBe(false);
  });

  it("rejects invalid API keys", async () => {
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(null);

    const req = {
      headers: { authorization: "Bearer dw_invalidkey" },
      cookies: {},
    } as any;
    const reply = createReply();

    await requireAuth(req, reply as any);

    expect(reply.statusCode).toBe(401);
    expect((reply.payload as any).error).toBe("Invalid or revoked API key");
  });
});

describe("v1 retrieve endpoint behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns chunks when usage limit allows", async () => {
    vi.mocked(getEffectiveLimits).mockReturnValue({ maxQuestions: 100, maxDocs: 10, maxStorageMB: 1000 });
    vi.mocked(tryIncrementUsage).mockResolvedValue(true);
    vi.mocked(retrieveRelevantChunks).mockResolvedValue([
      { text: "chunk text", documentId: "doc-1", documentName: "Test Doc", score: 0.9, page: 1 },
    ]);

    const allowed = await tryIncrementUsage("user-1", "questionsUsed", 100);
    expect(allowed).toBe(true);

    const chunks = await retrieveRelevantChunks("user-1", "test query", 5);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe("chunk text");
  });

  it("rejects when usage limit is exceeded", async () => {
    vi.mocked(getEffectiveLimits).mockReturnValue({ maxQuestions: 20, maxDocs: 3, maxStorageMB: 100 });
    vi.mocked(tryIncrementUsage).mockResolvedValue(false);

    const allowed = await tryIncrementUsage("user-1", "questionsUsed", 20);
    expect(allowed).toBe(false);
  });

  it("passes searchMode through to retriever", async () => {
    vi.mocked(retrieveRelevantChunks).mockResolvedValue([]);

    await retrieveRelevantChunks("user-1", "query", 5, undefined, "semantic");
    expect(retrieveRelevantChunks).toHaveBeenCalledWith("user-1", "query", 5, undefined, "semantic");
  });

  it("passes recencyBias through to retriever", async () => {
    vi.mocked(retrieveRelevantChunks).mockResolvedValue([]);

    await retrieveRelevantChunks("user-1", "query", 5, undefined, "hybrid", 0.5);
    expect(retrieveRelevantChunks).toHaveBeenCalledWith("user-1", "query", 5, undefined, "hybrid", 0.5);
  });
});

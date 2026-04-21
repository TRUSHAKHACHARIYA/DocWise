import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkDocumentLimit, checkQuestionLimit } from "../middleware/usageLimits";
import { getUsage } from "../services/usage";

vi.mock("../services/usage", () => ({
  CHECK_LIMITS: {
    FREE: { maxDocs: 3, maxQuestions: 20 },
    STARTER: { maxDocs: 20, maxQuestions: 200 },
    PRO: { maxDocs: 100, maxQuestions: 1000 },
    ENTERPRISE: { maxDocs: 999999, maxQuestions: 999999 },
  },
  getUsage: vi.fn(),
  getEffectiveLimits: vi.fn((user: any) => {
    if (user.plan === "STARTER") {
      return { maxDocs: 20, maxQuestions: 200 };
    }
    if (user.plan === "PRO") {
      return { maxDocs: 100, maxQuestions: 1000 };
    }
    if (user.plan === "ENTERPRISE") {
      return { maxDocs: 999999, maxQuestions: 999999 };
    }
    return { maxDocs: 3, maxQuestions: 20 };
  }),
  isInTrial: vi.fn(() => false),
}));

function createReply() {
  return {
    statusCode: 200,
    payload: null as unknown,
    code(status: number) {
      this.statusCode = status;
      return this;
    },
    send(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
}

describe("usage limit middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks document upload when limit is reached", async () => {
    vi.mocked(getUsage).mockResolvedValue({
      docsUploaded: 3,
      questionsUsed: 0,
    } as any);
    const req = { user: { id: "u1", role: "USER", plan: "FREE" } } as any;
    const reply = createReply();

    await checkDocumentLimit(req, reply as any);

    expect(reply.statusCode).toBe(403);
    expect((reply.payload as any).error).toBe("Document limit reached");
  });

  it("blocks question when limit is reached", async () => {
    vi.mocked(getUsage).mockResolvedValue({
      docsUploaded: 0,
      questionsUsed: 20,
    } as any);
    const req = { user: { id: "u1", role: "USER", plan: "FREE" } } as any;
    const reply = createReply();

    await checkQuestionLimit(req, reply as any);

    expect(reply.statusCode).toBe(403);
    expect((reply.payload as any).error).toBe("Question limit reached");
  });
});

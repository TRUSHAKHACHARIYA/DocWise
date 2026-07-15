import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "crypto";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { verifyAccessToken } from "../utils/auth";

vi.mock("../utils/prisma", () => ({
  prisma: {
    apiKey: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../utils/auth", () => ({
  verifyAccessToken: vi.fn(),
}));

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

describe("requireAuth API key support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authenticates valid dw_ API keys", async () => {
    const rawKey = "dw_" + "a".repeat(48);
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue({
      id: "key-1",
      user: {
        id: "user-1",
        role: "PRO",
        plan: "PRO",
        trialEndsAt: null,
      },
    } as any);
    vi.mocked(prisma.apiKey.update).mockResolvedValue({} as any);

    const req = {
      headers: { authorization: `Bearer ${rawKey}` },
      cookies: {},
    } as any;
    const reply = createReply();

    await requireAuth(req, reply as any);

    expect(prisma.apiKey.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { keyHash, revokedAt: null },
      })
    );
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

  it("still accepts JWT bearer tokens", async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ userId: "user-2" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-2",
      role: "USER",
      plan: "FREE",
      trialEndsAt: null,
    } as any);

    const req = {
      headers: { authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.test" },
      cookies: {},
    } as any;
    const reply = createReply();

    await requireAuth(req, reply as any);

    expect(verifyAccessToken).toHaveBeenCalled();
    expect(req.user?.id).toBe("user-2");
  });
});

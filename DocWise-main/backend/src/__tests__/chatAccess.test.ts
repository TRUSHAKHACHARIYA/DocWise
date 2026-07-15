import { describe, expect, it, vi } from "vitest";
import { ensureOwnedDocuments } from "../services/chatAccess";
import { prisma } from "../utils/prisma";

vi.mock("../utils/prisma", () => ({
  prisma: {
    document: {
      findMany: vi.fn(),
    },
  },
}));

describe("ensureOwnedDocuments", () => {
  it("deduplicates ids and returns only owned documents", async () => {
    vi.mocked(prisma.document.findMany).mockResolvedValue([
      { id: "doc-1" },
      { id: "doc-2" },
    ] as any);

    const result = await ensureOwnedDocuments("user-1", ["doc-1", "doc-2", "doc-1"]);

    expect(result).toEqual(["doc-1", "doc-2"]);
    expect(prisma.document.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["doc-1", "doc-2"] },
        userId: "user-1",
      },
      select: { id: true },
    });
  });

  it("rejects documents that belong to a different user", async () => {
    vi.mocked(prisma.document.findMany).mockResolvedValue([
      { id: "doc-1" },
    ] as any);

    await expect(ensureOwnedDocuments("user-1", ["doc-1", "doc-2"])).rejects.toMatchObject({
      message: "One or more documents are not available to this account: doc-2",
      statusCode: 400,
    });
  });
});

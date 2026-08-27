import { describe, expect, it, vi } from "vitest";
import { processTextIngestion } from "../modules/ingestion/ingestion.service";
import { prisma } from "../utils/prisma";
import { deleteVectorsByDocumentId } from "../services/vectorStore";

vi.mock("../utils/prisma", () => ({
  prisma: {
    document: {
      update: vi.fn(),
    },
    chunk: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("../modules/chunking/chunker.factory", () => ({
  chunkText: vi.fn(() => [{ text: "chunk", startIndex: 0 }]),
}));

vi.mock("../modules/embeddings", () => ({
  embedChunks: vi.fn(async (chunks: string[]) => chunks.map(() => [0.1, 0.2])),
}));

vi.mock("../services/vectorStore", () => ({
  upsertVectors: vi.fn(),
  deleteVectorsByDocumentId: vi.fn(),
}));

vi.mock("../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("processTextIngestion retry idempotency", () => {
  it("clears prior chunks and vectors before writing new ones, so a BullMQ retry doesn't duplicate them", async () => {
    await processTextIngestion("user-1", "doc-1", "hello world");

    expect(prisma.chunk.deleteMany).toHaveBeenCalledWith({ where: { documentId: "doc-1" } });
    expect(deleteVectorsByDocumentId).toHaveBeenCalledWith("user-1", "doc-1");

    const deleteOrder = (prisma.chunk.deleteMany as any).mock.invocationCallOrder[0];
    const createOrder = (prisma.chunk.createMany as any).mock.invocationCallOrder[0];
    expect(deleteOrder).toBeLessThan(createOrder);
  });
});

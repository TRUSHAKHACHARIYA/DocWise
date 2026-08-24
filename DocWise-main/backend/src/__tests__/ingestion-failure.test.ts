import { describe, expect, it, vi } from "vitest";
import { processTextIngestion } from "../modules/ingestion/ingestion.service";
import { prisma } from "../utils/prisma";

vi.mock("../utils/prisma", () => ({
  prisma: {
    document: {
      update: vi.fn(),
    },
    chunk: {
      createMany: vi.fn(),
    },
  },
}));

vi.mock("../modules/chunking/chunker.factory", () => ({
  chunkText: vi.fn(() => [{ text: "chunk", startIndex: 0 }]),
}));

vi.mock("../modules/embeddings", () => ({
  embedChunks: vi.fn(async () => {
    throw new Error("embedding failed");
  }),
}));

vi.mock("../services/vectorStore", () => ({
  upsertVectors: vi.fn(),
}));

vi.mock("../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("processTextIngestion", () => {
  it("marks the document failed and rethrows ingestion errors", async () => {
    await expect(processTextIngestion("user-1", "doc-1", "hello world")).rejects.toThrow("embedding failed");

    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: "doc-1" },
      data: { status: "FAILED" },
    });
  });
});

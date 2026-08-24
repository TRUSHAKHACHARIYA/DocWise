import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/prisma", () => ({
  prisma: {
    document: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    chunk: {
      createMany: vi.fn(),
    },
    $executeRaw: vi.fn(),
  },
}));

vi.mock("../modules/chunking/chunker.factory", () => ({
  chunkText: vi.fn(),
}));

vi.mock("../modules/embeddings", () => ({
  embedChunks: vi.fn(),
}));

vi.mock("../services/vectorStore", () => ({
  upsertVectors: vi.fn(),
}));

vi.mock("../services/llm", () => ({
  generateDocumentSummary: vi.fn(),
  extractDocumentMetadata: vi.fn(),
  generateChunkContext: vi.fn(),
}));

vi.mock("../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { prisma } from "../utils/prisma";
import { chunkText } from "../modules/chunking/chunker.factory";
import { embedChunks } from "../modules/embeddings";
import { upsertVectors } from "../services/vectorStore";
import {
  generateDocumentSummary,
  extractDocumentMetadata,
  generateChunkContext,
} from "../services/llm";
import { processTextIngestion } from "../modules/ingestion/ingestion.service";

describe("Summary Indexing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates summary and indexes it as a vector", async () => {
    vi.mocked(chunkText).mockReturnValue([
      { text: "First chunk of text", startIndex: 0 },
      { text: "Second chunk of text", startIndex: 100 },
    ]);

    vi.mocked(generateDocumentSummary).mockResolvedValue(
      "This document is a contract between Party A and Party B."
    );

    vi.mocked(extractDocumentMetadata).mockResolvedValue({
      topics: ["contract", "legal"],
      entities: ["Party A", "Party B"],
      contentType: "contract",
      language: "en",
    });

    vi.mocked(generateChunkContext).mockResolvedValue(
      "This chunk discusses the main terms."
    );

    vi.mocked(embedChunks).mockResolvedValue([
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
      [0.7, 0.8, 0.9],
    ]);

    await processTextIngestion("user-1", "doc-1", "Full document text", 2);

    expect(generateDocumentSummary).toHaveBeenCalledWith("Full document text");

    expect(extractDocumentMetadata).toHaveBeenCalledWith(
      "Full document text",
      "doc-1"
    );

    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doc-1" },
        data: expect.objectContaining({
          summary: "This document is a contract between Party A and Party B.",
          metadata: {
            topics: ["contract", "legal"],
            entities: ["Party A", "Party B"],
            contentType: "contract",
            language: "en",
          },
        }),
      })
    );

    const vectors = vi.mocked(upsertVectors).mock.calls[0][1];
    expect(vectors).toHaveLength(3);

    const summaryVector = vectors[2];
    expect(summaryVector.id).toBe("doc-1_summary");
    expect(summaryVector.metadata).toEqual(
      expect.objectContaining({
        isSummary: true,
        text: "This document is a contract between Party A and Party B.",
      })
    );
  });

  it("continues without summary if generation fails", async () => {
    vi.mocked(chunkText).mockReturnValue([
      { text: "Chunk text", startIndex: 0 },
    ]);

    vi.mocked(generateDocumentSummary).mockRejectedValue(
      new Error("LLM timeout")
    );

    vi.mocked(extractDocumentMetadata).mockRejectedValue(
      new Error("LLM timeout")
    );

    vi.mocked(embedChunks).mockResolvedValue([[0.1, 0.2, 0.3]]);

    await processTextIngestion("user-1", "doc-1", "Document text", 1);

    const vectors = vi.mocked(upsertVectors).mock.calls[0][1];
    expect(vectors).toHaveLength(1);

    expect(vectors[0].metadata).toEqual(
      expect.objectContaining({
        isSummary: false,
      })
    );

    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doc-1" },
        data: expect.objectContaining({
          summary: null,
          metadata: null,
        }),
      })
    );
  });

  it("embeds summary alongside chunk vectors", async () => {
    vi.mocked(chunkText).mockReturnValue([
      { text: "Chunk one", startIndex: 0 },
      { text: "Chunk two", startIndex: 50 },
    ]);

    vi.mocked(generateDocumentSummary).mockResolvedValue("Summary text");

    vi.mocked(extractDocumentMetadata).mockResolvedValue({
      topics: ["test"],
      entities: [],
      contentType: "other",
      language: "en",
    });

    vi.mocked(generateChunkContext).mockResolvedValue("Context sentence.");

    vi.mocked(embedChunks).mockResolvedValue([
      [0.1, 0.2],
      [0.3, 0.4],
      [0.5, 0.6],
    ]);

    await processTextIngestion("user-1", "doc-1", "Full text", 1);

    expect(embedChunks).toHaveBeenCalledTimes(2);

    expect(vi.mocked(embedChunks).mock.calls[0][0]).toEqual([
      "Context sentence.\n\nChunk one",
      "Context sentence.\n\nChunk two",
    ]);

    expect(vi.mocked(embedChunks).mock.calls[1][0]).toEqual(["Summary text"]);
  });
});

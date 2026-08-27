import { describe, expect, it, vi } from "vitest";
import { retrieveRelevantChunks, extractKeywords } from "../services/retriever";
import { prisma } from "../utils/prisma";

vi.mock("../services/vectorStore", () => ({
  queryVectors: vi.fn(async () => []), // no vector hits — isolates the keyword-search leg
}));

vi.mock("../modules/embeddings", () => ({
  embedQuery: vi.fn(async () => [0.1, 0.2, 0.3]),
}));

vi.mock("../utils/prisma", () => ({
  prisma: {
    chunk: {
      findMany: vi.fn(async () => [
        { id: "c1", text: "The termination clause requires 30 days written notice.", documentId: "doc-1", startIndex: 0, pageNumber: 2 },
        { id: "c2", text: "Payment terms are net 30 with a termination fee.", documentId: "doc-1", startIndex: 100, pageNumber: 3 },
        { id: "c3", text: "General boilerplate about notices and termination only.", documentId: "doc-2", startIndex: 0, pageNumber: 1 },
      ]),
    },
    document: {
      findMany: vi.fn(async () => [
        { id: "doc-1", name: "MSA.pdf" },
        { id: "doc-2", name: "Policy.pdf" },
      ]),
    },
  },
}));

describe("extractKeywords", () => {
  it("drops stopwords and short/duplicate tokens", () => {
    expect(extractKeywords("What is the termination clause?")).toEqual(["termination", "clause"]);
  });

  it("caps the number of keywords", () => {
    const many = "one two three four five six seven eight nine ten eleven twelve";
    expect(extractKeywords(many, 3)).toHaveLength(3);
  });
});

describe("retrieveRelevantChunks keyword search", () => {
  it("finds chunks via significant keywords even though none contain the full question verbatim", async () => {
    // No chunk in the mock contains this exact phrase as a substring — the
    // old `text: { contains: question }` matching would have returned
    // nothing here, silently disabling the keyword-search leg of hybrid
    // search for almost every real question.
    const question = "What is the termination clause in the MSA?";

    const results = await retrieveRelevantChunks("user-1", question, 5);

    expect(results.length).toBeGreaterThan(0);
    // The chunk mentioning termination twice ("termination clause") should
    // rank above the one that only mentions it once via a weaker match.
    expect(results[0].text).toContain("termination clause");
    expect(prisma.document.findMany).toHaveBeenCalled();
  });
});

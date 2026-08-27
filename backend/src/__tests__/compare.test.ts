import { describe, expect, it, vi } from "vitest";
import { compareDocuments } from "../services/compare";
import { prisma } from "../utils/prisma";
import { getSimpleLLMResponse } from "../services/llm";

vi.mock("../utils/prisma", () => ({
  prisma: {
    document: {
      findMany: vi.fn(async () => [
        { id: "doc-a", name: "MSA v1.pdf", chunks: [{ text: "Termination requires 30 days notice." }] },
        { id: "doc-b", name: "MSA v2.pdf", chunks: [{ text: "Termination requires 60 days notice." }] },
      ]),
    },
  },
}));

vi.mock("../services/llm", () => ({
  getSimpleLLMResponse: vi.fn(),
}));

describe("compareDocuments", () => {
  it("falls back to the raw text instead of throwing when the model returns malformed JSON", async () => {
    // Simulates a response truncated mid-JSON by hitting the token cap.
    vi.mocked(getSimpleLLMResponse).mockResolvedValueOnce(
      '{"summary": "The notice period changed from 30 to 60 days.", "differences": [ { "topic": "Termination'
    );

    const result = await compareDocuments("user-1", ["doc-a", "doc-b"]);

    expect(result.differences).toEqual([]);
    expect(result.summary).toContain("notice period changed");
    // Confirms the larger token budget was actually requested for this call.
    expect(getSimpleLLMResponse).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 2048);
  });

  it("returns parsed differences with document names attached on valid JSON", async () => {
    vi.mocked(getSimpleLLMResponse).mockResolvedValueOnce(
      JSON.stringify({
        summary: "Notice period differs.",
        differences: [
          { topic: "Termination", analysis: "60 vs 30 days", docAExcerpt: "30 days", docBExcerpt: "60 days" },
        ],
      })
    );

    const result = await compareDocuments("user-1", ["doc-a", "doc-b"]);

    expect(result.differences).toHaveLength(1);
    expect(result.differences[0].docAName).toBe("MSA v1.pdf");
    expect(result.differences[0].docBName).toBe("MSA v2.pdf");
  });
});

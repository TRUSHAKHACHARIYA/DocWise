import { prisma } from '../utils/prisma';
import { getSimpleLLMResponse } from './llm';

export interface CompareDifference {
  topic: string;
  analysis: string;
  docAExcerpt: string;
  docBExcerpt: string;
  docAName: string;
  docBName: string;
}

export interface CompareResult {
  summary: string;
  differences: CompareDifference[];
}

export async function compareDocuments(
  userId: string,
  documentIds: string[],
  focus?: string
): Promise<CompareResult> {
  if (documentIds.length < 2) {
    throw new Error('Select at least two documents to compare.');
  }

  const documents = await prisma.document.findMany({
    where: { userId, id: { in: documentIds }, status: 'READY' },
    include: {
      chunks: { take: 12, orderBy: { startIndex: 'asc' } },
    },
  });

  if (documents.length < 2) {
    throw new Error('At least two ready documents are required for comparison.');
  }

  const docA = documents[0];
  const docB = documents[1];

  const contextA = docA.chunks.map((c) => c.text).join('\n\n').slice(0, 6000);
  const contextB = docB.chunks.map((c) => c.text).join('\n\n').slice(0, 6000);

  const focusLine = focus ? `Focus the comparison on: ${focus}` : 'Compare obligations, terms, and policy differences.';

  const systemPrompt = `You are DocWise document comparison assistant. Return valid JSON only with this shape:
{
  "summary": "string",
  "differences": [
    {
      "topic": "string",
      "analysis": "string",
      "docAExcerpt": "short quote from doc A",
      "docBExcerpt": "short quote from doc B"
    }
  ]
}
Include 3-6 meaningful differences with cited excerpts. ${focusLine}`;

  const messages = [
    {
      role: 'user' as const,
      content: `DOCUMENT A (${docA.name}):\n${contextA}\n\nDOCUMENT B (${docB.name}):\n${contextB}`,
    },
  ];

  // 3-6 differences with excerpts can run past the default 1024-token cap and
  // get cut off mid-JSON, so this call gets more headroom than a plain chat reply.
  const raw = await getSimpleLLMResponse(systemPrompt, messages, 2048);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      summary: raw,
      differences: [],
    };
  }

  let parsed: {
    summary: string;
    differences: Array<{
      topic: string;
      analysis: string;
      docAExcerpt: string;
      docBExcerpt: string;
    }>;
  };

  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // The model can still truncate or malform JSON even with the larger
    // token budget above — fall back to the raw text instead of throwing.
    return {
      summary: raw,
      differences: [],
    };
  }

  return {
    summary: parsed.summary,
    differences: (parsed.differences || []).map((row) => ({
      ...row,
      docAName: docA.name,
      docBName: docB.name,
    })),
  };
}

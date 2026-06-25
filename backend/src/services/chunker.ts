/**
 * Semantic Text Chunker
 * Splits text into token-sized chunks while preserving semantic boundaries
 * (paragraphs, sentences) and ensuring overlap for context continuity.
 */

export interface Chunk {
  text: string;
  startIndex: number;
}

interface ChunkerOptions {
  maxTokens?: number;
  overlapTokens?: number;
  /** @deprecated Use maxTokens instead */
  maxChunkSize?: number;
  /** @deprecated Use overlapTokens instead */
  overlap?: number;
  separators?: string[];
}

const CHARS_PER_TOKEN = 4;

const DEFAULT_OPTIONS = {
  maxTokens: 512,
  overlapTokens: 64,
  separators: ["\n\n", "\n", ". ", " ", ""],
};

export function estimateTokenCount(text: string): number {
  if (!text) {
    return 0;
  }

  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  const wordEstimate = normalized.split(/\s+/).filter(Boolean).length;
  const charEstimate = Math.ceil(normalized.length / CHARS_PER_TOKEN);
  return Math.max(wordEstimate, charEstimate);
}

function tokensToChars(tokens: number): number {
  return tokens * CHARS_PER_TOKEN;
}

function resolveChunkSizes(options: ChunkerOptions) {
  const { maxTokens, overlapTokens, maxChunkSize, overlap } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return {
    size: maxChunkSize ?? tokensToChars(maxTokens),
    overlap: overlap ?? tokensToChars(overlapTokens),
  };
}

/**
 * Recursively splits text using a list of separators until chunks are within maxChunkSize.
 */
export function chunkText(text: string, options: ChunkerOptions = {}): Chunk[] {
  const { size, overlap } = resolveChunkSizes(options);

  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.replace(/\r\n/g, "\n").trim();
  return slidingWindowChunk(cleanText, size, overlap);
}

/**
 * Sliding window that respects sentence/paragraph boundaries where possible.
 */
function slidingWindowChunk(text: string, size: number, overlap: number): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const previousStart = start;
    let end = Math.min(start + size, text.length);

    if (end < text.length) {
      const minEnd = Math.max(start + (size - overlap), start + Math.floor(size * 0.5));
      const lastNewline = text.lastIndexOf("\n", end);
      const lastPeriod = text.lastIndexOf(". ", end);

      if (lastNewline > minEnd) {
        end = lastNewline + 1;
      } else if (lastPeriod > minEnd) {
        end = lastPeriod + 2;
      } else {
        const lastSpace = text.lastIndexOf(" ", end);
        if (lastSpace > minEnd) {
          end = lastSpace + 1;
        }
      }
    }

    const content = text.substring(start, end).trim();
    if (content.length > 5) {
      chunks.push({ text: content, startIndex: start });
    }

    if (end >= text.length) {
      break;
    }

    let nextStart = end - overlap;
    if (nextStart <= previousStart) {
      nextStart = previousStart + 1;
    }
    start = nextStart;

    if (start >= text.length) {
      break;
    }
  }

  return chunks;
}

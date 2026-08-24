/**
 * Shared chunk types and token estimation utilities.
 */

export interface Chunk {
  text: string;
  startIndex: number;
  pageNumber?: number;
}

export interface ChunkerOptions {
  maxTokens?: number;
  overlapTokens?: number;
  /** @deprecated Use maxTokens instead */
  maxChunkSize?: number;
  /** @deprecated Use overlapTokens instead */
  overlap?: number;
  separators?: string[];
  strategy?: ChunkingStrategyType;
}

export type ChunkingStrategyType = 'fixed' | 'recursive' | 'document';

export const CHARS_PER_TOKEN = 4;

export const DEFAULT_CHUNKER_OPTIONS = {
  maxTokens: 512,
  overlapTokens: 64,
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

export function tokensToChars(tokens: number): number {
  return tokens * CHARS_PER_TOKEN;
}

export function resolveChunkSizes(options: ChunkerOptions): { size: number; overlap: number } {
  const { maxTokens, overlapTokens, maxChunkSize, overlap } = {
    ...DEFAULT_CHUNKER_OPTIONS,
    ...options,
  };

  return {
    size: maxChunkSize ?? tokensToChars(maxTokens),
    overlap: overlap ?? tokensToChars(overlapTokens),
  };
}

import { Chunk, ChunkerOptions, resolveChunkSizes } from '../chunk.types';
import { ChunkerStrategy } from '../chunker.interface';

/**
 * Sliding-window chunker that respects sentence/paragraph boundaries
 * where possible. This is the original DocWise strategy and the default.
 */
export class FixedChunker implements ChunkerStrategy {
  readonly name = 'fixed';

  chunk(text: string, options: ChunkerOptions = {}): Chunk[] {
    const { size, overlap } = resolveChunkSizes(options);

    if (!text || text.trim().length === 0) {
      return [];
    }

    const cleanText = text.replace(/\r\n/g, "\n").trim();
    return this.slidingWindowChunk(cleanText, size, overlap);
  }

  private slidingWindowChunk(text: string, size: number, overlap: number): Chunk[] {
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
}

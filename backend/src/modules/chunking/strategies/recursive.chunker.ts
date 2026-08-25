import { Chunk, ChunkerOptions, resolveChunkSizes } from '../chunk.types';
import { ChunkerStrategy } from '../chunker.interface';

/**
 * Recursive character chunker: splits text down a hierarchy of separators
 * (paragraphs, lines, sentences, words) until every piece fits within
 * the max size, then merges adjacent small pieces back up to size.
 */
export class RecursiveChunker implements ChunkerStrategy {
  readonly name = 'recursive';

  private separators: string[] = ['\n\n', '\n', '. ', ' ', ''];
  private size = 2048;
  private overlap = 256;

  chunk(text: string, options: ChunkerOptions = {}): Chunk[] {
    const { size, overlap } = resolveChunkSizes(options);
    if (options.separators && options.separators.length > 0) {
      this.separators = options.separators;
    }
    this.size = size;
    this.overlap = overlap;

    if (!text || text.trim().length === 0) {
      return [];
    }

    const cleanText = text.replace(/\r\n/g, '\n').trim();
    const pieces = this.splitRecursive(cleanText, 0);

    return this.mergePieces(pieces);
  }

  /**
   * Recursively split `text` by the separator hierarchy.
   * Returns flat pieces with their absolute start offsets.
   */
  private splitRecursive(text: string, offset: number, separatorIndex = 0): { text: string; startIndex: number }[] {
    if (text.length <= this.size) {
      return text.trim().length > 0 ? [{ text: text.trim(), startIndex: offset + (text.length - text.trimStart().length) }] : [];
    }

    if (separatorIndex >= this.separators.length) {
      // No separators left: hard-split by size.
      return this.hardSplit(text, offset);
    }

    const separator = this.separators[separatorIndex];

    if (separator === '') {
      return this.hardSplit(text, offset);
    }

    const parts = text.split(separator);
    if (parts.length === 1) {
      // Separator not present; try the next one.
      return this.splitRecursive(text, offset, separatorIndex + 1);
    }

    const pieces: { text: string; startIndex: number }[] = [];
    let cursor = offset;

    for (const part of parts) {
      if (part.length === 0) {
        cursor += separator.length;
        continue;
      }

      if (part.length > this.size) {
        pieces.push(...this.splitRecursive(part, cursor, separatorIndex + 1));
      } else {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          pieces.push({ text: trimmed, startIndex: cursor + (part.length - part.trimStart().length) });
        }
      }

      cursor += part.length + separator.length;
    }

    return pieces;
  }

  private hardSplit(text: string, offset: number): { text: string; startIndex: number }[] {
    const pieces: { text: string; startIndex: number }[] = [];
    let start = 0;

    while (start < text.length) {
      const piece = text.substring(start, start + this.size).trim();
      if (piece.length > 0) {
        pieces.push({ text: piece, startIndex: offset + start });
      }
      start += this.size;
    }

    return pieces;
  }

  /**
   * Merge adjacent pieces into chunks up to `size`, carrying a tail
   * overlap from the previous chunk for context continuity.
   */
  private mergePieces(pieces: { text: string; startIndex: number }[]): Chunk[] {
    const chunks: Chunk[] = [];
    let current: string[] = [];
    let currentLength = 0;
    let currentStart = pieces[0]?.startIndex ?? 0;

    const flush = () => {
      if (current.length === 0) {
        return;
      }
      const joined = current.join(' ').trim();
      if (joined.length > 5) {
        chunks.push({ text: joined, startIndex: currentStart });
      }
      current = [];
      currentLength = 0;
    };

    for (const piece of pieces) {
      if (currentLength === 0) {
        currentStart = piece.startIndex;
      }

      if (currentLength + piece.text.length + 1 > this.size && current.length > 0) {
        flush();

        // Carry overlap tail into the next chunk.
        const lastJoined = chunks[chunks.length - 1]?.text ?? '';
        if (this.overlap > 0 && lastJoined.length > 0) {
          const tail = lastJoined.slice(-this.overlap);
          const boundary = tail.search(/[.!?] |\. |\n/);
          const overlapTail = boundary >= 0 ? tail.slice(boundary + 1).trim() : tail.trim();
          if (overlapTail.length > 5) {
            current.push(overlapTail);
            currentLength = overlapTail.length;
            currentStart = Math.max(piece.startIndex - overlapTail.length, 0);
          }
        }
      }

      current.push(piece.text);
      currentLength += piece.text.length + 1;
    }

    flush();

    return chunks;
  }
}

import { Chunk, ChunkerOptions, resolveChunkSizes } from '../chunk.types';
import { ChunkerStrategy } from '../chunker.interface';
import { DocumentSection } from '../../ingestion/parsers/parser.types';
import { FixedChunker } from './fixed.chunker';

const HEADING_PATTERNS: RegExp[] = [
  /^#{1,6}\s+.+$/,                       // Markdown ATX headings
  /^\d+(\.\d+)*\.?\s+\S.{0,120}$/m,      // Numbered headings: "1.2 Overview"
  /^[A-Z][A-Z0-9 \-/&,()']{3,80}$/m,     // ALL CAPS headings
];

/**
 * Structure-aware chunker: splits text on detected section boundaries
 * first (headings), then applies fixed-size chunking within each section.
 * Falls back to plain fixed chunking when no headings are found.
 */
export class DocumentChunker implements ChunkerStrategy {
  readonly name = 'document';

  private fallback = new FixedChunker();

  chunk(text: string, options: ChunkerOptions = {}): Chunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const cleanText = text.replace(/\r\n/g, '\n').trim();
    const sections = this.detectSections(cleanText);

    if (sections.length <= 1) {
      return this.fallback.chunk(cleanText, options);
    }

    const { size } = resolveChunkSizes(options);
    const chunks: Chunk[] = [];

    for (const section of sections) {
      const headerOffset = section.title ? `${section.title}\n\n`.length : 0;
      const sectionBody = `${section.title ? `${section.title}\n\n` : ''}${section.content}`;

      if (sectionBody.length <= size * 1.5) {
        chunks.push({ text: sectionBody.trim(), startIndex: section.startIndex });
        continue;
      }

      const sectionChunks = this.fallback.chunk(section.content, options);
      for (const piece of sectionChunks) {
        chunks.push({
          text: `${section.title ? `${section.title}: ` : ''}${piece.text}`.trim(),
          startIndex: section.startIndex + headerOffset + piece.startIndex,
        });
      }
    }

    return chunks;
  }

  /**
   * Detect sections using markdown/numbered/caps heading patterns.
   */
  detectSections(text: string): DocumentSection[] {
    const lines = text.split('\n');
    const boundaries: { lineIndex: number; title: string; level: number; startIndex: number }[] = [];

    let charCursor = 0;
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      if (/^```/.test(line)) {
        inCodeBlock = !inCodeBlock;
      }
      if (!inCodeBlock && this.isHeading(line, index, lines)) {
        boundaries.push({
          lineIndex: index,
          title: line.trim(),
          level: this.headingLevel(line),
          startIndex: charCursor,
        });
      }
      charCursor += line.length + 1;
    });

    if (boundaries.length === 0) {
      return [{ title: '', level: 0, content: text, startIndex: 0 }];
    }

    // Drop a boundary at position 0 (it is just the document title).
    const effectiveBoundaries = boundaries[0]?.lineIndex === 0
      ? boundaries
      : [{ lineIndex: 0, title: '', level: 1, startIndex: 0 }, ...boundaries];

    const sections: DocumentSection[] = [];

    for (let i = 0; i < effectiveBoundaries.length; i++) {
      const startLine = effectiveBoundaries[i].lineIndex;
      const endLine = i + 1 < effectiveBoundaries.length ? effectiveBoundaries[i + 1].lineIndex : lines.length;

      const content = lines.slice(startLine + (effectiveBoundaries[i].title ? 1 : 0), endLine).join('\n').trim();
      if (content.length === 0 && !effectiveBoundaries[i].title) {
        continue;
      }

      sections.push({
        title: effectiveBoundaries[i].title,
        level: effectiveBoundaries[i].level,
        content,
        startIndex: effectiveBoundaries[i].startIndex,
      });
    }

    return sections.length > 0 ? sections : [{ title: '', level: 0, content: text, startIndex: 0 }];
  }

  private isHeading(line: string, index: number, lines: string[]): boolean {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.length > 121) {
      return false;
    }

    // Markdown headings are unambiguous.
    if (/^#{1,6}\s+/.test(trimmed)) {
      return true;
    }

    const nextLine = (lines[index + 1] ?? '').trim();

    for (const pattern of HEADING_PATTERNS.slice(1)) {
      if (pattern.test(trimmed)) {
        // Headings are usually followed by blank line or content, and do not end with sentence punctuation.
        if (/[.!?,;:]$/.test(trimmed)) {
          continue;
        }
        if (nextLine.length === 0 || nextLine.length > 0) {
          // Require the line to be relatively short compared to body text.
          const wordCount = trimmed.split(/\s+/).length;
          if (wordCount <= 15) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private headingLevel(line: string): number {
    const trimmed = line.trim();
    const mdMatch = trimmed.match(/^(#{1,6})\s+/);
    if (mdMatch) {
      return mdMatch[1].length;
    }

    const numbered = trimmed.match(/^(\d+(?:\.\d+)*)\.?\s/);
    if (numbered) {
      return Math.min(numbered[1].split('.').length, 6);
    }

    return 1;
  }
}

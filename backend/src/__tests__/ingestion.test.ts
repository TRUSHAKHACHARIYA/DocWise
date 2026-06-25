import { describe, it, expect } from 'vitest';
import { chunkText, estimateTokenCount } from '../services/chunker';
import { isLikelyScannedPdf } from '../services/parser';

describe('Document Ingestion Pipeline', () => {
  describe('Chunker Service', () => {
    it('should chunk text correctly based on token size', () => {
      const longText = 'This is a test sentence. '.repeat(100);
      const chunks = chunkText(longText);

      expect(chunks.length).toBeGreaterThan(1);
      expect(estimateTokenCount(chunks[0].text)).toBeLessThanOrEqual(560);
    });

    it('should handle empty text gracefully', () => {
      const chunks = chunkText('');
      expect(chunks).toHaveLength(0);
    });

    it('should maintain text integrity across chunks', () => {
      const originalText = 'Section one content. Section two content. Section three content.';
      const chunks = chunkText(originalText);

      const combinedText = chunks.map((c) => c.text).join(' ');
      expect(combinedText).toContain('Section one');
      expect(combinedText).toContain('Section three');
    });

    it('should estimate token counts conservatively', () => {
      const text = 'word '.repeat(100).trim();
      const tokens = estimateTokenCount(text);
      expect(tokens).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Parser heuristics', () => {
    it('detects likely scanned PDFs with little text per page', () => {
      expect(isLikelyScannedPdf('short', 10)).toBe(true);
      expect(isLikelyScannedPdf('x'.repeat(500), 10)).toBe(false);
    });
  });
});

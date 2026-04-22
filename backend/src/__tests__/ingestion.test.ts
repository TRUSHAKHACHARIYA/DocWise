import { describe, it, expect, vi } from 'vitest';
import { chunkText } from '../services/chunker';

describe('Document Ingestion Pipeline', () => {
  describe('Chunker Service', () => {
    it('should chunk text correctly based on size', () => {
      // Create a long text string
      const longText = 'This is a test sentence. '.repeat(100);
      const chunks = chunkText(longText);
      
      expect(chunks.length).toBeGreaterThan(1);
      // Default chunk size is ~2000 chars (500 tokens * 4)
      expect(chunks[0].text.length).toBeLessThanOrEqual(2200);
    });

    it('should handle empty text gracefully', () => {
      const chunks = chunkText('');
      expect(chunks).toHaveLength(0);
    });

    it('should maintain text integrity across chunks', () => {
      const originalText = 'Section one content. Section two content. Section three content.';
      // Force smaller chunks for testing if needed, but using default for now
      const chunks = chunkText(originalText);
      
      const combinedText = chunks.map(c => c.text).join(' ');
      expect(combinedText).toContain('Section one');
      expect(combinedText).toContain('Section three');
    });
  });
});

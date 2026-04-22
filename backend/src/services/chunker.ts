/**
 * Semantic Text Chunker
 * Splits text into chunks while attempting to preserve semantic boundaries 
 * (paragraphs, sentences) and ensuring overlap for context continuity.
 */

export interface Chunk {
  text: string;
  startIndex: number;
}

interface ChunkerOptions {
  maxChunkSize?: number; // In characters (approximation of tokens)
  overlap?: number;      // In characters
  separators?: string[]; // Priority-ordered separators
}

const DEFAULT_OPTIONS = {
  maxChunkSize: 1500, // ~430 tokens (at 3.5 chars/token)
  overlap: 200,       // ~57 tokens
  separators: ["\n\n", "\n", ". ", " ", ""],
};

/**
 * Recursively splits text using a list of separators until chunks are within maxChunkSize.
 */
export function chunkText(
  text: string, 
  options: ChunkerOptions = {}
): Chunk[] {
  const { maxChunkSize, overlap, separators } = { ...DEFAULT_OPTIONS, ...options };
  
  if (!text || text.trim().length === 0) return [];

  const cleanText = text.replace(/\r\n/g, "\n").trim();
  const chunks: Chunk[] = [];

  function split(content: string, offset: number, separatorIndex: number) {
    // If content is already small enough, just add it
    if (content.length <= maxChunkSize) {
      if (content.trim().length > 0) {
        chunks.push({ text: content.trim(), startIndex: offset });
      }
      return;
    }

    // Attempt to split by current separator
    const separator = separators[separatorIndex];
    const parts = content.split(separator);
    
    let currentChunk = "";
    let currentOffset = offset;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const partWithSep = i < parts.length - 1 ? part + separator : part;

      // If a single part (even after splitting) is still too big, dive deeper
      if (partWithSep.length > maxChunkSize) {
        // If we have more separators, use the next one
        if (separatorIndex < separators.length - 1) {
          // Flush current chunk first
          if (currentChunk) {
            chunks.push({ text: currentChunk.trim(), startIndex: currentOffset });
            currentOffset += currentChunk.length;
            currentChunk = "";
          }
          split(partWithSep, currentOffset, separatorIndex + 1);
          currentOffset += partWithSep.length;
        } else {
          // Force split by character if no more separators
          let subPos = 0;
          while (subPos < partWithSep.length) {
            const subContent = partWithSep.substring(subPos, subPos + maxChunkSize);
            chunks.push({ text: subContent.trim(), startIndex: currentOffset + subPos });
            subPos += (maxChunkSize - overlap);
          }
          currentOffset += partWithSep.length;
        }
      } else {
        // If adding this part exceeds max size, flush current and start fresh
        if ((currentChunk + partWithSep).length > maxChunkSize) {
          if (currentChunk) {
            chunks.push({ text: currentChunk.trim(), startIndex: currentOffset });
            // For the next chunk, we want some overlap
            // We move back from the current position by 'overlap'
            currentOffset += (currentChunk.length - overlap);
            
            // Re-calculate the currentChunk starting with overlap
            // This is a simplified overlap logic for recursive splitting
            currentChunk = content.substring(currentOffset - offset, currentOffset - offset + partWithSep.length);
          } else {
            currentChunk = partWithSep;
          }
        } else {
          currentChunk += partWithSep;
        }
      }
    }

    // Final flush
    if (currentChunk.trim().length > 0) {
      chunks.push({ text: currentChunk.trim(), startIndex: currentOffset });
    }
  }

  // Use a simpler sliding window for most cases to ensure consistent overlap
  return slidingWindowChunk(cleanText, maxChunkSize, overlap);
}

/**
 * More robust sliding window that respects sentence/paragraph boundaries where possible.
 */
function slidingWindowChunk(text: string, size: number, overlap: number): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const previousStart = start;
    let end = Math.min(start + size, text.length);
    
    // If not at the very end, try to find a natural break point (paragraph, sentence, etc)
    if (end < text.length) {
      // Look for a break point within the overlap zone
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

    // Reached the end of text, stop to avoid tail-loop churn.
    if (end >= text.length) {
      break;
    }

    // Move start forward, ensuring we don't get stuck in an infinite loop
    // and maintain the requested overlap as a maximum.
    let nextStart = end - overlap;
    if (nextStart <= previousStart) {
      nextStart = previousStart + 1;
    }
    start = nextStart;
    
    if (start >= text.length) break;
  }

  return chunks;
}

/**
 * A basic text chunker to split long text into overlapping chunks.
 * We'll use a token approximation: 1 token ≈ 4 characters.
 * 
 * Target size: 512 tokens (~2048 characters)
 * Overlap: 64 tokens (~256 characters)
 */

export interface Chunk {
  text: string;
  startIndex: number;
}

export function chunkText(text: string, maxTokens = 512, overlapTokens = 64): Chunk[] {
  // Approximate length by characters
  const chunkSize = maxTokens * 4;
  const chunkOverlap = overlapTokens * 4;
  const step = chunkSize - chunkOverlap;

  if (step <= 0) {
    throw new Error('Overlap must be strictly smaller than maxTokens.');
  }
  
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let startIndex = 0;

  // Cleanup excessive whitespace/newlines without removing paragraph structures entirely
  const cleanText = text.replace(/(\r\n|\n|\r)+/g, '\n').trim();

  while (startIndex < cleanText.length) {
    // Determine the end index of the current chunk
    let endIndex = startIndex + chunkSize;

    // If we haven't reached the end of the text, try to find a natural break point
    if (endIndex < cleanText.length) {
      // Look for a newline or period to break smoothly (search backwards in the overlap region)
      let breakIndex = -1;
      
      // We look back within a window (e.g. up to 1/3 of the chunk size) to find a nice boundary
      const searchWindowStart = Math.max(startIndex, endIndex - chunkSize / 3);
      
      const newlineBreak = cleanText.lastIndexOf('\n', endIndex);
      if (newlineBreak > searchWindowStart) breakIndex = newlineBreak;
      else {
        const periodBreak = cleanText.lastIndexOf('. ', endIndex);
        if (periodBreak > searchWindowStart) breakIndex = periodBreak + 1; // include period
        else {
          const spaceBreak = cleanText.lastIndexOf(' ', endIndex);
          if (spaceBreak > searchWindowStart) breakIndex = spaceBreak;
        }
      }

      if (breakIndex !== -1) {
        endIndex = breakIndex;
      }
    }

    const chunkContent = cleanText.substring(startIndex, endIndex).trim();
    if (chunkContent.length > 0) {
      chunks.push({
        text: chunkContent,
        startIndex
      });
    }

    // Move start index for next chunk
    startIndex = endIndex - chunkOverlap;
    
    // In case there was no overlap due to a break condition falling before the overlap bound
    // we make sure we always advance forward, preventing infinity loops
    if (startIndex <= chunks[chunks.length - 1].startIndex) {
      startIndex = endIndex;
    }
  }

  return chunks;
}

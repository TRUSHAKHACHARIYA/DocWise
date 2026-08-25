import { Chunk, ChunkerOptions } from './chunk.types';

/**
 * A chunking strategy converts raw text into chunks.
 */
export interface ChunkerStrategy {
  readonly name: string;
  chunk(text: string, options?: ChunkerOptions): Chunk[];
}

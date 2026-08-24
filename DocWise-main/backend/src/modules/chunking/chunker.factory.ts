import { Chunk, ChunkerOptions } from './chunk.types';
import { ChunkerStrategy } from './chunker.interface';
import { FixedChunker } from './strategies/fixed.chunker';
import { RecursiveChunker } from './strategies/recursive.chunker';
import { DocumentChunker } from './strategies/document.chunker';
import { env } from '../../config/env';

/**
 * Creates a chunking strategy instance by type.
 */
export function createChunker(type: 'fixed' | 'recursive' | 'document' = 'fixed'): ChunkerStrategy {
  switch (type) {
    case 'recursive':
      return new RecursiveChunker();
    case 'document':
      return new DocumentChunker();
    case 'fixed':
    default:
      return new FixedChunker();
  }
}

function resolveStrategyType(options?: ChunkerOptions): 'fixed' | 'recursive' | 'document' {
  const configured = (env.CHUNKING_STRATEGY as string) || '';
  if (configured === 'recursive' || configured === 'document' || configured === 'fixed') {
    return configured;
  }
  return options?.strategy ?? 'fixed';
}

export function chunkText(text: string, options: ChunkerOptions = {}): Chunk[] {
  const chunker = createChunker(resolveStrategyType(options));
  return chunker.chunk(text, options);
}

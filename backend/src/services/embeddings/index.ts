/**
 * Embedding Provider Interface
 * Allows swapping between different embedding providers without changing application code
 */

export interface EmbeddingProvider {
  /**
   * Generate embeddings for multiple text chunks
   */
  embedChunks(chunks: string[]): Promise<number[][]>;
  
  /**
   * Generate embedding for a single query
   */
  embedQuery(query: string): Promise<number[]>;
  
  /**
   * Get the dimension of embeddings produced by this provider
   */
  getDimensions(): number;
  
  /**
   * Get the name/model identifier for this provider
   */
  getModelName(): string;
}

export type EmbeddingProviderType = 'openai' | 'anthropic' | 'cohere';

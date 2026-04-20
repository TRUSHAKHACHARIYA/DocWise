import { getDefaultEmbeddingProvider } from './embeddings/factory';

// Get the configured embedding provider
const embeddingProvider = getDefaultEmbeddingProvider();

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  return await embeddingProvider.embedChunks(chunks);
}

export async function embedQuery(query: string): Promise<number[]> {
  return await embeddingProvider.embedQuery(query);
}

// Export the provider for advanced use cases
export { embeddingProvider };

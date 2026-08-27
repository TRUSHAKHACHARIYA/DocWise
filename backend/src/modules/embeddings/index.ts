import { getDefaultEmbeddingProvider } from './embedding.factory';
import { logger } from '../../utils/logger';

let embeddingProvider: ReturnType<typeof getDefaultEmbeddingProvider>;

try {
  embeddingProvider = getDefaultEmbeddingProvider();
  logger.info(`Embedding provider initialized: ${embeddingProvider.getModelName()} (${embeddingProvider.getDimensions()}d)`);
} catch (error: any) {
  logger.error(`Embedding provider initialization failed: ${error.message}`);
  throw error;
}

// Every provider's embedChunks() sends the whole array as one request. A large
// document can produce enough chunks to exceed a provider's per-request
// input-array or token limit (e.g. Cohere embed v3 caps at 96 texts, Voyage
// at 128), which fails deterministically on every retry. Batch defensively
// so large documents still embed successfully.
const EMBEDDING_BATCH_SIZE = 64;

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  if (chunks.length <= EMBEDDING_BATCH_SIZE) {
    return await embeddingProvider.embedChunks(chunks);
  }

  const results: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    results.push(...await embeddingProvider.embedChunks(batch));
  }
  return results;
}

export async function embedQuery(query: string): Promise<number[]> {
  return await embeddingProvider.embedQuery(query);
}

export { embeddingProvider };

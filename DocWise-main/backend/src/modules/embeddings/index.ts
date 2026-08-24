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

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  return await embeddingProvider.embedChunks(chunks);
}

export async function embedQuery(query: string): Promise<number[]> {
  return await embeddingProvider.embedQuery(query);
}

export { embeddingProvider };

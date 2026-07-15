import { EmbeddingProvider, EmbeddingProviderType } from './index';
import { OpenAIEmbeddingProvider } from './openai';
import { AnthropicEmbeddingProvider } from './anthropic';
import { CohereEmbeddingProvider } from './cohere';
import { env } from '../../config/env';

/**
 * Factory function to create embedding providers based on configuration
 */
export function createEmbeddingProvider(type: EmbeddingProviderType = 'openai'): EmbeddingProvider {
  switch (type) {
    case 'openai':
      if (!env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for OpenAI embedding provider');
      }
      return new OpenAIEmbeddingProvider(
        env.OPENAI_API_KEY,
        env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
      );
    
    case 'anthropic':
      if (!env.VOYAGE_API_KEY) {
        throw new Error('VOYAGE_API_KEY is required for Anthropic/Voyage embedding provider');
      }
      return new AnthropicEmbeddingProvider(
        env.VOYAGE_API_KEY,
        env.VOYAGE_EMBEDDING_MODEL || 'voyage-3'
      );
    
    case 'cohere':
      if (!env.COHERE_API_KEY) {
        throw new Error('COHERE_API_KEY is required for Cohere embedding provider');
      }
      return new CohereEmbeddingProvider(
        env.COHERE_API_KEY,
        env.COHERE_EMBEDDING_MODEL || 'embed-multilingual-v3.0'
      );
    
    default:
      throw new Error(`Unsupported embedding provider type: ${type}`);
  }
}

/**
 * Get the default embedding provider from environment configuration
 */
export function getDefaultEmbeddingProvider(): EmbeddingProvider {
  const providerType = (env.EMBEDDING_PROVIDER as EmbeddingProviderType) || 'openai';
  return createEmbeddingProvider(providerType);
}

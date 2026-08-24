import { EmbeddingProvider, EmbeddingProviderType } from './embedding.interface';
import { OpenAIEmbeddingProvider } from './openai.embedding';
import { AnthropicEmbeddingProvider } from './anthropic.embedding';
import { CohereEmbeddingProvider } from './cohere.embedding';
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
      if (!env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is required for Anthropic embedding provider');
      }
      return new AnthropicEmbeddingProvider(
        env.ANTHROPIC_API_KEY,
        env.ANTHROPIC_EMBEDDING_MODEL || 'claude-embedding-3'
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

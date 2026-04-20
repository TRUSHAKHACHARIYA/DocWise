import { EmbeddingProvider } from './index';

/**
 * Anthropic Embedding Provider
 * Currently a placeholder implementation since Anthropic doesn't have a public embedding API yet
 * This will be ready when Anthropic releases their embedding API
 */

export class AnthropicEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-embedding-3') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async embedChunks(chunks: string[]): Promise<number[][]> {
    // TODO: Implement when Anthropic releases embedding API
    throw new Error('Anthropic embedding API is not yet available. Please use OpenAI provider for now.');
  }

  async embedQuery(query: string): Promise<number[]> {
    // TODO: Implement when Anthropic releases embedding API
    throw new Error('Anthropic embedding API is not yet available. Please use OpenAI provider for now.');
  }

  getDimensions(): number {
    // Placeholder - actual dimensions will depend on Anthropic's implementation
    return 1536;
  }

  getModelName(): string {
    return this.model;
  }
}

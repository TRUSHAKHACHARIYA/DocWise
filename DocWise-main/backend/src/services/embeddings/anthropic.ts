import { EmbeddingProvider } from './index';
import axios from 'axios';
import { logger } from '../../utils/logger';

/**
 * Voyage AI Embedding Provider
 * Named "Anthropic" in the codebase because Anthropic recommends Voyage AI
 * for embeddings that complement Claude's reasoning capabilities.
 * Uses VOYAGE_API_KEY, not ANTHROPIC_API_KEY.
 */
export class AnthropicEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'voyage-3') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async embedChunks(chunks: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        'https://api.voyageai.com/v1/embeddings',
        {
          input: chunks,
          model: this.model,
          input_type: 'document',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data.map((item: any) => item.embedding);
    } catch (error: any) {
      logger.error('Voyage embedding failed', { error: error.response?.data || error.message });
      throw new Error(`Failed to generate Voyage embeddings: ${error.message}`);
    }
  }

  async embedQuery(query: string): Promise<number[]> {
    try {
      const response = await axios.post(
        'https://api.voyageai.com/v1/embeddings',
        {
          input: [query],
          model: this.model,
          input_type: 'query',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data[0].embedding;
    } catch (error: any) {
      logger.error('Voyage query embedding failed', { error: error.response?.data || error.message });
      throw new Error(`Failed to generate Voyage query embeddings: ${error.message}`);
    }
  }

  getDimensions(): number {
    return 1024;
  }

  getModelName(): string {
    return this.model;
  }
}

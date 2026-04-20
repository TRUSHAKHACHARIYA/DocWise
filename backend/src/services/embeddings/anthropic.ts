import { EmbeddingProvider } from './index';
import axios from 'axios';

/**
 * Anthropic-aligned Embedding Provider (via Voyage AI)
 * Anthropic officially recommends Voyage AI for high-quality embeddings that
 * complement Claude's reasoning capabilities.
 */
export class AnthropicEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'voyage-2') {
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
      console.error('Voyage (Anthropic) embedding failed:', error.response?.data || error.message);
      throw new Error(`Failed to generate Anthropic-aligned embeddings: ${error.message}`);
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
      console.error('Voyage (Anthropic) query embedding failed:', error.response?.data || error.message);
      throw new Error(`Failed to generate Anthropic-aligned query embedding: ${error.message}`);
    }
  }

  getDimensions(): number {
    return 1024; // Voyage-2 dimension
  }

  getModelName(): string {
    return this.model;
  }
}

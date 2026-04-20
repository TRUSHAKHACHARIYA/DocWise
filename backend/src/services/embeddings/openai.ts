import OpenAI from 'openai';
import { EmbeddingProvider } from './index';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async embedChunks(chunks: string[]): Promise<number[][]> {
    const result = await this.client.embeddings.create({
      model: this.model,
      input: chunks,
    });

    return result.data.map(d => d.embedding);
  }

  async embedQuery(query: string): Promise<number[]> {
    const result = await this.client.embeddings.create({
      model: this.model,
      input: query,
    });

    return result.data[0].embedding;
  }

  getDimensions(): number {
    // text-embedding-3-small: 1536, text-embedding-3-large: 3072, text-embedding-ada-002: 1536
    switch (this.model) {
      case 'text-embedding-3-small':
      case 'text-embedding-ada-002':
        return 1536;
      case 'text-embedding-3-large':
        return 3072;
      default:
        return 1536;
    }
  }

  getModelName(): string {
    return this.model;
  }
}

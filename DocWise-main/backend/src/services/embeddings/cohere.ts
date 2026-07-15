import { Cohere } from 'cohere-ai';
import { EmbeddingProvider } from './index';

export class CohereEmbeddingProvider implements EmbeddingProvider {
  private client: any;
  private model: string;

  constructor(apiKey: string, model: string = 'embed-multilingual-v3.0') {
    this.client = new (Cohere as any)({ apiKey });
    this.model = model;
  }

  async embedChunks(chunks: string[]): Promise<number[][]> {
    const result = await this.client.embed({
      texts: chunks,
      model: this.model,
      inputType: 'search_document'
    });

    return result.embeddings as number[][];
  }

  async embedQuery(query: string): Promise<number[]> {
    const result = await this.client.embed({
      texts: [query],
      model: this.model,
      inputType: 'search_query'
    });

    return result.embeddings[0] as number[];
  }

  getDimensions(): number {
    // embed-multilingual-v3.0: 1024, embed-english-v3.0: 1024
    return 1024;
  }

  getModelName(): string {
    return this.model;
  }
}

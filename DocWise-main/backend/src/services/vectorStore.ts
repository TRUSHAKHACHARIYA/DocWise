import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../config/env';

const pc = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const index = pc.index(env.PINECONE_INDEX);

export interface VectorMetadata extends Record<string, any> {
  documentId: string;
  userId: string;
  text: string;
  startIndex: number;
}

export async function upsertVectors(namespace: string, vectors: Array<{ id: string, values: number[], metadata: VectorMetadata }>) {
  // Upsert in batches of 100 to avoid Pinecone payload limits
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.namespace(namespace).upsert(batch as any);
  }
}

export async function queryVectors(
  namespace: string,
  queryEmbedding: number[],
  topK = 5,
  filters?: Record<string, any>,
) {
  const results = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: filters && Object.keys(filters).length > 0 ? filters : undefined,
  });

  return results.matches;
}

export async function deleteVectorsByDocumentId(namespace: string, documentId: string) {
  // Wait, deleting by metadata filter is supported but requires explicit call
  // Pinecone `deleteMany` allows filtering
  const ns = index.namespace(namespace);
  
  // deleteMany requires filter options
  await ns.deleteMany({ filter: { documentId: { "$eq": documentId } } } as any);
}

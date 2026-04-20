import { prisma } from '../utils/prisma';
import { chunkText } from './chunker';
import { embedChunks } from './embedder';
import { upsertVectors } from './vectorStore';

/**
 * Common pipeline for processing text into the vector database
 */
export async function processTextIngestion(
  userId: string,
  documentId: string,
  text: string,
  pageCount: number = 0
) {
  const chunks = chunkText(text);

  if (chunks.length > 0) {
    const chunkTexts = chunks.map(c => c.text);
    const embeddings = await embedChunks(chunkTexts);

    const vectors = chunks.map((chunk, idx) => ({
      id: `${documentId}_chunk_${idx}`,
      values: embeddings[idx],
      metadata: {
        documentId,
        userId,
        text: chunk.text,
        startIndex: chunk.startIndex,
      }
    }));

    // Namespace per tenant (userId)
    await upsertVectors(userId, vectors);

    // Update DB record
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'READY',
        chunkCount: chunks.length,
        pageCount
      }
    });
  } else {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'READY', chunkCount: 0 }
    });
  }
}

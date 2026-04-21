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
  pageCount: number = 0,
  pages?: string[]
) {
  let allChunks: { text: string, startIndex: number, pageNumber?: number }[] = [];

  if (pages && pages.length > 0) {
    // Page-aware chunking
    pages.forEach((pageText, index) => {
      const pageNumber = index + 1;
      const pageChunks = chunkText(pageText);
      allChunks.push(...pageChunks.map(c => ({
        ...c,
        pageNumber
      })));
    });
  } else {
    allChunks = chunkText(text);
  }

  if (allChunks.length > 0) {
    const chunkTexts = allChunks.map(c => c.text);
    const embeddings = await embedChunks(chunkTexts);

    const vectors = allChunks.map((chunk, idx) => ({
      id: `${documentId}_chunk_${idx}`,
      values: embeddings[idx],
      metadata: {
        documentId,
        userId,
        text: chunk.text,
        startIndex: chunk.startIndex,
        pageNumber: chunk.pageNumber
      }
    }));

    // Namespace per tenant (userId)
    await upsertVectors(userId, vectors);

    // Store chunks in database for hybrid search
    const dbChunks = allChunks.map((chunk) => ({
      documentId,
      userId,
      text: chunk.text,
      startIndex: chunk.startIndex,
      pageNumber: chunk.pageNumber
    }));

    await prisma.chunk.createMany({
      data: dbChunks
    });

    // Update DB record
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'READY',
        chunkCount: allChunks.length,
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

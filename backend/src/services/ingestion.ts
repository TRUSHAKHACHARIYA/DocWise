import { prisma } from '../utils/prisma';
import { chunkText } from './chunker';
import { embedChunks } from './embedder';
import { upsertVectors } from './vectorStore';
import { logger } from '../utils/logger';

export async function processTextIngestion(
  userId: string,
  documentId: string,
  text: string,
  pageCount: number = 0,
  pages?: string[]
) {
  try {
    logger.info(`Starting ingestion for document ${documentId}`, { userId, pageCount });
    let allChunks: { text: string, startIndex: number, pageNumber?: number }[] = [];

    if (pages && pages.length > 0) {
      pages.forEach((pageText, index) => {
        const pageNumber = index + 1;
        const pageChunks = chunkText(pageText);
        allChunks.push(...pageChunks.map(c => ({ ...c, pageNumber })));
      });
    } else {
      allChunks = chunkText(text);
    }

    logger.info(`Document ${documentId} fragmented into ${allChunks.length} chunks`);

    if (allChunks.length > 0) {
      const chunkTexts = allChunks.map(c => c.text);
      logger.info(`Generating embeddings for ${allChunks.length} chunks...`);
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

      await upsertVectors(userId, vectors);

      const dbChunks = allChunks.map((chunk) => ({
        documentId,
        userId,
        text: chunk.text,
        startIndex: chunk.startIndex,
        pageNumber: chunk.pageNumber
      }));

      await prisma.chunk.createMany({ data: dbChunks });

      await prisma.document.update({
        where: { id: documentId },
        data: { 
          status: 'READY',
          chunkCount: allChunks.length,
          pageCount
        }
      });
      logger.info(`Ingestion complete for document ${documentId}`);
    } else {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'READY', chunkCount: 0 }
      });
    }
  } catch (error: any) {
    logger.error(`Ingestion failed for document ${documentId}`, { error: error.message });
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' }
    });
  }
}

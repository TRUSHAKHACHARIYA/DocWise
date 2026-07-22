import { prisma } from '../utils/prisma';
import { chunkText } from './chunker';
import { embedChunks } from './embedder';
import { upsertVectors } from './vectorStore';
import { generateDocumentSummary, extractDocumentMetadata, generateChunkContext } from './llm';
import { dispatchWebhook } from './webhooks';
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
    
    await prisma.document.update({
      where: { id: documentId },
      data: { detailedStatus: 'Chunking text...', progress: 10 }
    });

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
      await prisma.document.update({
        where: { id: documentId },
        data: { detailedStatus: 'Generating embeddings...', progress: 40 }
      });

      // Generate document summary before embedding
      let summary: string | null = null;
      try {
        summary = await generateDocumentSummary(text);
        logger.info(`Generated summary for document ${documentId}`);
      } catch (err: any) {
        logger.warn(`Summary generation failed for ${documentId}: ${err.message}`);
      }

      // Extract metadata
      let docMetadata = null;
      try {
        docMetadata = await extractDocumentMetadata(text, documentId);
        logger.info(`Extracted metadata for document ${documentId}: ${JSON.stringify(docMetadata)}`);
      } catch (err: any) {
        logger.warn(`Metadata extraction failed for ${documentId}: ${err.message}`);
      }

      // Generate contextual text for each chunk (contextual retrieval)
      const chunkTexts = allChunks.map(c => c.text);
      let contextualTexts = chunkTexts;

      if (summary) {
        try {
          contextualTexts = await Promise.all(
            allChunks.map(async (chunk) => {
              const context = await generateChunkContext(chunk.text, summary!, documentId);
              return `${context}\n\n${chunk.text}`;
            })
          );
          logger.info(`Generated contextual text for ${allChunks.length} chunks`);
        } catch (err: any) {
          logger.warn(`Contextual retrieval failed for ${documentId}: ${err.message}, using original text`);
          contextualTexts = chunkTexts;
        }
      }

      // Embed contextualized chunks
      const embeddings = await embedChunks(contextualTexts);

      // Build vectors: chunks + summary vector
      const chunkVectors = allChunks.map((chunk, idx) => ({
        id: `${documentId}_chunk_${idx}`,
        values: embeddings[idx],
        metadata: {
          documentId,
          userId,
          text: chunk.text,
          startIndex: chunk.startIndex,
          pageNumber: chunk.pageNumber,
          createdAt: new Date().toISOString(),
          isSummary: false,
        }
      }));

      let allVectors = chunkVectors;

      // Embed and add summary vector for semantic search
      if (summary) {
        const summaryEmbeddings = await embedChunks([summary]);
        allVectors = [
          ...chunkVectors,
          {
            id: `${documentId}_summary`,
            values: summaryEmbeddings[0],
            metadata: {
              documentId,
              userId,
              text: summary,
              startIndex: 0,
              pageNumber: null,
              createdAt: new Date().toISOString(),
              isSummary: true,
            }
          }
        ];
      }

      await upsertVectors(userId, allVectors);

      // Save summary and metadata to database
      await prisma.document.update({
        where: { id: documentId },
        data: { summary, metadata: docMetadata }
      });

      await prisma.document.update({
        where: { id: documentId },
        data: { detailedStatus: 'Saving to database...', progress: 80 }
      });

      const dbChunks = allChunks.map((chunk) => ({
        documentId,
        userId,
        text: chunk.text,
        startIndex: chunk.startIndex,
        pageNumber: chunk.pageNumber
      }));

      await prisma.chunk.createMany({ data: dbChunks });

      // Populate the tsvector column for full-text search
      await prisma.$executeRaw`
        UPDATE "Chunk" 
        SET "textSearch" = to_tsvector('english', "text")
        WHERE "documentId" = ${documentId}
          AND "textSearch" IS NULL
      `;

      await prisma.document.update({
        where: { id: documentId },
        data: { 
          status: 'READY',
          detailedStatus: 'Complete',
          progress: 100,
          chunkCount: allChunks.length,
          pageCount,
          errorReason: null
        }
      });
      logger.info(`Ingestion complete for document ${documentId}`);

      // Dispatch webhook
      dispatchWebhook(userId, 'document.ready', {
        documentId,
        name: documentId,
        chunkCount: allChunks.length,
        pageCount,
      }).catch(err => logger.warn(`Webhook dispatch failed: ${err.message}`));
    } else {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'READY', chunkCount: 0, errorReason: null }
      });
    }
  } catch (error: any) {
    logger.error(`Ingestion failed for document ${documentId}`, { error: error.message });
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' }
    });

    // Dispatch failure webhook
    dispatchWebhook(userId, 'document.failed', {
      documentId,
      error: error.message,
    }).catch(err => logger.warn(`Webhook dispatch failed: ${err.message}`));

    throw error;
  }
}

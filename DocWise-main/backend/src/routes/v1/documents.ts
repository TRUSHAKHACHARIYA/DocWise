import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { uploadFile, deleteFile } from '../../services/fileStorage';
import { ingestionQueue } from '../../services/queue';
import { deleteVectorsByDocumentId } from '../../services/vectorStore';
import { validateUploadMimeType, validateUploadSignature, looksSuspiciousTextPayload } from '../../utils/uploadSecurity';
import { requireAuth } from '../../middleware/auth';

export async function v1DocumentRoutes(app: FastifyInstance) {
  app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // Upload a document
  app.post('/documents', async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;
    const buffer = await data.toBuffer();

    if (!validateUploadMimeType(data.mimetype)) {
      return reply.code(400).send({ error: 'Unsupported file type' });
    }
    if (!validateUploadSignature(buffer, data.mimetype)) {
      return reply.code(400).send({ error: 'File signature does not match declared MIME type' });
    }
    if (looksSuspiciousTextPayload(buffer, data.mimetype)) {
      return reply.code(400).send({ error: 'Potentially unsafe text payload detected' });
    }

    try {
      const { key } = await uploadFile(buffer, data.mimetype, data.filename, userId);

      const document = await prisma.document.create({
        data: {
          userId,
          name: data.filename,
          s3Key: key,
          sizeBytes: buffer.length,
          mimeType: data.mimetype,
          status: 'PROCESSING',
        },
      });

      await ingestionQueue.add('process-file', {
        documentId: document.id,
        userId,
        s3Key: key,
        mimetype: data.mimetype,
        filename: data.filename,
      });

      return reply.code(201).send({ document });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: 'File upload failed' });
    }
  });

  // List documents
  app.get('/documents', async (req, reply) => {
    const userId = req.user!.id;
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ documents });
  });

  // Delete a document
  app.delete('/documents/:id', async (req, reply) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    const document = await prisma.document.findFirst({
      where: { id, userId },
    });
    if (!document) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    try {
      await deleteFile(document.s3Key);
      await deleteVectorsByDocumentId(userId, document.id);
      await prisma.document.delete({ where: { id } });
      return reply.send({ message: 'Document deleted successfully' });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete document' });
    }
  });

  // Compare two documents
  app.post('/documents/compare', async (req, reply) => {
    const userId = req.user!.id;
    const { documentIds } = z.object({
      documentIds: z.array(z.string()).length(2),
    }).parse(req.body);

    const docs = await prisma.document.findMany({
      where: { id: { in: documentIds }, userId },
      select: {
        id: true, name: true, status: true, chunkCount: true,
        pageCount: true, summary: true, metadata: true,
      },
    });

    if (docs.length !== 2) {
      return reply.code(404).send({ error: 'Both documents not found' });
    }

    const [chunksA, chunksB] = await Promise.all(
      documentIds.map(docId =>
        prisma.chunk.findMany({
          where: { documentId: docId },
          orderBy: { startIndex: 'asc' },
          select: { text: true, pageNumber: true, startIndex: true },
        })
      )
    );

    return {
      documents: docs,
      chunks: {
        [docs[0].id]: chunksA,
        [docs[1].id]: chunksB,
      },
    };
  });
}

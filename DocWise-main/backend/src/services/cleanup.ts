import { prisma } from '../utils/prisma';
import { deleteFile } from './fileStorage';
import { deleteVectorsByDocumentId } from './vectorStore';
import { logger } from '../utils/logger';

/**
 * Clean up all data associated with a user.
 * Used by both self-service account deletion and admin user deletion.
 */
export async function cleanupUserData(userId: string, context: string = 'user deletion'): Promise<void> {
  logger.info(`Starting data cleanup for user ${userId}`, { context });

  // 1. Delete all documents from S3 and Pinecone
  const documents = await prisma.document.findMany({
    where: { userId },
    select: { id: true, s3Key: true },
  });

  const cleanupErrors: string[] = [];

  await Promise.all(
    documents.map(async (doc) => {
      try {
        await deleteFile(doc.s3Key);
      } catch (error: any) {
        cleanupErrors.push(`S3 deletion failed for doc ${doc.id}: ${error.message}`);
        logger.warn(`Failed to delete S3 file for document ${doc.id}`, { error: error.message });
      }
      try {
        await deleteVectorsByDocumentId(userId, doc.id);
      } catch (error: any) {
        cleanupErrors.push(`Pinecone deletion failed for doc ${doc.id}: ${error.message}`);
        logger.warn(`Failed to delete vectors for document ${doc.id}`, { error: error.message });
      }
    })
  );

  // 2. Delete user record (cascades to documents, chunks, sessions, messages, etc.)
  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error: any) {
    cleanupErrors.push(`User deletion failed: ${error.message}`);
    throw error;
  }

  if (cleanupErrors.length > 0) {
    logger.warn(`User ${userId} deleted with some cleanup errors`, { errors: cleanupErrors, context });
  } else {
    logger.info(`User ${userId} cleanup complete`, { context });
  }
}

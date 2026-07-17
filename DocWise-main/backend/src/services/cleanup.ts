import { prisma } from '../utils/prisma';
import { deleteFile } from './fileStorage';
import { deleteVectorsByDocumentId } from './vectorStore';
import { logger } from '../utils/logger';

/**
 * Clean up all data associated with a user.
 * Used by both self-service account deletion and admin user deletion.
 * Handles organization ownership transfer before deletion.
 */
export async function cleanupUserData(userId: string, context: string = 'user deletion'): Promise<void> {
  logger.info(`Starting data cleanup for user ${userId}`, { context });

  // 0. Handle organization ownership — delete orgs owned by this user,
  //    or transfer ownership if other members exist
  const ownedOrgs = await prisma.organization.findMany({
    where: { ownerId: userId },
    include: {
      members: {
        where: { userId: { not: userId } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  for (const org of ownedOrgs) {
    if (org.members.length > 0) {
      // Transfer ownership to the earliest non-owner member
      const newOwner = org.members[0];
      await prisma.$transaction([
        prisma.membership.update({
          where: { id: newOwner.id },
          data: { role: 'OWNER' },
        }),
        prisma.organization.update({
          where: { id: org.id },
          data: { ownerId: newOwner.userId },
        }),
      ]);
      logger.info(`Transferred ownership of org ${org.id} to user ${newOwner.userId}`, { context });
    } else {
      // No other members — delete the org (cascades to memberships, docs, sessions)
      // First clean up S3/Pinecone for org documents
      const orgDocs = await prisma.document.findMany({
        where: { organizationId: org.id },
        select: { id: true, s3Key: true },
      });
      await Promise.all(
        orgDocs.map(async (doc) => {
          try { await deleteFile(doc.s3Key); } catch {}
          try { await deleteVectorsByDocumentId(userId, doc.id); } catch {}
        })
      );
      await prisma.organization.delete({ where: { id: org.id } });
      logger.info(`Deleted empty org ${org.id} owned by user ${userId}`, { context });
    }
  }

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

  // 2. Delete user record (cascades to documents, chunks, sessions, messages, memberships, etc.)
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

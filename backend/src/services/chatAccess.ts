import { prisma } from "../utils/prisma";

export async function ensureOwnedDocuments(userId: string, documentIds: string[]) {
  const uniqueDocumentIds = [...new Set(documentIds)];

  if (uniqueDocumentIds.length === 0) {
    return uniqueDocumentIds;
  }

  const ownedDocuments = await prisma.document.findMany({
    where: {
      id: { in: uniqueDocumentIds },
      userId,
    },
    select: { id: true },
  });

  if (ownedDocuments.length !== uniqueDocumentIds.length) {
    const ownedIds = new Set(ownedDocuments.map((doc) => doc.id));
    const missingIds = uniqueDocumentIds.filter((id) => !ownedIds.has(id));
    const error = new Error(`One or more documents are not available to this account: ${missingIds.join(", ")}`);
    (error as any).statusCode = 400;
    throw error;
  }

  return uniqueDocumentIds;
}

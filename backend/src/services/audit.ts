import { prisma } from '../utils/prisma';

export const logAudit = async (
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: any
) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch (error) {
    // We don't want to crash the request if audit logging fails, just log it
    console.error('Audit log failed:', error);
  }
};

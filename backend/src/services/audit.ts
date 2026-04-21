import { prisma } from '../utils/prisma';

export const logAudit = async (
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata: metadata || {},
        ipAddress,
        userAgent
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

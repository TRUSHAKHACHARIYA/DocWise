import { prisma } from '../utils/prisma';

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const incrementUsage = async (userId: string, type: 'questionsUsed' | 'docsUploaded', amount: number = 1) => {
  const month = getCurrentMonth();

  return await prisma.usageLog.upsert({
    where: {
      userId_month: { userId, month },
    },
    update: {
      [type]: { increment: amount },
    },
    create: {
      userId,
      month,
      [type]: amount,
    },
  });
};

export const getUsage = async (userId: string) => {
  const month = getCurrentMonth();
  return await prisma.usageLog.findUnique({
    where: {
      userId_month: { userId, month },
    },
  });
};

export const CHECK_LIMITS = {
  FREE: {
    maxDocs: 3,
    maxQuestions: 20,
    maxStorageMB: 100,
  },
  TRIAL: {
    maxDocs: 50,
    maxQuestions: 500,
    maxStorageMB: 500,
  },
  STARTER: {
    maxDocs: 20,
    maxQuestions: 200,
    maxStorageMB: 500,
  },
  PRO: {
    maxDocs: 100,
    maxQuestions: 1000,
    maxStorageMB: 5000,
  },
  ENTERPRISE: {
    maxDocs: 999999,
    maxQuestions: 999999,
    maxStorageMB: 50000,
  }
};

export async function getUserStorageUsedBytes(userId: string): Promise<number> {
  const result = await prisma.document.aggregate({
    where: { userId },
    _sum: { sizeBytes: true },
  });
  return result._sum.sizeBytes ?? 0;
}

/**
 * Get effective limits for a user, considering trial status
 */
export const getEffectiveLimits = (user: { plan?: string; trialEndsAt?: Date | null }) => {
  // Check if user is in trial period
  if (user.trialEndsAt && new Date() < user.trialEndsAt) {
    return CHECK_LIMITS.TRIAL;
  }
  
  const plan = (user.plan as keyof typeof CHECK_LIMITS) || 'FREE';
  return CHECK_LIMITS[plan];
};

/**
 * Check if user is still in trial period
 */
export const isInTrial = (user: { trialEndsAt?: Date | null }) => {
  return user.trialEndsAt && new Date() < user.trialEndsAt;
};

/**
 * Get trial end date for new users (7 days from now)
 */
export const getTrialEndDate = () => {
  const trialPeriodDays = 7;
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + trialPeriodDays);
  return trialEnd;
};

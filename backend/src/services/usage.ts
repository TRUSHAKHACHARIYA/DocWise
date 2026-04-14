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
  },
  STARTER: {
    maxDocs: 20,
    maxQuestions: 200,
  },
  PRO: {
    maxDocs: 100,
    maxQuestions: 1000,
  },
  ENTERPRISE: {
    maxDocs: 999999,
    maxQuestions: 999999,
  }
};

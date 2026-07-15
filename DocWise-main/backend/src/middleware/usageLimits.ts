import { FastifyReply, FastifyRequest } from 'fastify';
import { getEffectiveLimits, isInTrial, tryIncrementUsage, getUserStorageUsedBytes } from '../services/usage';

export const checkDocumentLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const limits = getEffectiveLimits(user);
  const allowed = await tryIncrementUsage(user.id, 'docsUploaded', limits.maxDocs);

  if (!allowed) {
    const inTrial = isInTrial(user);
    const planType = inTrial ? 'trial' : (user.plan || 'FREE').toLowerCase();
    return reply.code(403).send({ 
      error: 'Document limit reached', 
      message: `Your ${planType} plan allows only ${limits.maxDocs} documents per month.` 
    });
  }
};

export const checkStorageLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const limits = getEffectiveLimits(user);
  const storageUsedBytes = await getUserStorageUsedBytes(user.id);
  const storageLimitBytes = limits.maxStorageMB * 1024 * 1024;

  // Check file size against remaining storage quota
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 0 && storageUsedBytes + contentLength > storageLimitBytes) {
    const usedMB = Math.round((storageUsedBytes / (1024 * 1024)) * 100) / 100;
    const limitMB = limits.maxStorageMB;
    return reply.code(403).send({
      error: 'Storage limit reached',
      message: `Your storage quota is ${limitMB}MB. Currently using ${usedMB}MB.`
    });
  }
};

export const checkQuestionLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const limits = getEffectiveLimits(user);
  const allowed = await tryIncrementUsage(user.id, 'questionsUsed', limits.maxQuestions);

  if (!allowed) {
    const inTrial = isInTrial(user);
    const planType = inTrial ? 'trial' : (user.plan || 'FREE').toLowerCase();
    return reply.code(403).send({ 
      error: 'Question limit reached', 
      message: `Your ${planType} plan allows only ${limits.maxQuestions} questions per month.` 
    });
  }
};

import { FastifyReply, FastifyRequest } from 'fastify';
import { getUsage, getEffectiveLimits, isInTrial } from '../services/usage';

export const checkDocumentLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const usage = await getUsage(user.id);
  const limits = getEffectiveLimits(user);
  const inTrial = isInTrial(user);

  if (usage && usage.docsUploaded >= limits.maxDocs) {
    const planType = inTrial ? 'trial' : (user.plan || 'FREE').toLowerCase();
    return reply.code(403).send({ 
      error: 'Document limit reached', 
      message: `Your ${planType} plan allows only ${limits.maxDocs} documents per month.` 
    });
  }
};

export const checkQuestionLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const usage = await getUsage(user.id);
  const limits = getEffectiveLimits(user);
  const inTrial = isInTrial(user);

  if (usage && usage.questionsUsed >= limits.maxQuestions) {
    const planType = inTrial ? 'trial' : (user.plan || 'FREE').toLowerCase();
    return reply.code(403).send({ 
      error: 'Question limit reached', 
      message: `Your ${planType} plan allows only ${limits.maxQuestions} questions per month.` 
    });
  }
};

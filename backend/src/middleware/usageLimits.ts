import { FastifyReply, FastifyRequest } from 'fastify';
import { getUsage, CHECK_LIMITS } from '../services/usage';
import { Plan } from '@prisma/client';

export const checkDocumentLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const usage = await getUsage(user.id);
  const plan = user.plan as Plan;
  const limits = CHECK_LIMITS[plan];

  if (usage && usage.docsUploaded >= limits.maxDocs) {
    return reply.code(403).send({ 
      error: 'Document limit reached', 
      message: `Your ${plan} plan allows only ${limits.maxDocs} documents per month.` 
    });
  }
};

export const checkQuestionLimit = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;
  if (!user) return;

  const usage = await getUsage(user.id);
  const plan = (user.plan as Plan) || 'FREE';
  const limits = CHECK_LIMITS[plan];

  if (usage && usage.questionsUsed >= limits.maxQuestions) {
    return reply.code(403).send({ 
      error: 'Question limit reached', 
      message: `Your ${plan} plan allows only ${limits.maxQuestions} questions per month.` 
    });
  }
};

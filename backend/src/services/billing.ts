import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { Plan } from '@prisma/client';

export const syncUserPlan = async (
  userId: string,
  gatewaySubId: string,
  planId: string,
  status: string,
  periodEnd: number
) => {
  let plan: Plan = 'FREE';
  
  if (planId === env.NMI_PLAN_STARTER || planId === 'STARTER') plan = 'STARTER';
  else if (planId === env.NMI_PLAN_PRO || planId === 'PRO') plan = 'PRO';
  
  // If subscription is not active or trialing, downgrade to FREE
  const isPaidPlan = (status === 'active' || status === 'trialing');
  const finalPlan = isPaidPlan ? plan : 'FREE';

  return await prisma.user.update({
    where: { id: userId },
    data: {
      plan: finalPlan,
      subscription: {
        upsert: {
          create: {
            gatewaySubId,
            plan: finalPlan,
            status: isPaidPlan ? 'ACTIVE' : 'CANCELLED',
            currentPeriodEnd: new Date(periodEnd * 1000),
          },
          update: {
            gatewaySubId,
            plan: finalPlan,
            status: isPaidPlan ? 'ACTIVE' : 'CANCELLED',
            currentPeriodEnd: new Date(periodEnd * 1000),
          },
        },
      },
    },
  });
};

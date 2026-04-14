import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { Plan } from '@prisma/client';

export const syncUserPlan = async (userId: string, stripeSubId: string, priceId: string, status: string, periodEnd: number) => {
  let plan: Plan = 'FREE';
  
  if (priceId === env.STRIPE_PRICE_STARTER) plan = 'STARTER';
  else if (priceId === env.STRIPE_PRICE_PRO) plan = 'PRO';
  
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
            stripeSubId,
            plan: finalPlan,
            status: isPaidPlan ? 'ACTIVE' : 'CANCELLED',
            currentPeriodEnd: new Date(periodEnd * 1000),
          },
          update: {
            plan: finalPlan,
            status: isPaidPlan ? 'ACTIVE' : 'CANCELLED',
            currentPeriodEnd: new Date(periodEnd * 1000),
          },
        },
      },
    },
  });
};

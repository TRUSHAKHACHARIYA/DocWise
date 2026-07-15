import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { nmi } from '../utils/nmi';
import { syncUserPlan } from '../services/billing';

const planMap = {
  STARTER: { amount: 19, nmiPlanId: env.NMI_PLAN_STARTER },
  PRO: { amount: 49, nmiPlanId: env.NMI_PLAN_PRO },
} as const;

function parseWebhookEvents(): string[] {
  return env.NMI_WEBHOOK_EVENTS.split(',').map((event) => event.trim()).filter(Boolean);
}

export async function billingRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/plans', async (req, reply) => {
    return reply.send({
      plans: [
        { id: 'FREE', name: 'Free', price: '$0', priceId: null },
        { id: 'STARTER', name: 'Starter', price: '$19', planId: 'STARTER' },
        { id: 'PRO', name: 'Pro', price: '$49', planId: 'PRO' },
      ],
      provider: 'nmi',
    });
  });

  app.post('/create-checkout', async (req, reply) => {
    if (!env.NMI_PRIVATE_API_KEY) {
      return reply.code(500).send({ error: 'NMI is not configured on server.' });
    }

    const userId = req.user!.id;
    const { planId, paymentToken, firstName, lastName, email } = z.object({
      planId: z.enum(['STARTER', 'PRO']),
      paymentToken: z.string().min(1),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const selected = planMap[planId];
    if (!selected?.nmiPlanId) {
      return reply.code(500).send({ error: `NMI plan ID is not configured for ${planId}.` });
    }

    try {
      const payload: Record<string, unknown> = {
        plan_id: selected.nmiPlanId,
        amount: selected.amount,
        payment_details: {
          payment_token: paymentToken,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          email,
        },
        customer_vault: {
          customer_id: user.id,
        },
      };

      if (env.NMI_WEBHOOK_SECRET) {
        payload.callback_url = `${env.BACKEND_PUBLIC_URL.replace(/\/+$/, '')}/api/webhooks/nmi`;
        payload.secret = env.NMI_WEBHOOK_SECRET;
        payload.events = parseWebhookEvents();
      }

      const response = await nmi.post('/subscriptions', payload);

      const subscriptionId = response.data?.id;
      if (!subscriptionId) {
        app.log.error({ response: response.data }, 'NMI subscription create failed');
        return reply.code(400).send({ error: response.data?.response_text || 'Failed to create subscription' });
      }

      const periodEndUnix = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      await syncUserPlan(user.id, String(subscriptionId), planId, 'active', periodEndUnix);

      return reply.send({ success: true, subscriptionId });
    } catch (error: any) {
      app.log.error({ err: error?.response?.data || error }, 'NMI subscription request failed');
      return reply.code(400).send({ error: error?.response?.data?.message || 'Failed to create subscription' });
    }
  });

  app.post('/portal', async (req, reply) => {
    const userId = req.user!.id;
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.gatewaySubId) {
      return reply.code(400).send({ error: "No active subscription found." });
    }

    try {
      await nmi.delete(`/subscriptions/${subscription.gatewaySubId}`);
      await syncUserPlan(userId, subscription.gatewaySubId, 'FREE', 'cancelled', Math.floor(Date.now() / 1000));

      return reply.send({ success: true, message: 'Subscription cancelled successfully.' });
    } catch (error: any) {
      app.log.error({ err: error?.response?.data || error }, 'NMI subscription cancellation failed');
      return reply.code(400).send({ error: error?.response?.data?.message || 'Failed to cancel subscription' });
    }
  });
}

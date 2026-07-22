import { FastifyInstance } from 'fastify';
import { randomBytes, createHmac } from 'crypto';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';

export async function webhookSubscriptionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // List webhook subscriptions
  app.get('/', async (req, reply) => {
    const userId = (req.user as any).id;
    const subscriptions = await prisma.webhookSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        createdAt: true,
        _count: { select: { deliveries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { subscriptions };
  });

  // Create webhook subscription
  app.post('/', async (req, reply) => {
    const userId = (req.user as any).id;
    const { url, events } = z.object({
      url: z.string().url(),
      events: z.array(z.enum(['document.ready', 'document.failed'])).min(1),
    }).parse(req.body);

    const secret = 'whsec_' + randomBytes(32).toString('hex');

    const subscription = await prisma.webhookSubscription.create({
      data: { userId, url, events, secret },
      select: { id: true, url: true, events: true, secret: true, createdAt: true },
    });

    return { subscription };
  });

  // Update webhook subscription
  app.patch('/:id', async (req, reply) => {
    const userId = (req.user as any).id;
    const { id } = req.params as { id: string };
    const { url, events, active } = z.object({
      url: z.string().url().optional(),
      events: z.array(z.enum(['document.ready', 'document.failed'])).optional(),
      active: z.boolean().optional(),
    }).parse(req.body);

    const subscription = await prisma.webhookSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    const updated = await prisma.webhookSubscription.update({
      where: { id },
      data: { ...(url && { url }), ...(events && { events }), ...(active !== undefined && { active }) },
      select: { id: true, url: true, events: true, active: true },
    });

    return { subscription: updated };
  });

  // Delete webhook subscription
  app.delete('/:id', async (req, reply) => {
    const userId = (req.user as any).id;
    const { id } = req.params as { id: string };

    const subscription = await prisma.webhookSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    await prisma.webhookSubscription.delete({ where: { id } });
    return { message: 'Subscription deleted' };
  });

  // List recent deliveries for a subscription
  app.get('/:id/deliveries', async (req, reply) => {
    const userId = (req.user as any).id;
    const { id } = req.params as { id: string };

    const subscription = await prisma.webhookSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        event: true,
        statusCode: true,
        success: true,
        attempts: true,
        lastAttemptAt: true,
        createdAt: true,
      },
    });

    return { deliveries };
  });

  // Test webhook (send a ping event)
  app.post('/:id/test', async (req, reply) => {
    const userId = (req.user as any).id;
    const { id } = req.params as { id: string };

    const subscription = await prisma.webhookSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    const payload = {
      event: 'webhook.ping',
      data: { message: 'Test webhook delivery' },
      timestamp: new Date().toISOString(),
    };

    const body = JSON.stringify(payload);
    const signature = createHmac('sha256', subscription.secret).update(body).digest('hex');

    try {
      const res = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'webhook.ping',
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      return { success: res.ok, statusCode: res.status };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}

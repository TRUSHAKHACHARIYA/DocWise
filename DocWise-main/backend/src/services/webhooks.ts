import { createHmac, randomUUID } from 'crypto';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export async function dispatchWebhook(
  userId: string,
  event: string,
  data: Record<string, any>,
) {
  const subscriptions = await prisma.webhookSubscription.findMany({
    where: { userId, active: true, events: { has: event } },
  });

  if (subscriptions.length === 0) return;

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  for (const sub of subscriptions) {
    const signature = signPayload(body, sub.secret);

    // Create delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        subscriptionId: sub.id,
        event,
        payload: payload as any,
        attempts: 1,
        lastAttemptAt: new Date(),
      },
    });

    try {
      const res = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-Delivery-Id': delivery.id,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      const responseText = await res.text();

      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          statusCode: res.status,
          response: responseText.substring(0, 1000),
          success: res.ok,
        },
      });

      logger.info(`Webhook delivered: ${event} to ${sub.url} (${res.status})`);
    } catch (err: any) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          statusCode: 0,
          response: err.message,
          success: false,
        },
      });

      logger.warn(`Webhook delivery failed: ${event} to ${sub.url}: ${err.message}`);
    }
  }
}

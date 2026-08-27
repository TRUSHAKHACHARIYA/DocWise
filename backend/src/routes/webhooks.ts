import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { syncUserPlan } from '../services/billing';
import { env } from '../config/env';

function normalizeSignature(signature: string): string {
  return signature.replace(/^sha256=/i, '').trim();
}

function verifyNmiSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const signature = normalizeSignature(signatureHeader);
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest();

  const expectedHex = digest.toString('hex');
  const expectedBase64 = digest.toString('base64');

  const actual = Buffer.from(signature);
  const candidates = [Buffer.from(expectedHex), Buffer.from(expectedBase64)];

  return candidates.some((candidate) => {
    if (candidate.length !== actual.length) return false;
    return crypto.timingSafeEqual(candidate, actual);
  });
}

function parsePeriodEndToUnix(value: unknown): number {
  if (typeof value === 'number') return value > 1e12 ? Math.floor(value / 1000) : value;
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric > 1e12 ? Math.floor(numeric / 1000) : numeric;
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  }
  return Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
}

export async function webhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    done(null, body);
  });

  app.post('/nmi', async (req, reply) => {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    const signatureHeader = (req.headers['signature'] as string | undefined) ?? '';

    if (!env.NMI_WEBHOOK_SECRET) {
      app.log.warn('NMI webhook received but NMI_WEBHOOK_SECRET is not configured.');
      return reply.code(202).send({ received: true, ignored: true });
    }

    if (!signatureHeader || !verifyNmiSignature(rawBody, signatureHeader, env.NMI_WEBHOOK_SECRET)) {
      return reply.code(401).send({ error: 'Invalid webhook signature' });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return reply.code(400).send({ error: 'Invalid JSON payload' });
    }

    const eventType = payload.event || payload.type;
    const subscription = payload.data?.subscription || payload.subscription || payload.data || payload;

    const gatewaySubId = String(
      subscription.id || subscription.subscription_id || subscription.gateway_sub_id || ''
    ).trim();
    const customerId = String(
      subscription.customer_id ||
      subscription.customerId ||
      subscription.customer_vault?.customer_id ||
      ''
    ).trim();
    const planId = String(subscription.plan_id || subscription.planId || '').trim();
    const status = String(subscription.status || '').toLowerCase();
    const periodEndUnix = parsePeriodEndToUnix(subscription.current_period_end || subscription.period_end);

    if (!gatewaySubId) {
      return reply.code(200).send({ received: true, ignored: true, reason: 'missing_subscription_id' });
    }

    let userId = customerId;
    if (!userId) {
      const existing = await prisma.subscription.findUnique({ where: { gatewaySubId } });
      userId = existing?.userId ?? '';
    }

    if (!userId) {
      return reply.code(200).send({ received: true, ignored: true, reason: 'unknown_user' });
    }

    const normalizedStatus = eventType?.toString().includes('cancel') || status === 'cancelled'
      ? 'cancelled'
      : status || 'active';

    try {
      await syncUserPlan(userId, gatewaySubId, planId || 'FREE', normalizedStatus, periodEndUnix);
    } catch (error: any) {
      // A customerId from the payload that doesn't match a real user (a
      // stale/test webhook, a manually-cleared account) throws Prisma's
      // "record not found" — that's not a transient failure NMI should
      // retry, so acknowledge it the same way the other invalid-payload
      // branches above do rather than 500ing and triggering retry storms.
      if (error?.code === 'P2025') {
        app.log.warn({ userId, gatewaySubId }, 'NMI webhook referenced a user that no longer exists; ignoring.');
        return reply.code(200).send({ received: true, ignored: true, reason: 'unknown_user' });
      }
      throw error;
    }

    return reply.send({ received: true });
  });
}

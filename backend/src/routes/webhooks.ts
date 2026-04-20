import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { stripe } from '../utils/stripe';
import { env } from '../config/env';
import { syncUserPlan } from '../services/billing';

export async function webhookRoutes(app: FastifyInstance) {
  // Capture raw body for Stripe signature verification
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    done(null, body);
  });

  app.post('/stripe', async (req, reply) => {
    const sig = req.headers['stripe-signature'] as string;
    const body = req.body as Buffer;

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      app.log.error(`Webhook signature verification failed: ${err.message}`);
      return reply.code(400).send(`Webhook Error: ${err.message}`);
    }

      // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const stripeSubId = session.subscription as string;

        if (userId && stripeSubId) {
          const subscription: any = await stripe.subscriptions.retrieve(stripeSubId);
          const periodEndUnix = Math.floor(new Date(subscription.current_period_end).getTime() / 1000);
          await syncUserPlan(
            userId, 
            stripeSubId, 
            subscription.items.data[0].price.id, 
            subscription.status, 
            periodEndUnix
          );
          app.log.info(`Plan synced for user ${userId} on checkout completion.`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const stripeSubId = subscription.id;
        const periodEndUnix = Math.floor(new Date(subscription.current_period_end).getTime() / 1000);
        
        const dbSub = await prisma.subscription.findUnique({
            where: { stripeSubId }
        });

        if (dbSub) {
          await syncUserPlan(
            dbSub.userId, 
            stripeSubId, 
            subscription.items.data[0].price.id, 
            subscription.status, 
            periodEndUnix
          );
          app.log.info(`Plan updated for user ${dbSub.userId} via subscription event.`);
        }
        break;
      }
    }

    return reply.send({ received: true });
  });
}

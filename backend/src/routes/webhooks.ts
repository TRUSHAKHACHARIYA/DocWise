import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { stripe } from '../utils/stripe';
import { env } from '../config/env';
import Stripe from 'stripe';

export async function webhookRoutes(app: FastifyInstance) {
  // Capture raw body for Stripe signature verification
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    done(null, body);
  });

  app.post('/stripe', async (req, reply) => {
    const sig = req.headers['stripe-signature'] as string;
    const body = req.body as Buffer;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      app.log.error(`Webhook signature verification failed: ${err.message}`);
      return reply.code(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const stripeSubId = session.subscription as string;

        if (userId && stripeSubId) {
            const subscription = await stripe.subscriptions.retrieve(stripeSubId);
            const priceId = subscription.items.data[0].price.id;
            
            let plan: 'FREE' | 'STARTER' | 'PRO' = 'FREE';
            if (priceId === env.STRIPE_PRICE_STARTER) plan = 'STARTER';
            if (priceId === env.STRIPE_PRICE_PRO) plan = 'PRO';

            await prisma.user.update({
                where: { id: userId },
                data: { 
                    plan,
                    subscription: {
                        upsert: {
                            create: {
                                stripeSubId,
                                plan,
                                status: 'ACTIVE',
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
                            },
                            update: {
                                stripeSubId,
                                plan,
                                status: 'ACTIVE',
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
                            }
                        }
                    }
                }
            });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;
        
        const dbSub = await prisma.subscription.findUnique({
            where: { stripeSubId }
        });

        if (dbSub) {
            let status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' = 'ACTIVE';
            if (subscription.status === 'canceled') status = 'CANCELLED';
            if (subscription.status === 'past_due') status = 'PAST_DUE';

            const priceId = subscription.items.data[0].price.id;
            let plan: 'FREE' | 'STARTER' | 'PRO' = 'FREE';
            if (priceId === env.STRIPE_PRICE_STARTER) plan = 'STARTER';
            if (priceId === env.STRIPE_PRICE_PRO) plan = 'PRO';

            await prisma.user.update({
                where: { id: dbSub.userId },
                data: { 
                    plan: status === 'ACTIVE' ? plan : 'FREE',
                    subscription: {
                        update: {
                            status,
                            plan,
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
                        }
                    }
                }
            });
        }
        break;
      }
    }

    return reply.send({ received: true });
  });
}

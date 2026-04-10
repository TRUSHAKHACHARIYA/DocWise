import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { stripe } from '../utils/stripe';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';

export async function billingRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // Get current subscription and plans mapping
  app.get('/plans', async (req, reply) => {
    return reply.send({
      plans: [
        { id: 'FREE', name: 'Free', price: '$0', priceId: null },
        { id: 'STARTER', name: 'Starter', price: '$19', priceId: env.STRIPE_PRICE_STARTER },
        { id: 'PRO', name: 'Pro', price: '$49', priceId: env.STRIPE_PRICE_PRO },
      ]
    });
  });

  // Create Stripe Checkout Session
  app.post('/create-checkout', async (req, reply) => {
    const userId = req.user!.id;
    const { priceId } = z.object({
      priceId: z.string()
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return reply.code(404).send({ error: 'User not found' });

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: user.id }
        });
        customerId = customer.id;
        await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId }
        });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.FRONTEND_URL}/dashboard?billing_success=true`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/billing?billing_cancelled=true`,
      metadata: {
          userId: user.id
      }
    });

    return reply.send({ url: session.url });
  });

  // Create Stripe Customer Portal Session
  app.post('/portal', async (req, reply) => {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.stripeCustomerId) {
      return reply.code(400).send({ error: "No active subscription found." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/dashboard/billing`,
    });

    return reply.send({ url: session.url });
  });
}

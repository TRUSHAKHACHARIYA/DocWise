import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../utils/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (req, reply) => {
    try {
      const { email, password, name } = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.code(400).send({ error: 'Email already registered' });
      }

      const passwordHash = await hashPassword(password);
      
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      const tokens = generateTokens(user.id);
      
      return reply.code(201).send({
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
        tokens,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation failed', details: error.flatten().fieldErrors });
      }
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  app.post('/login', async (req, reply) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const tokens = generateTokens(user.id);

      return reply.send({
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
        tokens,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation failed', details: error.flatten().fieldErrors });
      }
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  app.post('/refresh', async (req, reply) => {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      
      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return reply.code(401).send({ error: 'Invalid token' });
      }

      const tokens = generateTokens(user.id);
      return reply.send(tokens);
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid or expired refresh token' });
    }
  });

  app.post('/logout', async (req, reply) => {
    // In a future version with token blacklisting, we'd handle that here.
    return reply.send({ message: 'Logged out successfully' });
  });
}

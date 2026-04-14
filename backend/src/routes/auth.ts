import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '../services/email';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const resendVerificationSchema = z.object({
  email: z.string().email(),
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
      
      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          verificationToken,
          verificationExpires,
        },
      });

      // Send verification email
      try {
        await sendVerificationEmail(email, name, verificationToken);
      } catch (emailError) {
        app.log.error('Failed to send verification email:', emailError);
        // We continue anyway, user can request a resend later
      }
      
      return reply.code(201).send({
        message: 'Registration successful. Please check your email to verify your account.',
        user: { id: user.id, email: user.email, name: user.name },
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

      const tokens = generateTokens(user.id, user.role);

      return reply.send({
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          plan: user.plan,
          verified: !!user.verifiedAt 
        },
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

      const tokens = generateTokens(user.id, user.role);
      return reply.send(tokens);
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid or expired refresh token' });
    }
  });

  app.post('/verify-email', async (req, reply) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return reply.code(400).send({ error: 'Invalid or expired verification token' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verifiedAt: new Date(),
          verificationToken: null,
          verificationExpires: null,
        },
      });

      const tokens = generateTokens(user.id, user.role);

      return reply.send({
        message: 'Email verified successfully',
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

  app.post('/resend-verification', async (req, reply) => {
    try {
      const { email } = resendVerificationSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return 200 even if user doesn't exist for security
        return reply.send({ message: 'If an account exists, a verification email has been sent.' });
      }

      if (user.verifiedAt) {
        return reply.code(400).send({ error: 'Email is already verified' });
      }

      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationExpires,
        },
      });

      await sendVerificationEmail(user.email, user.name, verificationToken);

      return reply.send({ message: 'Verification email resent successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation failed' });
      }
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  app.post('/logout', async (req, reply) => {
    // In a future version with token blacklisting, we'd handle that here.
    return reply.send({ message: 'Logged out successfully' });
  });
}

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';
import { logAudit } from '../services/audit';
import { getTrialEndDate } from '../services/usage';

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

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
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
        app.log.error({ err: emailError }, 'Failed to send verification email');
      }

      await logAudit(user.id, 'USER_REGISTERED', 'User', user.id);
      
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

  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
        // In a real app, you might want to limit by email too, 
        // but IP limit is a good start for brute force.
      }
    }
  }, async (req, reply) => {
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

      reply.setCookie('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return reply.send({
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          plan: user.plan,
          verified: !!user.verifiedAt 
        },
        accessToken: tokens.accessToken,
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
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return reply.code(401).send({ error: 'Refresh token missing' });
      }
      
      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return reply.code(401).send({ error: 'Invalid token' });
      }

      const tokens = generateTokens(user.id, user.role);

      reply.setCookie('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({ accessToken: tokens.accessToken });
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
          trialEndsAt: getTrialEndDate(), // Activate 7-day trial
        },
      });

      await logAudit(user.id, 'USER_EMAIL_VERIFIED', 'User', user.id);

      const tokens = generateTokens(user.id, user.role);

      reply.setCookie('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({
        message: 'Email verified successfully',
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
        accessToken: tokens.accessToken,
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
    reply.clearCookie('refreshToken', { path: '/' });
    return reply.send({ message: 'Logged out successfully' });
  });

  app.post('/forgot-password', async (req, reply) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Security: Don't reveal if user exists
        return reply.send({ message: 'If an account exists with that email, a reset link has been sent.' });
      }

      const resetPasswordToken = uuidv4();
      const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetPasswordExpires },
      });

      await sendPasswordResetEmail(user.email, user.name, resetPasswordToken);
      await logAudit(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id);

      return reply.send({ message: 'If an account exists with that email, a reset link has been sent.' });
    } catch (error) {
      if (error instanceof z.ZodError) return reply.code(400).send({ error: 'Invalid email' });
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  app.post('/reset-password', async (req, reply) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return reply.code(400).send({ error: 'Invalid or expired reset token' });
      }

      const passwordHash = await hashPassword(password);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      await logAudit(user.id, 'PASSWORD_RESET_SUCCESSFUL', 'User', user.id);

      return reply.send({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof z.ZodError) return reply.code(400).send({ error: 'Validation failed' });
      app.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

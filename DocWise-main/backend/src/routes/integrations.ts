import { FastifyInstance } from 'fastify';
import { google } from 'googleapis';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { getGoogleAuthUrl, exchangeCode, refreshAccessToken, listDocuments, downloadFile } from '../services/googleDrive';
import { parseDocument } from '../modules/ingestion/parsers/parser.factory';
import { processTextIngestion } from '../modules/ingestion/ingestion.service';
import { uploadFile } from '../services/fileStorage';
import { logger } from '../utils/logger';

export async function integrationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // List connected integrations
  app.get('/', async (req, reply) => {
    const userId = (req.user as any).id;
    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        providerUserId: true,
        createdAt: true,
        updatedAt: true,
        syncJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { status: true, completedAt: true, filesProcessed: true },
        },
      },
    });
    return { integrations };
  });

  // Start Google Drive OAuth flow
  app.get('/google-drive/auth', async (req, reply) => {
    const userId = (req.user as any).id;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');
    const url = getGoogleAuthUrl(state);
    return { url };
  });

  // Handle Google Drive OAuth callback
  app.get('/google-drive/callback', async (req, reply) => {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      return reply.code(400).send({ error: 'Missing code or state parameter' });
    }

    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
      userId = decoded.userId;
    } catch {
      return reply.code(400).send({ error: 'Invalid state parameter' });
    }

    try {
      const tokens = await exchangeCode(code);

      // Get user's Google ID
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );
      oauth2Client.setCredentials({ access_token: tokens.accessToken });
      const oauth2Service = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2Service.userinfo.get();
      const providerUserId = userInfo.data.id;

      // Upsert integration
      await prisma.integration.upsert({
        where: { userId_provider: { userId, provider: 'GOOGLE_DRIVE' } },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scope: tokens.scope,
          providerUserId,
        },
        create: {
          userId,
          provider: 'GOOGLE_DRIVE',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scope: tokens.scope,
          providerUserId,
        },
      });

      logger.info(`Google Drive connected for user ${userId}`);
      return reply.redirect(`${process.env.FRONTEND_URL}/settings/integrations?connected=true`);
    } catch (error: any) {
      logger.error(`Google Drive OAuth callback failed: ${error.message}`);
      return reply.redirect(`${process.env.FRONTEND_URL}/settings/integrations?error=oauth_failed`);
    }
  });

  // Trigger sync for an integration
  app.post('/:id/sync', async (req, reply) => {
    const userId = (req.user as any).id;
    const { id } = req.params as { id: string };

    const integration = await prisma.integration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      return reply.code(404).send({ error: 'Integration not found' });
    }

    // Create sync job
    const syncJob = await prisma.syncJob.create({
      data: { integrationId: id, status: 'running', startedAt: new Date() },
    });

    try {
      // Refresh token if needed
      let accessToken = integration.accessToken;
      if (integration.expiresAt && integration.expiresAt < new Date()) {
        const refreshed = await refreshAccessToken(integration.refreshToken);
        accessToken = refreshed.accessToken;
        await prisma.integration.update({
          where: { id },
          data: { accessToken, expiresAt: refreshed.expiresAt },
        });
      }

      // List all files
      const { files } = await listDocuments(accessToken, integration.refreshToken);
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: { filesFound: files.length },
      });

      let filesProcessed = 0;

      for (const file of files) {
        try {
          // Check if document already exists by name + user
          const existing = await prisma.document.findFirst({
            where: { userId, name: file.name },
          });

          if (existing) {
            filesProcessed++;
            continue;
          }

          // Download file
          const buffer = await downloadFile(accessToken, integration.refreshToken, file.id);

          // Upload to S3
          const { key: s3Key } = await uploadFile(buffer, file.mimeType, file.name, userId);

          // Create document record
          const document = await prisma.document.create({
            data: {
              userId,
              name: file.name,
              s3Key,
              sizeBytes: parseInt(file.size || '0'),
              mimeType: file.mimeType,
              status: 'PROCESSING',
            },
          });

          // Parse and ingest
          const parsed = await parseDocument(buffer, file.mimeType, file.name);
          await processTextIngestion(userId, document.id, parsed.text, parsed.pageCount ?? 0, parsed.pages, {
            structure: parsed.structure,
            structuralMetadata: parsed.metadata,
          });

          filesProcessed++;
        } catch (err: any) {
          logger.warn(`Failed to sync file ${file.name}: ${err.message}`);
        }
      }

      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'completed',
          filesProcessed,
          completedAt: new Date(),
        },
      });

      return { success: true, filesFound: files.length, filesProcessed };
    } catch (error: any) {
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'failed',
          errorReason: error.message,
          completedAt: new Date(),
        },
      });

      return reply.code(500).send({ error: error.message });
    }
  });

  // Disconnect integration
  app.delete('/:id', async (req, reply) => {
    const userId = (req.user as any).id;
    const { id } = req.params as { id: string };

    const integration = await prisma.integration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      return reply.code(404).send({ error: 'Integration not found' });
    }

    await prisma.integration.delete({ where: { id } });
    return { message: 'Integration disconnected' };
  });
}

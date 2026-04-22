import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { extractText } from './parser';
import { processTextIngestion } from './ingestion';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const ingestionQueue = new Queue('ingestion', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const initWorker = () => {
  const worker = new Worker(
    'ingestion',
    async (job: Job) => {
      const { documentId, userId, buffer, mimetype, filename } = job.data;
      
      logger.info({ documentId, userId }, `Starting background ingestion for ${filename}`);

      try {
        let textResult = '';
        let pageCountResult = 1;
        let pagesResult: any[] = [];

        if (job.data.isUrl) {
          textResult = job.data.text;
        } else {
          // Convert the buffer back from the serialized format
          const fileBuffer = Buffer.from(buffer.data);
          const { text, pageCount, pages } = await extractText(fileBuffer, mimetype, filename);
          textResult = text;
          pageCountResult = pageCount;
          pagesResult = pages;
        }

        await processTextIngestion(userId, documentId, textResult, pageCountResult, pagesResult);
        
        logger.info({ documentId }, `Successfully ingested ${filename}`);
      } catch (error) {
        logger.error({ err: error, documentId }, `Ingestion job failed for ${filename}`);
        
        await prisma.document.update({
          where: { id: documentId },
          data: { status: 'FAILED' }
        }).catch(dbErr => logger.error(dbErr, 'Failed to update document status to FAILED'));
        
        throw error; // Re-throw so BullMQ knows it failed
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Ingestion job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Ingestion job failed');
  });

  return worker;
};

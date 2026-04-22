import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { extractText } from './parser';
import { processTextIngestion } from './ingestion';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

type FileIngestionJob = {
  documentId: string;
  userId: string;
  buffer: Buffer;
  mimetype: string;
  filename: string;
};

type UrlIngestionJob = {
  documentId: string;
  userId: string;
  text: string;
  mimetype: string;
  filename: string;
  isUrl: true;
};

type IngestionJobData = FileIngestionJob | UrlIngestionJob;

const queueName = 'ingestion';
const allowInlineFallback =
  env.NODE_ENV !== 'production' || process.env.QUEUE_INLINE_FALLBACK === 'true';

let connection: IORedis | null = null;
let queue: Queue<IngestionJobData> | null = null;

function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

function getQueue(): Queue<IngestionJobData> {
  if (!queue) {
    queue = new Queue<IngestionJobData>(queueName, { connection: getConnection() });
  }
  return queue;
}

async function processIngestionData(name: string, data: IngestionJobData) {
  const { documentId, userId } = data;

  try {
    if (name === 'process-file') {
      const fileData = data as FileIngestionJob;
      const parsed = await extractText(fileData.buffer, fileData.mimetype, fileData.filename);
      await processTextIngestion(userId, documentId, parsed.text, parsed.pageCount ?? 0, parsed.pages);
      return;
    }

    if (name === 'process-url') {
      const urlData = data as UrlIngestionJob;
      await processTextIngestion(userId, documentId, urlData.text);
      return;
    }

    throw new Error(`Unsupported ingestion job name: ${name}`);
  } catch (error: any) {
    logger.error(`Ingestion job failed for document ${documentId}`, { error: error?.message });
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}

export const ingestionQueue = {
  add: async (name: string, data: IngestionJobData) => {
    try {
      return await getQueue().add(name, data);
    } catch (error: any) {
      if (!allowInlineFallback) {
        throw error;
      }

      logger.warn(`[QUEUE FALLBACK] Redis unavailable. Processing '${name}' inline.`, {
        error: error?.message,
      });
      await processIngestionData(name, data);
      return { id: `inline-${Date.now()}` };
    }
  },
};

export const initWorker = () => {
  const worker = new Worker<IngestionJobData>(
    queueName,
    async (job) => {
      await processIngestionData(job.name, job.data);
    },
    { connection: getConnection() }
  );

  worker.on('completed', (job) => {
    logger.info(`Ingestion job completed`, { jobId: job.id, name: job.name });
  });

  worker.on('failed', (job, error) => {
    logger.error(`Ingestion job failed`, {
      jobId: job?.id,
      name: job?.name,
      error: error?.message,
    });
  });

  logger.info('Background ingestion worker initialized');
  return worker;
};

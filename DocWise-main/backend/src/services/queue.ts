import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { extractText } from './parser';
import { processTextIngestion } from './ingestion';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { downloadFile } from './fileStorage';

type FileIngestionJob = {
  documentId: string;
  userId: string;
  s3Key: string;
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
type DeadLetterJobData = IngestionJobData & {
  failedReason: string;
  failedAt: string;
  attemptsMade: number;
};

const queueName = 'ingestion';
const deadLetterQueueName = 'ingestion-dead-letter';
const allowInlineFallback =
  env.NODE_ENV !== 'production' || process.env.QUEUE_INLINE_FALLBACK === 'true';
const ingestionJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

let connection: IORedis | null = null;
let queue: Queue<IngestionJobData> | null = null;
let deadLetterQueue: Queue<DeadLetterJobData> | null = null;

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

export function getDeadLetterQueue(): Queue<DeadLetterJobData> {
  if (!deadLetterQueue) {
    deadLetterQueue = new Queue<DeadLetterJobData>(deadLetterQueueName, { connection: getConnection() });
  }
  return deadLetterQueue;
}

async function processIngestionData(name: string, data: IngestionJobData, attemptsMade: number = 0) {
  const { documentId, userId } = data;

  try {
    if (name === 'process-file') {
      const fileData = data as FileIngestionJob;
      const buffer = await downloadFile(fileData.s3Key);
      const parsed = await extractText(buffer, fileData.mimetype, fileData.filename);
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
    logger.error(`Ingestion job failed for document ${documentId}`, { error: error?.message, attempt: attemptsMade });
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'FAILED',
        errorReason: error?.message || 'Unknown error',
        retryCount: attemptsMade
      },
    });
    throw error;
  }
}

export const ingestionQueue = {
  add: async (name: string, data: IngestionJobData) => {
    try {
      return await getQueue().add(name, data, ingestionJobOptions);
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
      await processIngestionData(job.name, job.data, job.attemptsMade);
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

    if (!job) {
      return;
    }

    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade >= attempts) {
      const deadLetterPayload: DeadLetterJobData = {
        ...job.data,
        failedReason: error?.message ?? 'Unknown ingestion failure',
        failedAt: new Date().toISOString(),
        attemptsMade: job.attemptsMade,
      };

      getDeadLetterQueue().add(job.name, deadLetterPayload).catch((deadLetterError) => {
        logger.error('Failed to persist ingestion dead-letter job', {
          jobId: job.id,
          name: job.name,
          error: deadLetterError?.message,
        });
      });
    }
  });

  logger.info('Background ingestion worker initialized');
  return worker;
};

export const getDeadLetterJobs = async () => {
  const q = getDeadLetterQueue();
  const jobs = await q.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  return jobs.map(j => ({
    id: j.id,
    name: j.name,
    data: j.data,
    timestamp: j.timestamp,
    finishedOn: j.finishedOn,
    failedReason: j.failedReason,
  }));
};

export const retryDeadLetterJob = async (jobId: string) => {
  const dlq = getDeadLetterQueue();
  const job = await dlq.getJob(jobId);
  
  if (!job) {
    throw new Error('Job not found in dead-letter queue');
  }

  await ingestionQueue.add(job.name, job.data);
  await job.remove();
  
  return { success: true };
};

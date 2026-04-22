import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { extractText } from './parser';
import { processTextIngestion } from './ingestion';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

// Mock Redis connection for local development without Redis
const redisConnection = { on: () => {} } as any;

// Mock ingestion queue to prevent connection errors
export const ingestionQueue = {
  add: async (name: string, data: any) => {
    logger.info(`[MOCK QUEUE] Job '${name}' added (Redis is offline)`, { data });
    return { id: 'mock-id' };
  }
} as any;


export const initWorker = () => {
  logger.info('[MOCK WORKER] Background worker initialized (Redis is offline)');
  return { on: () => {} } as any;
};

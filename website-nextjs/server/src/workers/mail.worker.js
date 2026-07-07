import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import mailService from '../services/mail.service.js';

/**
 * Mail Worker — processes jobs from the 'mail' BullMQ queue.
 *
 * Uses its own dedicated Redis connection (BullMQ requirement —
 * the worker blocks one connection with BRPOP, so it must not
 * share the connection used by the Queue or the rest of the app).
 */
const mailWorker = new Worker(
  'mail',
  async (job) => {
    const { to, subject, html, text } = job.data;

    // Validate required fields before attempting send
    if (!to || !subject) {
      throw new Error(`Mail job ${job.id} is missing required fields: to=${to}, subject=${subject}`);
    }

    console.log(`[mail-worker] Processing job ${job.id} → ${to}`);

    await mailService.send({ to, subject, html, text });

    console.log(`[mail-worker] Job ${job.id} completed → ${to}`);
  },
  {
    connection: createRedisConnection(),
    concurrency: 5, // process up to 5 emails in parallel
  }
);

// Job-level failure (after all retries exhausted)
mailWorker.on('failed', (job, err) => {
  console.error(`[mail-worker] Job ${job?.id} permanently failed after ${job?.attemptsMade} attempts:`, err.message);
});

// Worker-level error (Redis disconnect, etc.) — must be handled or Node crashes
mailWorker.on('error', (err) => {
  console.error('[mail-worker] Worker error:', err.message);
});

mailWorker.on('completed', (job) => {
  console.log(`[mail-worker] Job ${job.id} succeeded`);
});

/**
 * Graceful shutdown — wait for in-flight jobs to finish before closing.
 * Called from server.js shutdown handler.
 */
export async function closeMailWorker() {
  await mailWorker.close();
  console.log('[mail-worker] Worker closed gracefully');
}

export default mailWorker;
/**
 * mail.queue.js — STUBBED
 *
 * BullMQ workers require a long-running process and cannot run inside
 * Next.js serverless API routes. This stub replaces the real Queue so
 * the admin.service.js import doesn't crash at startup.
 *
 * TODO: Re-enable by running a separate worker process:
 *   node server/src/workers/mail.worker.js
 * and restore the real Queue connection here.
 */

const mailQueue = {
  // eslint-disable-next-line no-unused-vars
  add: async (name, data, opts) => {
    // TODO: re-enable BullMQ — for now, log the job instead of queuing it
    console.warn('[mailQueue STUB] Job not queued (BullMQ disabled):', name, data?.to);
    return { id: 'stub-job-id' };
  },
};

export default mailQueue;
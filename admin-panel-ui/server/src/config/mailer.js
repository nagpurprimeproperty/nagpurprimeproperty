import nodemailer from 'nodemailer';
import env from './env.js';

let transporter;

/**
 * Initialize and return the nodemailer transporter.
 * Validates that SMTP credentials are configured before creating it.
 * The transporter is created lazily and cached.
 */
const initMailer = () => {
  if (transporter) return transporter;

  // Guard: fail fast with a clear message rather than a cryptic SMTP error later
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in your environment.'
    );
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: Number(env.SMTP_PORT) === 465, // true for port 465 (TLS), false for STARTTLS
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    // Connection pool — reuse connections instead of opening a new one per email
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  // Verify connection on first init so misconfiguration is caught at startup
  transporter.verify((err) => {
    if (err) {
      console.error('[mailer] SMTP connection verification failed:', err.message);
    } else {
      console.log('[mailer] SMTP connection verified — ready to send');
    }
  });

  return transporter;
};

export default initMailer;
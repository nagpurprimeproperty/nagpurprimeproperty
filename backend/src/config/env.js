import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

const searchPaths = [
  path.resolve(process.cwd(), envFile),
  path.resolve(process.cwd(), '..', envFile),
  path.resolve(process.cwd(), '.env.production'),
  path.resolve(process.cwd(), '..', '.env.production'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

let envLoaded = false;
for (const p of searchPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log(`[Config] Loaded environment variables from: ${p}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('[Config] No environment file found. Using system environment variables.');
}

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
};

const isDev = process.env.NODE_ENV !== 'production';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,

  // DB
  MONGO_URI: required('MONGO_URI', isDev ? 'mongodb://127.0.0.1:27017/nagpur-property' : null),
  REDIS_URL: required('REDIS_URL', isDev ? 'redis://127.0.0.1:6379' : null),

  // Auth
  JWT_SECRET: required('JWT_SECRET', isDev ? 'dev-secret-key-change-in-prod' : null),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', isDev ? 'dev-refresh-secret' : null),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',

  // Frontend URL (used for reset-password links in emails)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // S3
  S3_REGION: process.env.S3_REGION || 'ap-south-1',
  S3_ENDPOINT: process.env.S3_ENDPOINT || '',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
  S3_BUCKET: process.env.S3_BUCKET || '',
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || '',

  // Mailer
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  // MSG91
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || '',
  MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || '',

  // Firebase — use either FIREBASE_SERVICE_ACCOUNT (full JSON) or the three individual vars
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT || '',
  // Individual vars (alternative to JSON blob above)
  FIREBASE_PROJECT_ID:    process.env.FIREBASE_PROJECT_ID    || '',
  FIREBASE_CLIENT_EMAIL:  process.env.FIREBASE_CLIENT_EMAIL  || '',
  FIREBASE_PRIVATE_KEY:   process.env.FIREBASE_PRIVATE_KEY   || '',

  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.GOOGLE_MAPS_KEY || '',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  // WhatsApp
  WHATSAPP_ENABLED: process.env.WHATSAPP_ENABLED === 'true',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'NagpurPrimeWhatsAppWebhook2026',
  WHATSAPP_OTP_TEMPLATE_NAME: process.env.WHATSAPP_OTP_TEMPLATE_NAME || '',
  WHATSAPP_LEAD_TEMPLATE_NAME: process.env.WHATSAPP_LEAD_TEMPLATE_NAME || 'new_lead_notification',
  WHATSAPP_LEAD_TEMPLATE_LANGUAGE: process.env.WHATSAPP_LEAD_TEMPLATE_LANGUAGE || process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'en_US',
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v25.0',
  WHATSAPP_OTP_TEMPLATE_LANGUAGE: process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'en_US',
  WHATSAPP_OTP_TEMPLATE_HAS_BUTTON: process.env.WHATSAPP_OTP_TEMPLATE_HAS_BUTTON === 'true',

  // Test Accounts
  TEST_NUMBERS: (process.env.TEST_NUMBERS || '9999999999,1234567890')
    .split(',')
    .map((num) => num.trim())
    .filter(Boolean),
  TEST_OTP: process.env.TEST_OTP || '1234',
};

export default env;
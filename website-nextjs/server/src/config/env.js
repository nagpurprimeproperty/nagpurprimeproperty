// Next.js automatically loads .env.local into process.env.
// We intentionally skip dotenv.config() here to avoid overwriting those values
// with a missing .env.development file.
// All variables below are read from process.env populated by Next.js.

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === null || value === '') {
    // Prevent Next.js build phase from crashing on missing runtime environment variables
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export';
    if (isBuild) {
      if (key === 'MONGO_URI') return 'mongodb://127.0.0.1:27017/nagpur-property-dummy';
      if (key === 'REDIS_URL') return 'redis://127.0.0.1:6379';
      return 'dummy-build-value';
    }
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
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
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
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
};

export default env;
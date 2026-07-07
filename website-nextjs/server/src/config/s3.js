import { S3Client } from '@aws-sdk/client-s3';
import env from './env.js';

let s3;

const initS3 = () => {
  if (!s3) {
    s3 = new S3Client({
      region: env.S3_REGION,

      endpoint: env.S3_ENDPOINT, // ACE S3 endpoint
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },

      forcePathStyle: true, // important for S3-compatible storage
    });

    console.log('✅ S3 (ACE) initialized');
  }

  return s3;
};

export default initS3;
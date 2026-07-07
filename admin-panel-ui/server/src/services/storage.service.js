import {
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import initS3 from '../config/s3.js';
import env from '../config/env.js';
import path from 'path';

const storageService = {
  // 🔹 Upload to S3
  upload: async (file, folder = 'general') => {
    if (!file) {
      throw {
        status: 400,
        message: 'No file provided',
      };
    }

    const s3 = initS3();

    const ext = path.extname(file.originalname);

    const fileName = `${folder}/${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const url = `${env.S3_PUBLIC_URL}/${fileName}`;

    return {
      url,
      key: fileName,
    };
  },

  // 🔹 Delete from S3
  delete: async (url) => {
    try {
      const s3 = initS3();

      // extract key from full URL
      const key = url.replace(`${env.S3_PUBLIC_URL}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      });

      await s3.send(command);

      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw {
        status: 500,
        message: 'Failed to delete file',
      };
    }
  },
};

export default storageService;
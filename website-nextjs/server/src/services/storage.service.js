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
      ACL: 'public-read',
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
      if (!url || typeof url !== 'string') {
        throw { status: 400, message: 'Invalid media URL' };
      }

      const s3UrlPrefix = `${env.S3_PUBLIC_URL}/`;
      if (!url.startsWith(s3UrlPrefix)) {
        throw { status: 400, message: 'URL does not belong to configured S3 storage' };
      }

      const key = url.slice(s3UrlPrefix.length);
      if (!key || key.trim() === '' || key.includes('..')) {
        throw { status: 400, message: 'Invalid S3 object key' };
      }

      const s3 = initS3();

      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      });

      await s3.send(command);

      return { success: true };
    } catch (error) {
      if (error.status) throw error;
      console.error('S3 delete error:', error.message);
      throw {
        status: 500,
        message: 'Failed to delete file',
      };
    }
  },
};

export default storageService;
import {
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import initS3 from '../config/s3.js';
import env from '../config/env.js';
import path from 'path';
import sharp from 'sharp';
import { writeFile, readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Point fluent-ffmpeg to the bundled static ffmpeg binary (no system install needed)
ffmpeg.setFfmpegPath(ffmpegStatic);

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

// ── Image compression ─────────────────────────────────────────────────────────
async function compressImage(buffer, isAvatar = false) {
  let pipeline = sharp(buffer);

  if (isAvatar) {
    // Avatars: square crop 400×400, 85% quality WebP
    pipeline = pipeline.resize(400, 400, { fit: 'cover', position: 'centre' });
  } else {
    // Property photos: max 1920px wide, keep aspect ratio, strip EXIF metadata
    pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
  }

  return pipeline.webp({ quality: isAvatar ? 85 : 80 }).toBuffer();
}

// ── Video compression (via temp files — ffmpeg requires file paths) ───────────
async function compressVideo(buffer) {
  const id = randomUUID();
  const inputPath = path.join(tmpdir(), `${id}-input.mp4`);
  const outputPath = path.join(tmpdir(), `${id}-output.mp4`);

  await writeFile(inputPath, buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',   // H.264 codec — widest compatibility
        '-crf 28',        // Quality factor: 18=lossless, 28=good compression, 51=worst
        '-preset fast',   // Encoding speed vs compression ratio
        '-c:a aac',       // AAC audio
        '-b:a 128k',      // 128 kbps audio
        '-movflags +faststart', // Move moov atom to start for streaming
      ])
      .save(outputPath)
      .on('end', resolve)
      .on('error', reject);
  });

  const compressed = await readFile(outputPath);

  // Clean up temp files (fire-and-forget)
  Promise.all([
    unlink(inputPath).catch(() => {}),
    unlink(outputPath).catch(() => {}),
  ]);

  return compressed;
}

const storageService = {
  // 🔹 Upload to S3 (with compression)
  upload: async (file, folder = 'general') => {
    if (!file) {
      throw {
        status: 400,
        message: 'No file provided',
      };
    }

    const s3 = initS3();
    const isAvatar = folder === 'avatars';
    let uploadBuffer = file.buffer;
    let contentType = file.mimetype;
    let ext = path.extname(file.originalname);

    // ── Compress images → WebP ───────────────────────────────────────
    if (IMAGE_TYPES.includes(file.mimetype)) {
      uploadBuffer = await compressImage(file.buffer, isAvatar);
      contentType = 'image/webp';
      ext = '.webp';
    }

    // ── Compress videos → MP4 (H.264) ───────────────────────────────
    else if (VIDEO_TYPES.includes(file.mimetype)) {
      uploadBuffer = await compressVideo(file.buffer);
      contentType = 'video/mp4';
      ext = '.mp4';
    }

    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: fileName,
      Body: uploadBuffer,
      ContentType: contentType,
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
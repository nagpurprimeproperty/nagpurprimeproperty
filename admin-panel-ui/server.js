const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Busboy = require('busboy');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { writeFile, readFile, unlink } = require('fs/promises');
const { tmpdir } = require('os');
const { randomUUID } = require('crypto');

// Point fluent-ffmpeg to the bundled static binary (no system install needed)
ffmpeg.setFfmpegPath(ffmpegStatic);

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

// ── Image compression ──────────────────────────────────────────────────────────
async function compressImage(buffer) {
  return sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

// ── Video compression (via temp files — ffmpeg requires file paths) ────────────
async function compressVideo(buffer) {
  const id = randomUUID();
  const inputPath = path.join(tmpdir(), `${id}-input.mp4`);
  const outputPath = path.join(tmpdir(), `${id}-output.mp4`);

  await writeFile(inputPath, buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',        // H.264 codec — widest compatibility
        '-crf 28',             // Quality factor: lower = better quality
        '-preset fast',        // Encoding speed vs compression ratio
        '-c:a aac',            // AAC audio
        '-b:a 128k',           // 128 kbps audio bitrate
        '-movflags +faststart',// Move moov atom to front for streaming
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

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3002', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── S3 helper for media uploads ──────────────────────────────────────────────
let _s3;
function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region: process.env.S3_REGION || 'ap-south-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
    console.log('✅ S3 (server.js) initialized');
  }
  return _s3;
}

async function uploadToS3(buffer, originalname, folder, contentType) {
  const ext = path.extname(originalname);
  const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  await getS3().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || '',
      Key: key,
      Body: buffer,
      ContentType: contentType || getMimeType(ext),
    })
  );
  const base = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || '';
  return `${base}/${key}`.replace(/\/+/g, '/').replace(':/', '://');
}

function getMimeType(ext) {
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.webm': 'video/webm',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

// ── Raw media upload handler (bypasses Next.js 10MB body limit) ───────────────
function handleMediaUpload(req, res) {
  return new Promise((resolve) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.statusCode = 401;
      res.end(JSON.stringify({ success: false, message: 'No token provided' }));
      return resolve();
    }
    try {
      jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.statusCode = 401;
      res.end(JSON.stringify({ success: false, message: 'Invalid token' }));
      return resolve();
    }

    const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
    const ALLOWED_VIDEO = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    const MAX_IMG = 10 * 1024 * 1024;
    const MAX_VID = 100 * 1024 * 1024;

    const busboy = Busboy({ headers: req.headers });
    const photos = [];
    let video = null;
    let photoCount = 0;

    busboy.on('file', (fieldname, file, info) => {
      const chunks = [];
      let size = 0;
      file.on('data', (chunk) => {
        size += chunk.length;
        chunks.push(chunk);
      });
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (fieldname === 'photos') {
          photoCount++;
          if (photoCount > 15) return;
          photos.push({ buffer, originalname: info.filename, mimetype: info.mimeType, size });
        } else if (fieldname === 'video') {
          video = { buffer, originalname: info.filename, mimetype: info.mimeType, size };
        }
      });
    });

    busboy.on('finish', async () => {
      try {
        if (photos.length === 0 && !video) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, message: 'No files provided. Send at least one photo or a video.' }));
          return resolve();
        }
        if (photos.length > 15) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, message: 'Maximum 15 photos allowed per upload batch.' }));
          return resolve();
        }
        for (const p of photos) {
          if (!ALLOWED_IMAGE.includes(p.mimetype)) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: `Invalid image type "${p.mimetype}". Allowed: JPEG, PNG, WebP.` }));
            return resolve();
          }
          if (p.size > MAX_IMG) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: `Image "${p.originalname}" exceeds 10 MB limit.` }));
            return resolve();
          }
        }
        if (video) {
          if (!ALLOWED_VIDEO.includes(video.mimetype)) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: `Invalid video type "${video.mimetype}". Allowed: MP4, MOV, AVI, WebM.` }));
            return resolve();
          }
          if (video.size > MAX_VID) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: 'Video exceeds 100 MB limit.' }));
            return resolve();
          }
        }

        // ── Compress photos → WebP ─────────────────────────────────────────
        const compressedPhotos = await Promise.all(
          photos.map(async (p) => {
            if (IMAGE_TYPES.includes(p.mimetype)) {
              const buf = await compressImage(p.buffer);
              return { buffer: buf, name: p.originalname.replace(/\.[^.]+$/, '.webp'), type: 'image/webp' };
            }
            return { buffer: p.buffer, name: p.originalname, type: p.mimetype };
          })
        );

        // ── Compress video → MP4 (H.264) ──────────────────────────────────────
        let compressedVideo = null;
        if (video) {
          if (VIDEO_TYPES.includes(video.mimetype)) {
            const buf = await compressVideo(video.buffer);
            compressedVideo = { buffer: buf, name: video.originalname.replace(/\.[^.]+$/, '.mp4'), type: 'video/mp4' };
          } else {
            compressedVideo = { buffer: video.buffer, name: video.originalname, type: video.mimetype };
          }
        }

        const photoUrls = await Promise.all(
          compressedPhotos.map((p) => uploadToS3(p.buffer, p.name, 'properties', p.type))
        );
        const videoUrl = compressedVideo
          ? await uploadToS3(compressedVideo.buffer, compressedVideo.name, 'properties/videos', compressedVideo.type)
          : null;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 201;
        res.end(JSON.stringify({
          success: true,
          data: { photos: photoUrls, video: videoUrl },
          message: 'Media uploaded successfully',
        }));
        resolve();
      } catch (err) {
        console.error('[media/upload] error:', err);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: err.message || 'Upload failed' }));
        resolve();
      }
    });

    busboy.on('error', (err) => {
      console.error('[media/upload] busboy error:', err);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, message: 'Failed to parse upload' }));
      resolve();
    });

    req.pipe(busboy);
  });
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Bypass Next.js body parser for large media uploads
      if (req.method === 'POST' && parsedUrl.pathname === '/api/v1/admin/media') {
        return handleMediaUpload(req, res);
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // ── Socket.io setup ────────────────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!dev && (!appUrl || appUrl.trim().length === 0)) {
    console.error('FATAL: NEXT_PUBLIC_APP_URL is required in production for CORS');
    process.exit(1);
  }
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: dev ? ['http://localhost:3000'] : [appUrl],
      methods: ['GET', 'POST'],
    },
  });

  // Admin notification namespace
  const adminNsp = io.of('/admin');

  adminNsp.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.adminUser = decoded;
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  adminNsp.on('connection', (socket) => {
    console.log(`[Socket] Admin connected: ${socket.id}`);

    socket.on('join', (data) => {
      if (data?.adminId) {
        const authedId = socket.adminUser?.id || socket.adminUser?._id;
        if (authedId && String(authedId) === String(data.adminId)) {
          socket.join(`admin:${data.adminId}`);
          if (dev) console.log(`[Socket] ${socket.id} joined room admin:${data.adminId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to join this room' });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Admin disconnected: ${socket.id}`);
    });
  });

  // User notification namespace
  const userNsp = io.of('/user');

  userNsp.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  userNsp.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on('join', (data) => {
      if (data?.userId) {
        const authedId = socket.user?.id || socket.user?._id;
        if (authedId && String(authedId) === String(data.userId)) {
          socket.join(`user:${data.userId}`);
          if (dev) console.log(`[Socket] ${socket.id} joined room user:${data.userId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to join this room' });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  // Expose io globally so API routes can emit
  global._io = io;
  global._adminNsp = adminNsp;
  global._userNsp = userNsp;

  // ── Polling Watcher for Admin Notifications (created by external Express backend) ────────────────
  let NotificationModel;
  try {
    NotificationModel = mongoose.model('Notification');
  } catch {
    const NotificationSchema = new mongoose.Schema({
      title: String,
      message: String,
      type: String,
      status: String,
      targetRole: String,
      deliveredByAdminBackend: Boolean,
      pushSent: Boolean,
    }, { strict: false, timestamps: true });
    NotificationModel = mongoose.model('Notification', NotificationSchema);
  }

  const POLL_INTERVAL_MS = 3000;
  let pollTimer = null;

  function startAdminNotificationWatch(adminNamespace) {
    console.log(`📡 Admin Notification Polling Watcher starting (every ${POLL_INTERVAL_MS / 1000}s)…`);

    const pollForNewNotifications = async () => {
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const pending = await NotificationModel.find({
          targetRole: { $in: ['admin', 'sub-admin', 'all'] },
          $or: [
            { deliveredByAdminBackend: false },
            { deliveredByAdminBackend: { $exists: false } },
          ],
          createdAt: { $gte: fiveMinutesAgo },
        }).sort({ createdAt: 1 }).lean();

        if (pending.length === 0) return;

        console.log(`[Admin Watcher] Found ${pending.length} undelivered admin notification(s). Processing…`);

        for (const notification of pending) {
          try {
            // Emit socket event to /admin namespace
            adminNamespace.emit('notification', {
              _id: String(notification._id),
              title: notification.title,
              message: notification.message,
              type: notification.type,
              status: notification.status,
              createdAt: notification.createdAt,
              pushSent: notification.pushSent,
              isRead: false,
            });

            // Mark as delivered by admin backend
            await NotificationModel.updateOne(
              { _id: notification._id },
              { $set: { deliveredByAdminBackend: true } }
            );
          } catch (err) {
            console.error(`[Admin Watcher] Failed to deliver notification ${notification._id}:`, err.message);
          }
        }
      } catch (err) {
        console.error('[Admin Watcher] Poll cycle error:', err.message);
      }
    };

    pollTimer = setInterval(pollForNewNotifications, POLL_INTERVAL_MS);
  }

  // Connect Mongoose client connection for the watcher
  if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('✅ Admin Watcher MongoDB Connected');
        startAdminNotificationWatch(adminNsp);
      })
      .catch((err) => {
        console.error('🚨 Admin Watcher MongoDB Connection failed:', err.message);
      });
  } else {
    console.warn('⚠️ MONGO_URI not found in env — Admin Watcher not started');
  }

  httpServer
    .once('error', (err) => {
      console.error(err);
      if (pollTimer) clearInterval(pollTimer);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io listening on /api/socket`);
    });
});

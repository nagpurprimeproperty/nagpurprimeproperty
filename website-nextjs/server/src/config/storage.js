import multer from 'multer';

// Use memory storage — files go directly to S3, not disk
const storage = multer.memoryStorage();

// File filter with per-field validation
const fileFilter = (req, file, cb) => {
  // Accept 'file' field name (single file upload - photo or video)
  if (file.fieldname === 'file') {
    // Allow images: JPEG, PNG, WebP (max 10MB each)
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    // Allow video: MP4 only (max 100MB)
    const videoTypes = ['video/mp4'];
    
    const allAllowed = [...imageTypes, ...videoTypes];
    
    if (!allAllowed.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed: JPEG, PNG, WebP (images) or MP4 (video). Got: ${file.mimetype}`));
    }
    
    // Check file size: 10MB for images, 100MB for videos
    if (imageTypes.includes(file.mimetype)) {
      if (file.size > 10 * 1024 * 1024) {
        return cb(new Error('Image file too large. Max 10MB per image.'));
      }
    } else if (videoTypes.includes(file.mimetype)) {
      if (file.size > 100 * 1024 * 1024) {
        return cb(new Error('Video file too large. Max 100MB.'));
      }
    }
    
    cb(null, true);
  }
  // Legacy: Photos field (kept for backward compatibility if needed)
  else if (file.fieldname === 'photos') {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Photos: Invalid type. Allowed: JPEG, PNG, WebP. Got: ${file.mimetype}`));
    }
    if (file.size > 10 * 1024 * 1024) {
      return cb(new Error('Photos: File too large. Max 10MB per photo.'));
    }
    cb(null, true);
  }
  // Legacy: Video field (kept for backward compatibility if needed)
  else if (file.fieldname === 'video') {
    const allowedTypes = ['video/mp4'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Video: Invalid type. Allowed: MP4. Got: ${file.mimetype}`));
    }
    if (file.size > 100 * 1024 * 1024) {
      return cb(new Error('Video: File too large. Max 100MB.'));
    }
    cb(null, true);
  } else {
    cb(new Error('Invalid field name. Use "file", "photos", or "video".'));
  }
};

const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB total (for single largest file)
};

const upload = multer({ storage, fileFilter, limits });

export default upload;
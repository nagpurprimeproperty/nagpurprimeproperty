import storageService from '../../services/storage.service.js';

export const uploadMedia = async (req, res, next) => {
  try {
    // Accept single file (either photo or video)
    const file = req.file;

    if (!file) {
      return next({
        statusCode: 400,
        message: 'No file provided. Please upload either a photo or video.',
      });
    }

    // Determine upload folder based on file type
    let uploadFolder = 'properties';
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      uploadFolder = 'properties/videos';
    }

    // Upload single file and get URL
    const result = await storageService.upload(file, uploadFolder);

    // Return single URL directly
    res.status(201).json({ 
      success: true, 
      data: {
        url: result.url || result,
        key: result.key,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    // req.body already validated by middleware
    // contains single url
    const url = req.body.url;

    const result = await storageService.delete(url);

    res.json({ 
      success: true, 
      message: 'Media deleted successfully',
      url: url
    });
  } catch (err) {
    next(err);
  }
};

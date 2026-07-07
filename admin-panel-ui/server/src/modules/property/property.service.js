import propertyRepository from '../../modules/property/property.repository.js';
import storageService from '../../services/storage.service.js';
import Subscription from '../../models/purchaseSubscription.model.js';
import User from '../../models/user.model.js';

// ─── Subscription helpers ─────────────────────────────────────────────────────

async function getActiveSubscription(brokerId) {
  if (!brokerId) return null;
  return Subscription.findOne({ userId: brokerId, status: 'Active' }).sort({ createdAt: -1 });
}

async function incrementUsage(subscriptionId, field, delta = 1) {
  if (!subscriptionId) return;
  if (delta < 0) {
    await Subscription.findByIdAndUpdate(subscriptionId, [
      {
        $set: {
          [field]: { $max: [0, { $add: [`$${field}`, delta] }] },
        },
      },
    ]);
  } else {
    await Subscription.findByIdAndUpdate(subscriptionId, {
      $inc: { [field]: delta },
    });
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const propertyService = {
  /** List properties with server-side filtering and pagination. */
  listProperties: async (params) => {
    return propertyRepository.findAll(params);
  },

  /** Get admin-facing stats. */
  getStats: async () => {
    return propertyRepository.getStats();
  },

  /** Distinct localities from listed properties (Active by default). */
  getDistinctLocalities: async (params = {}) => {
    return propertyRepository.getDistinctLocalities(params);
  },

  /** Get a single property by ID. */
  getProperty: async (id) => {
    const property = await propertyRepository.findById(id);
    if (!property) throw { status: 404, message: 'Property not found' };
    return property;
  },

  // ─── URL-based create (new flow) ────────────────────────────────────────────

  /**
   * Create a property using pre-uploaded media URLs.
   * Photos and video have already been uploaded via POST /api/v1/admin/media.
   * No file buffers — fast, lightweight JSON request.
   *
   * @param {object} payload - Includes photos: string[], video: string|null
   */
  createPropertyFromUrls: async (payload) => {
    const { photos = [], video = null, ...rest } = payload;

    if (photos.length > 15) {
      throw { status: 400, message: 'Maximum 15 photos allowed' };
    }

    // ── Subscription limit check ───────────────────────────────────────────
    const subscription = await getActiveSubscription(rest.brokerId);

    if (!subscription) {
      throw {
        status: 403,
        message: 'No active subscription found. Please purchase a plan before adding properties.',
      };
    }

    const broker =  await User.findOne({ _id: rest.brokerId,isDeleted: false,isActive: true ,isDeleted: false });
    if (!broker) throw { status: 400, message: 'Broker is not active' };

    if (!subscription.limits.isPropertyUploadUnlimited) {
      const used  = subscription.usage?.propertiesPosted ?? 0;
      const limit = subscription.limits.propertyUploads  ?? 0;
      if (used >= limit) {
        throw {
          status: 403,
          message: `Property limit reached (${used}/${limit}). Please upgrade your plan to add more properties.`,
        };
      }
    }

    const property = await propertyRepository.create({ ...rest, photos, video });

    await incrementUsage(subscription._id, 'usage.propertiesPosted', 1);

    return property;
  },

  // ─── URL-based update (new flow) ────────────────────────────────────────────

  /**
   * Update a property using pre-uploaded media URLs.
   * The caller sends the complete final list of photo URLs and the video URL.
   * Files to be removed should have been deleted via DELETE /api/v1/admin/media
   * before calling this endpoint.
   *
   * @param {string} id
   * @param {object} payload - Includes photos: string[], video: string|null
   */
  updatePropertyFromUrls: async (id, payload) => {
    const existing = await propertyRepository.findByIdRaw(id);
    if (!existing) throw { status: 404, message: 'Property not found' };

    const { photos, video, ...rest } = payload;

    if (!Array.isArray(photos) || photos.length === 0) {
      throw { status: 400, message: 'photos must be a non-empty array' };
    }

    if (photos.length > 15) {
      throw { status: 400, message: 'Maximum 15 photos allowed' };
    }

    const updated = await propertyRepository.updateById(id, {
      ...rest,
      photos,
      video: video ?? null,
    });

    return updated;
  },

  // ─── Legacy file-based create (kept for backward compat if needed) ───────────

  /**
   * @deprecated Use createPropertyFromUrls instead.
   * Create a new property uploading file buffers directly.
   */
  createProperty: async (payload, photoFiles = [], videoFile = null) => {
    if (photoFiles.length > 15) {
      throw { status: 400, message: 'Maximum 15 photos allowed' };
    }

    const subscription = await getActiveSubscription(payload.brokerId);

    if (!subscription) {
      throw {
        status: 403,
        message: 'No active subscription found. Please purchase a plan before adding properties.',
      };
    }

    if (!subscription.limits.isPropertyUploadUnlimited) {
      const used  = subscription.usage?.propertiesPosted ?? 0;
      const limit = subscription.limits.propertyUploads  ?? 0;
      if (used >= limit) {
        throw {
          status: 403,
          message: `Property limit reached (${used}/${limit}). Please upgrade your plan to add more properties.`,
        };
      }
    }

    const [photoUploads, videoUpload] = await Promise.all([
      photoFiles.length > 0
        ? Promise.all(photoFiles.map((f) => storageService.upload(f, 'properties')))
        : Promise.resolve([]),
      videoFile
        ? storageService.upload(videoFile, 'properties/videos')
        : Promise.resolve(null),
    ]);

    const property = await propertyRepository.create({
      ...payload,
      photos: photoUploads.map((u) => u.url),
      video:  videoUpload ? videoUpload.url : null,
    });

    await incrementUsage(subscription._id, 'usage.propertiesPosted', 1);

    return property;
  },

  // ─── Legacy file-based update (kept for backward compat if needed) ───────────

  /**
   * @deprecated Use updatePropertyFromUrls instead.
   */
  updateProperty: async (id, payload, photoFiles = [], videoFile = null) => {
    const existing = await propertyRepository.findByIdRaw(id);
    if (!existing) throw { status: 404, message: 'Property not found' };

    let photos = existing.photos || [];
    if (photoFiles.length > 0) {
      if (photos.length + photoFiles.length > 15) {
        throw { status: 400, message: 'Maximum 15 photos allowed in total' };
      }
      const uploads = await Promise.all(
        photoFiles.map((f) => storageService.upload(f, 'properties'))
      );
      photos = [...photos, ...uploads.map((u) => u.url)];
    }

    let video = existing.video;
    if (payload.removeVideo) {
      if (video) {
        try { await storageService.delete(video); } catch { /* best effort */ }
      }
      video = null;
      delete payload.removeVideo;
    } else if (videoFile) {
      const uploaded = await storageService.upload(videoFile, 'properties/videos');
      video = uploaded.url;
    }

    return propertyRepository.updateById(id, { ...payload, photos, video });
  },

  // ─── Delete (unchanged) ──────────────────────────────────────────────────────

  deleteProperty: async (id) => {
    const property = await propertyRepository.findByIdRaw(id);
    if (!property) throw { status: 404, message: 'Property not found' };

    const subscription = await getActiveSubscription(property.brokerId?.toString());

    const filesToDelete = [
      ...(property.photos || []),
      ...(property.video ? [property.video] : []),
    ];

    if (filesToDelete.length > 0) {
      await Promise.allSettled(
        filesToDelete.map((url) => {
          try { return storageService.delete(url); }
          catch { return Promise.resolve(); }
        })
      );
    }

    await propertyRepository.deleteById(id);

    if (subscription) {
      await incrementUsage(subscription._id, 'usage.propertiesPosted', -1);
      if (property.featured) {
        await incrementUsage(subscription._id, 'usage.featuredPropertiesUsed', -1);
      }
    }
  },

  updateStatus: async (id, status, options = {}) => {
    const property = await propertyRepository.findByIdRaw(id);
    if (!property) throw { status: 404, message: 'Property not found' };

    const update = { status };
    if (options.adminNotes)     update.adminNotes     = options.adminNotes;
    if (options.rejectedReason) update.rejectedReason = options.rejectedReason;

    return propertyRepository.updateById(id, update);
  },

  toggleFeatured: async (id) => {
    const property = await propertyRepository.findByIdRaw(id);
    if (!property) throw { status: 404, message: 'Property not found' };

    const turningOn = !property.featured;
    const subscription = await getActiveSubscription(property.brokerId?.toString());

    if (turningOn && subscription && !subscription.limits.isFeaturedPropertiesUnlimited) {
      const used  = subscription.usage?.featuredPropertiesUsed ?? 0;
      const limit = subscription.limits.featuredProperties       ?? 0;
      if (used >= limit) {
        throw {
          status: 403,
          message: `Featured property limit reached (${used}/${limit}). Upgrade your plan to feature more properties.`,
        };
      }
    }

    const updated = await propertyRepository.updateById(id, { featured: turningOn });

    if (subscription) {
      await incrementUsage(subscription._id, 'usage.featuredPropertiesUsed', turningOn ? 1 : -1);
    }

    return updated;
  },

  setFeatured: async (id, featured) => {
    const property = await propertyRepository.findByIdRaw(id);
    if (!property) throw { status: 404, message: 'Property not found' };

    const turningOn  = !!featured && !property.featured;
    const turningOff = !featured  &&  property.featured;

    if (turningOn) {
      const subscription = await getActiveSubscription(property.brokerId?.toString());

      if (subscription && !subscription.limits.isFeaturedPropertiesUnlimited) {
        const used  = subscription.usage?.featuredPropertiesUsed ?? 0;
        const limit = subscription.limits.featuredProperties       ?? 0;
        if (used >= limit) {
          throw {
            status: 403,
            message: `Featured property limit reached (${used}/${limit}). Upgrade your plan to feature more properties.`,
          };
        }
      }

      const updated = await propertyRepository.updateById(id, { featured: true });
      if (subscription) await incrementUsage(subscription._id, 'usage.featuredPropertiesUsed', 1);
      return updated;
    }

    if (turningOff) {
      const subscription = await getActiveSubscription(property.brokerId?.toString());
      const updated = await propertyRepository.updateById(id, { featured: false });
      if (subscription) await incrementUsage(subscription._id, 'usage.featuredPropertiesUsed', -1);
      return updated;
    }

    return propertyRepository.updateById(id, { featured: !!featured });
  },

  removePhotos: async (id, photoUrls) => {
    const property = await propertyRepository.findByIdRaw(id);
    if (!property) throw { status: 404, message: 'Property not found' };

    const remaining = property.photos.filter((url) => !photoUrls.includes(url));
    if (remaining.length === 0) {
      throw { status: 400, message: 'Property must have at least one photo' };
    }

    await Promise.allSettled(
      photoUrls.map((url) => {
        try { return storageService.delete(url); }
        catch { return Promise.resolve(); }
      })
    );

    return propertyRepository.updateById(id, { photos: remaining });
  },
};

export default propertyService;
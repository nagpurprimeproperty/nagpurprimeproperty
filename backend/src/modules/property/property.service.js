import propertyRepository from '../../modules/property/property.repository.js';
import storageService from '../../services/storage.service.js';
import Subscription from '../subscription/purchaseSubscription.model.js';
import User from '../user/user.model.js';
import RecentlySearchedKeywords from './recentlySearchedKeywords.js';
import mongoose from 'mongoose';
import propertyViewsRepository from './propertyViews.repository.js';
import PropertyViews from './propertyViews.model.js';
import Lead from '../lead/leads.model.js';
import { getOrSet, invalidateCache } from '../../utils/cache.js';

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
  listProperties: async (params, userId) => {
    if (params?.search && userId) {
      try {
        await RecentlySearchedKeywords.findOneAndUpdate(
          {
            userId: new mongoose.Types.ObjectId(userId),
            keyword: params.search.trim(),
          },
          { searchedAt: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.error('Error updating recently searched keywords:', err);
      }
    }
    return propertyRepository.findAll(params, userId);
  },

  getSimilarProperties: async (propertyId, userId) => {
    return propertyRepository.findSimilarProperties(propertyId, userId);
  },

  /** Get admin-facing stats. */
  getStats: async () => {
    return getOrSet('property:stats', () => propertyRepository.getStats(), 300);
  },

  /** Distinct localities from listed properties (Active by default). */
  getDistinctLocalities: async (params = {}) => {
    const status = params.status || 'Active';
    return getOrSet(
      `property:distinct-localities:${status}`,
      () => propertyRepository.getDistinctLocalities({ status }),
      300
    );
  },

  /** Get a single property by ID. */
  getProperty: async (id, userId, userIp, session) => {
  const property = await propertyRepository.findById(id, userId, session);
  if (!property) throw { status: 404, message: 'Property not found' };

  const realId = property._id;

  const hasViewed = await propertyViewsRepository.hasViewed(realId, userIp, userId);
  if (!hasViewed) {
    await propertyViewsRepository.addView(realId, userIp, userId, session);
  }

  // Aggregate view and lead counts
  const [viewCount, leadCount] = await Promise.all([
    PropertyViews.countDocuments({ propertyId: realId }),
    Lead.countDocuments({ propertyId: realId }),
  ]);
  property.views = viewCount;
  property.inquiries = leadCount;

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

    const broker = await User.findOne({ _id: rest.brokerId, isDeleted: false, isActive: true });
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

    await invalidateCache(['property:*']);

    // ── FIRST_PROPERTY notification (fire-and-forget) ──────────────────────
    const userPropertiesCount = await propertyRepository.countByBroker(rest.brokerId);
    if (userPropertiesCount === 1) {
      import('../../services/notificationDelivery.service.js')
        .then(({ sendNotification }) =>
          sendNotification({
            userId: rest.brokerId,
            title: 'Congratulations!',
            message: 'Your first property has been listed successfully.',
            type: 'FIRST_PROPERTY',
          })
        )
        .catch((err) => console.error('[Notification] FIRST_PROPERTY failed:', err.message));
    }

    return property;
  },

  // ─── URL-based update (new flow) ────────────────────────────────────────────

  /**
   * Update a property using pre-uploaded media URLs.
   * The caller sends only the fields they want to update.
   * Files to be removed should have been deleted via DELETE /api/v1/admin/media
   * before calling this endpoint.
   *
   * @param {string} id
   * @param {object} payload - Partial update with optional photos, video, and other fields
   */
  updatePropertyFromUrls: async (id, payload) => {
    const existing = await propertyRepository.findByIdRaw(id);
    if (!existing) throw { status: 404, message: 'Property not found' };

    const { photos, video, ...rest } = payload;

    // Only validate photos if they are provided in the update
    if (photos !== undefined) {
      if (!Array.isArray(photos) || photos.length === 0) {
        throw { status: 400, message: 'photos must be a non-empty array' };
      }

      if (photos.length > 15) {
        throw { status: 400, message: 'Maximum 15 photos allowed' };
      }
    }

    // Build update object with only provided fields
    const updateData = { ...rest };
    if (photos !== undefined) {
      updateData.photos = photos;
    }
    if (video !== undefined) {
      updateData.video = video ?? null;
    }

    const updated = await propertyRepository.updateById(id, updateData);

    await invalidateCache(['property:*']);

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

    await invalidateCache(['property:*']);

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

    const updated = await propertyRepository.updateById(id, { ...payload, photos, video });
    await invalidateCache(['property:*']);
    return updated;
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

    await invalidateCache(['property:*']);

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

    const updated = await propertyRepository.updateById(id, update);
    await invalidateCache(['property:*']);
    return updated;
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

    await invalidateCache(['property:*']);
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
      await invalidateCache(['property:*']);
      return updated;
    }

    if (turningOff) {
      const subscription = await getActiveSubscription(property.brokerId?.toString());
      const updated = await propertyRepository.updateById(id, { featured: false });
      if (subscription) await incrementUsage(subscription._id, 'usage.featuredPropertiesUsed', -1);
      await invalidateCache(['property:*']);
      return updated;
    }

    const updated = await propertyRepository.updateById(id, { featured: !!featured });
    await invalidateCache(['property:*']);
    return updated;
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

    const updated = await propertyRepository.updateById(id, { photos: remaining });
    await invalidateCache(['property:*']);
    return updated;
  },

  getMostPopularAreasCount: async (limit = 5) => {
    return getOrSet(
      `property:popular-areas:${limit}`,
      async () => {
        const results = await propertyRepository.getMostPopularAreas({ limit });
        return results.map((r) => ({
          locality: r._id,
          count: r.count,
          latitude: r.latitude || null,
          longitude: r.longitude || null
        }));
      },
      300
    );
  },

  // ---------------------- My Properties (user-scoped) ----------------------
  listMyProperties: async function (userId, params = {}) {
    const query = { ...params, brokerId: userId };
    return this.listProperties(query, userId);
  },

  getMyPropertyById: async function (userId, id) {
    const raw = await propertyRepository.findByIdRaw(id);
    if (!raw) throw { status: 404, message: 'Property not found' };
    if (!raw.brokerId || String(raw.brokerId) !== String(userId)) throw { status: 403, message: 'Forbidden' };
    return this.getProperty(id, userId);
  },

  createMyProperty: async function (userId, payload) {
    const body = { ...payload, brokerId: userId };
    return this.createPropertyFromUrls(body);
  },

  updateMyProperty: async function (userId, id, payload) {
    const raw = await propertyRepository.findByIdRaw(id);
    if (!raw) throw { status: 404, message: 'Property not found' };
    if (!raw.brokerId || String(raw.brokerId) !== String(userId)) throw { status: 403, message: 'Forbidden' };
    return this.updatePropertyFromUrls(id, payload);
  },

  deleteMyProperty: async function (userId, id) {
    const raw = await propertyRepository.findByIdRaw(id);
    if (!raw) throw { status: 404, message: 'Property not found' };
    if (!raw.brokerId || String(raw.brokerId) !== String(userId)) throw { status: 403, message: 'Forbidden' };
    return this.deleteProperty(id);
  },

  toggleFeaturedMyProperty: async function (userId, id) {
    const raw = await propertyRepository.findByIdRaw(id);
    if (!raw) throw { status: 404, message: 'Property not found' };
    if (!raw.brokerId || String(raw.brokerId) !== String(userId)) throw { status: 403, message: 'Forbidden' };
    return this.toggleFeatured(id);
  },

  updateMyPropertyStatus: async function (userId, id, status) {
    const allowedStatuses = ['Active', 'Sold', 'Inactive'];
    if (!allowedStatuses.includes(status)) {
      throw { status: 400, message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` };
    }
    const raw = await propertyRepository.findByIdRaw(id);
    if (!raw) throw { status: 404, message: 'Property not found' };
    if (!raw.brokerId || String(raw.brokerId) !== String(userId)) throw { status: 403, message: 'Forbidden' };
    return this.updateStatus(id, status);
  },
}

export default propertyService;
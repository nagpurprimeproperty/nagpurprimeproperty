import { create } from 'zustand';

// ─── Upload Cache ─────────────────────────────────────────────────────────────
// Maps local file URIs → uploaded CDN URLs returned by the media upload API.
// This store is intentionally kept separate from propertyWizardStore so that
// upload progress / CDN URL bookkeeping never causes re-renders in wizard UI
// components that don't care about upload state.

export interface UploadCache {
  // key = local file URI, value = CDN URL returned by the upload API
  photoUrls: Record<string, string>;
  videoUrl: string | null;  // CDN URL of the uploaded video
  isUploading: boolean;     // true while any upload is in-flight
}

export interface PropertyUploadStore {
  uploadCache: UploadCache;

  // Map a local URI → CDN URL after a successful photo upload
  setUploadedPhotoUrl: (localUri: string, cdnUrl: string) => void;

  // Remove a cached CDN URL (call this alongside removePhoto in the wizard)
  removeUploadedPhotoUrl: (localUri: string) => void;

  // Store the CDN URL returned after a successful video upload
  setUploadedVideoUrl: (cdnUrl: string | null) => void;

  // Toggle the global uploading flag
  setUploadingMedia: (val: boolean) => void;

  // Reset the upload cache — call as part of the full wizard reset flow
  resetUploadCache: () => void;
}

const initialUploadCache: UploadCache = {
  photoUrls: {},
  videoUrl: null,
  isUploading: false,
};

export const usePropertyUploadStore = create<PropertyUploadStore>((set) => ({
  uploadCache: initialUploadCache,

  setUploadedPhotoUrl: (localUri, cdnUrl) =>
    set((s) => ({
      uploadCache: {
        ...s.uploadCache,
        photoUrls: { ...s.uploadCache.photoUrls, [localUri]: cdnUrl },
      },
    })),

  removeUploadedPhotoUrl: (localUri) =>
    set((s) => {
      const { [localUri]: _dropped, ...rest } = s.uploadCache.photoUrls;
      return { uploadCache: { ...s.uploadCache, photoUrls: rest } };
    }),

  setUploadedVideoUrl: (cdnUrl) =>
    set((s) => ({ uploadCache: { ...s.uploadCache, videoUrl: cdnUrl } })),

  setUploadingMedia: (val) =>
    set((s) => ({ uploadCache: { ...s.uploadCache, isUploading: val } })),

  resetUploadCache: () =>
    set({ uploadCache: initialUploadCache }),
}));

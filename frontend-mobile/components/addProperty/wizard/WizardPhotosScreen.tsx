import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { usePropertyWizardStore, PREDEFINED_AMENITIES } from '@/store/propertyWizardStore';
import { usePropertyUploadStore } from '@/store/propertyUploadStore';
import { uploadFile } from '@/services/uploadService';
import { prepareImageForUpload } from '@/shared/utils/imagePrep';
import { toast } from 'react-hot-toast/headless';
import { validateStepPhotos } from '@/lib/validation';
import { Camera, Image as ImageIcon, Trash2, Star, Plus, List, ArrowRight, Check, AlertCircle, Video, CheckCircle, CloudUpload } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';
import { VideoView, useVideoPlayer } from 'expo-video';

// ─── Video Preview ─────────────────────────────────────────────────────────────

function VideoPreview({ videoUrl }: { videoUrl: string }) {
  const safeUri = videoUrl ? decodeURIComponent(videoUrl) : null;
  const player = useVideoPlayer(safeUri ? { uri: safeUri } : null, (p) => {
    p.loop = false;
    p.bufferOptions = {
      maxBufferBytes: 2 * 1024 * 1024, // 2MB buffer limit to prevent Android OOM
      prioritizeTimeOverSizeThreshold: false,
    };
  });

  if (!safeUri || !player) {
    return null;
  }

  return (
    <View style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginTop: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={true}
      />
    </View>
  );
}

async function requestMediaPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    toast.error('Please allow access to your photo library.');
    return false;
  }
  return true;
}

async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    toast.error('Please allow camera access.');
    return false;
  }
  return true;
}

export default function WizardPhotosScreen() {
  // ── Use individual selectors to avoid re-rendering on every store change ──
  const step5 = usePropertyWizardStore((s) => s.step5);
  const errors = usePropertyWizardStore((s) => s.errors);
  const step6 = usePropertyWizardStore((s) => s.step6);
  const addPhoto = usePropertyWizardStore((s) => s.addPhoto);
  const reorderPhotos = usePropertyWizardStore((s) => s.reorderPhotos);
  const setErrors = usePropertyWizardStore((s) => s.setErrors);
  const goToPhase = usePropertyWizardStore((s) => s.goToPhase);
  const updateStep5 = usePropertyWizardStore((s) => s.updateStep5);
  const toggleAmenity = usePropertyWizardStore((s) => s.toggleAmenity);
  const addCustomAmenity = usePropertyWizardStore((s) => s.addCustomAmenity);

  // ── Eager upload cache ─────────────────────────────────────────────────────────
  const uploadCache           = usePropertyUploadStore((s) => s.uploadCache);
  const setUploadedPhotoUrl   = usePropertyUploadStore((s) => s.setUploadedPhotoUrl);
  const setUploadedVideoUrl   = usePropertyUploadStore((s) => s.setUploadedVideoUrl);
  const setUploadingMedia     = usePropertyUploadStore((s) => s.setUploadingMedia);
  const removeUploadedPhotoUrl = usePropertyUploadStore((s) => s.removeUploadedPhotoUrl);

  // removePhoto must purge both stores atomically
  const removePhotoFromStore = usePropertyWizardStore((s) => s.removePhoto);
  const removePhoto = (uri: string) => {
    removePhotoFromStore(uri);
    removeUploadedPhotoUrl(uri);
  };

  // Local set of URIs currently being uploaded (for per-card spinner)
  const [uploadingUris, setUploadingUris] = useState<Set<string>>(new Set());
  // Track video upload state
  const [videoUploading, setVideoUploading] = useState(false);
  // Ref to count in-flight uploads so setUploadingMedia is accurate
  const inFlightCount = useRef(0);

  const markInFlight = (delta: 1 | -1) => {
    inFlightCount.current += delta;
    setUploadingMedia(inFlightCount.current > 0);
  };

  /** Upload a single photo URI in the background and cache the CDN URL */
  const uploadPhotoInBackground = useCallback(
    async (uri: string) => {
      // Skip if already a remote URL or already cached
      if (uri.startsWith('http://') || uri.startsWith('https://')) return;
      if (uploadCache.photoUrls[uri]) return;

      setUploadingUris((prev) => new Set(prev).add(uri));
      markInFlight(1);
      try {
        const cdnUrl = await uploadFile(uri);
        setUploadedPhotoUrl(uri, cdnUrl);
      } catch (err) {
        if (__DEV__) {
          console.warn('[WizardPhotos] Photo upload failed:', err);
        }
        // Non-fatal: submit will retry
      } finally {
        setUploadingUris((prev) => {
          const next = new Set(prev);
          next.delete(uri);
          return next;
        });
        markInFlight(-1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadCache.photoUrls, setUploadedPhotoUrl]
  );

  /** Upload the video URI in the background and cache the CDN URL */
  const uploadVideoInBackground = useCallback(
    async (uri: string) => {
      if (uri.startsWith('http://') || uri.startsWith('https://')) return;
      setVideoUploading(true);
      markInFlight(1);
      try {
        const cdnUrl = await uploadFile(uri);
        setUploadedVideoUrl(cdnUrl);
        toast.success('Video uploaded successfully');
      } catch (err) {
        if (__DEV__) {
          console.warn('[WizardPhotos] Video upload failed:', err);
        }
        // Non-fatal: submit will retry
      } finally {
        setVideoUploading(false);
        markInFlight(-1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUploadedVideoUrl]
  );

  const { photos, video } = step5;
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const { width } = useWindowDimensions();

  const handleAddAmenity = () => {
    const trimmed = newAmenityName.trim();
    if (!trimmed) {
      toast.error('Amenity name cannot be empty.');
      return;
    }
    if (trimmed.length > 50) {
      toast.error('Amenity name cannot exceed 50 characters.');
      return;
    }
    
    const isPredefinedDuplicate = PREDEFINED_AMENITIES.some(
      (a) => a.toLowerCase() === trimmed.toLowerCase()
    );
    const isCustomDuplicate = (step6.customAmenities || []).some(
      (a) => a.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (isPredefinedDuplicate || isCustomDuplicate) {
      toast.error('This amenity already exists.');
      return;
    }
    
    addCustomAmenity(trimmed);
    
    if (!step6.amenities.includes(trimmed)) {
      toggleAmenity(trimmed);
    }
    
    toast.success('Amenity added successfully');
    setNewAmenityName('');
    setShowAddModal(false);
  };

  const maxPhotos = 15;
  const photoCount = photos.length;

  const handlePickFromLibrary = useCallback(async () => {
    if (!(await requestMediaPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxPhotos - photoCount,
        exif: false,
      });
      if (!result.canceled) {
        const newUris: string[] = [];
        // Resize each picked photo before it enters the store or upload queue.
        // prepareImageForUpload falls back to the original URI on error — no drops.
        for (const a of result.assets) {
          const preparedUri = await prepareImageForUpload(a.uri);
          addPhoto(preparedUri);
          newUris.push(preparedUri);
          if (errors.photos) {
            const updated = { ...errors };
            delete updated.photos;
            setErrors(updated);
          }
        }
        // ── Eagerly upload resized photos in the background ──
        newUris.forEach((uri) => uploadPhotoInBackground(uri));
      }
    } catch {
      toast.error('Could not open photo library.');
    } finally {
      setLoading(false);
    }
  }, [photoCount, addPhoto, errors, setErrors, uploadPhotoInBackground]);

  const handleTakePhoto = useCallback(async () => {
    if (!(await requestCameraPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        exif: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        // Resize the captured photo before it enters the store or upload queue.
        const preparedUri = await prepareImageForUpload(result.assets[0].uri);
        addPhoto(preparedUri);
        if (errors.photos) {
          const updated = { ...errors };
          delete updated.photos;
          setErrors(updated);
        }
        // ── Eagerly upload resized camera photo in the background ──
        uploadPhotoInBackground(preparedUri);
      }
    } catch {
      toast.error('Could not open camera.');
    } finally {
      setLoading(false);
    }
  }, [addPhoto, errors, setErrors, uploadPhotoInBackground]);

  const handlePickVideo = useCallback(async () => {
    if (!(await requestMediaPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        quality: 0.8,
        videoMaxDuration: 120,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];

        // 1. Duration Validation (Limit to 2 minutes / 120 seconds)
        if (asset.duration && asset.duration > 120000) {
          toast.error('Please select a video under 2 minutes.');
          return;
        }

        // 2. File Size Validation (Limit to 100MB to prevent OOM)
        let sizeInBytes = asset.fileSize;
        if (!sizeInBytes) {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (fileInfo.exists) {
            sizeInBytes = fileInfo.size;
          }
        }

        const maxSizeBytes = 100 * 1024 * 1024; // 100MB
        if (sizeInBytes && sizeInBytes > maxSizeBytes) {
          toast.error(`Selected video is ${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB. Please select a video under 100MB.`);
          return;
        }

        updateStep5({ video: asset.uri });
        // Clear any old cached video CDN URL since the video changed
        setUploadedVideoUrl(null);
        // ── Eagerly upload the video in the background ──
        uploadVideoInBackground(asset.uri);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[handlePickVideo] Error:', error);
      }
      toast.error('Could not select video.');
    } finally {
      setLoading(false);
    }
  }, [updateStep5, setUploadedVideoUrl, uploadVideoInBackground]);

  const handleAddPhoto = useCallback(() => {
    if (photoCount >= maxPhotos) {
      toast.error(`You can upload a maximum of ${maxPhotos} photos.`);
      return;
    }
    Alert.alert('Add Photo', 'Choose source', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Photo Library', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [photoCount, handleTakePhoto, handlePickFromLibrary]);

  const handleMoveForward = (index: number) => {
    if (index < photoCount - 1) {
      reorderPhotos(index, index + 1);
    }
  };

  const handleMoveBackward = (index: number) => {
    if (index > 0) {
      reorderPhotos(index, index - 1);
    }
  };

  const handleContinue = () => {
    if (uploadCache.isUploading) {
      toast.error('Please wait while your photos/video finish uploading before continuing.');
      return;
    }
    const stepErrors = validateStepPhotos(photos);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToPhase('review');
  };

  return (
    <View style={{ backgroundColor: '#FFFDFA' }} className="flex-1 justify-between">
      {/* Scrollable Container */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 20, paddingBottom: 110 }}
        className="flex-1"
      >
        {/* Step Badge */}
        <View className="flex-row mb-4">
          <View
            style={{
              backgroundColor: '#FCF5EC',
              borderColor: 'rgba(249, 115, 22, 0.15)',
            }}
            className="flex-row items-center border rounded-full px-3.5 py-1.5 gap-1.5"
          >
            <List size={13} color={colors.primary} strokeWidth={2.5} />
            <Text className="text-orange-600 text-[10px] font-black uppercase tracking-wider">
              Step 10 of 11
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Add Photos
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Upload clear photos. The first image will be shown as the primary cover photo in listing cards.
          </Text>
        </View>

        {/* Action picker cards */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handlePickFromLibrary}
            activeOpacity={0.8}
            style={{ backgroundColor: '#FFFFFF', ...shadows.card }}
            className="flex-1 border border-[#E2E8F0] rounded-xl py-5 px-4 items-center justify-center"
          >
            <ImageIcon size={22} color={colors.primary} className="mb-2" strokeWidth={2.5} />
            <Text className="text-slate-800 text-xs font-black uppercase tracking-wider">
              Photo Library
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTakePhoto}
            activeOpacity={0.8}
            style={{ backgroundColor: '#FFFFFF', ...shadows.card }}
            className="flex-1 border border-[#E2E8F0] rounded-xl py-5 px-4 items-center justify-center"
          >
            <Camera size={22} color={colors.primary} className="mb-2" strokeWidth={2.5} />
            <Text className="text-slate-800 text-xs font-black uppercase tracking-wider">
              Take Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photos Count Indicator */}
        <View className="flex-row items-center justify-between mb-4 px-1">
          <Text className="text-slate-800 font-extrabold text-sm uppercase tracking-wider">
            Uploaded Photos ({photoCount}/{maxPhotos})
          </Text>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {/* Errors Block */}
        {errors.photos && (
          <View className="flex-row items-center gap-1.5 mb-4 px-1">
            <AlertCircle size={14} color={colors.error} />
            <Text className="text-red-500 text-xs font-bold leading-4">
              {errors.photos}
            </Text>
          </View>
        )}

        {/* Photos Grid */}
        <View className="flex-row flex-wrap gap-3">
          {photos.map((uri, index) => {
            const isCover = index === 0;
            return (
              <View
                key={uri}
                style={{
                  width: (width - 48 - 12) / 2, // 2 column layout
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  ...shadows.card,
                }}
                className="rounded-xl overflow-hidden p-2 relative"
              >
                {/* Image */}
                <Image
                  source={{ uri }}
                  style={{ height: 110, borderRadius: 18 }}
                  className="w-full bg-slate-100"
                />

                {/* Cover Photo Badge */}
                {isCover && (
                  <View
                    style={{ backgroundColor: colors.primary }}
                    className="absolute top-4 left-4 flex-row items-center px-2.5 py-1 rounded-lg"
                  >
                    <Star size={10} color="#FFF" fill="#FFF" className="mr-1" />
                    <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                      Cover
                    </Text>
                  </View>
                )}

                {/* Action buttons (Delete & Reorder) */}
                <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <View className="flex-row gap-1">
                    {/* Move Back */}
                    {index > 0 && (
                      <TouchableOpacity
                        onPress={() => handleMoveBackward(index)}
                        activeOpacity={0.7}
                        className="w-7 h-7 rounded-lg bg-slate-50 items-center justify-center border border-slate-200"
                      >
                        <Text className="text-slate-600 font-black text-xs">←</Text>
                      </TouchableOpacity>
                    )}
                    {/* Move Forward */}
                    {index < photoCount - 1 && (
                      <TouchableOpacity
                        onPress={() => handleMoveForward(index)}
                        activeOpacity={0.7}
                        className="w-7 h-7 rounded-lg bg-slate-50 items-center justify-center border border-slate-200"
                      >
                        <Text className="text-slate-600 font-black text-xs">→</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Upload status badge */}
                  {uploadingUris.has(uri) ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : uploadCache.photoUrls[uri] ? (
                    <CheckCircle size={15} color={colors.success ?? '#22c55e'} />
                  ) : null}

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => removePhoto(uri)}
                    activeOpacity={0.7}
                    className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 items-center justify-center"
                  >
                    <Trash2 size={13} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Plus Add Placeholder card */}
          {photoCount < maxPhotos && (
            <TouchableOpacity
              onPress={handleAddPhoto}
              activeOpacity={0.8}
              style={{
                width: (width - 48 - 12) / 2,
                height: 154,
                borderColor: colors.primary,
                borderStyle: 'dashed',
                borderWidth: 1.5,
              }}
              className="rounded-xl items-center justify-center bg-orange-50/10"
            >
              <Plus size={32} color={colors.primary} strokeWidth={2.5} />
              <Text className="text-orange-600 text-xs font-black uppercase mt-2 tracking-wider">
                Add More
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Video Upload Section */}
        <View className="mt-8 border-t border-slate-100 pt-6">
          <Text className="text-slate-800 font-extrabold text-xs mb-2 uppercase tracking-wider">
            Property Video (Optional)
          </Text>
          <Text className="text-slate-400 text-xs font-semibold mb-4 leading-4">
            Upload a video walkthrough (max 2 minutes) to give buyers a virtual tour of your property.
          </Text>

          {video ? (
            <View>
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  ...shadows.card,
                }}
                className="rounded-xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  <View className="w-10 h-10 rounded-lg bg-orange-50 items-center justify-center">
                    <Video size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 text-xs font-bold" numberOfLines={1}>
                      {video.split('/').pop() || 'Selected Video'}
                    </Text>
                    {/* Video upload status */}
                    {videoUploading ? (
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text className="text-orange-500 text-[10px] font-bold">Uploading…</Text>
                      </View>
                    ) : uploadCache.videoUrl ? (
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <CheckCircle size={11} color={colors.success ?? '#22c55e'} />
                        <Text style={{ color: colors.success ?? '#22c55e' }} className="text-[10px] font-bold">Uploaded</Text>
                      </View>
                    ) : (
                      <Text className="text-slate-400 text-[10px] font-semibold mt-0.5">Ready for upload</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    updateStep5({ video: null });
                    setUploadedVideoUrl(null);
                  }}
                  activeOpacity={0.7}
                  className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 items-center justify-center"
                >
                  <Trash2 size={14} color={colors.error} />
                </TouchableOpacity>
              </View>

              <VideoPreview videoUrl={video} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickVideo}
              activeOpacity={0.8}
              style={{
                borderColor: colors.primary,
                borderStyle: 'dashed',
                borderWidth: 1.5,
              }}
              className="rounded-xl py-6 items-center justify-center bg-orange-50/10"
            >
              <Video size={24} color={colors.primary} strokeWidth={2.5} />
              <Text className="text-orange-600 text-xs font-black uppercase mt-2 tracking-wider">
                Select Video Walkthrough
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Amenities Selection Section */}
        <View className="mt-8 border-t border-slate-100 pt-6">
          <Text className="text-slate-800 font-extrabold text-xs mb-2 uppercase tracking-wider">
            Select Available Amenities
          </Text>
          <Text className="text-slate-400 text-xs font-semibold mb-4 leading-4">
            Select the utilities and amenities present at this property.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {[...PREDEFINED_AMENITIES, ...(step6.customAmenities || [])].map((am) => {
              const isSel = step6.amenities.includes(am);
              return (
                <TouchableOpacity
                  key={am}
                  onPress={() => toggleAmenity(am)}
                  activeOpacity={0.75}
                  style={{
                    backgroundColor: isSel ? '#FCF5EC' : '#FFFFFF',
                    borderColor: isSel ? colors.primary : '#E2E8F0',
                    borderWidth: isSel ? 1.8 : 1,
                  }}
                  className="flex-row items-center rounded-full px-4 py-2"
                >
                  {isSel && (
                    <View
                      style={{ backgroundColor: colors.primary }}
                      className="w-3.5 h-3.5 rounded-full items-center justify-center mr-1.5"
                    >
                      <Check size={9} color="#FFF" strokeWidth={4} />
                    </View>
                  )}
                  <Text
                    style={{ color: isSel ? colors.primaryDark : colors.textSecondary }}
                    className="text-xs font-bold"
                  >
                    {am}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Add More Amenities Chip */}
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.75}
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: colors.primary,
                borderStyle: 'dashed',
                borderWidth: 1.5,
              }}
              className="flex-row items-center rounded-full px-4 py-2"
            >
              <Plus size={13} color={colors.primary} className="mr-1.5" strokeWidth={3} />
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-black"
              >
                Add More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add Custom Amenity Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setNewAmenityName('');
          setShowAddModal(false);
        }}
      >
        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-[340px]" style={shadows.card}>
            <Text className="text-slate-900 text-lg font-black tracking-tight mb-2">
              Add New Amenity
            </Text>
            <Text className="text-slate-500 text-xs font-medium mb-4 leading-5">
              Enter the name of the custom amenity you would like to add.
            </Text>
            
            <TextInput
              placeholder="e.g. Infinity Pool"
              value={newAmenityName}
              onChangeText={setNewAmenityName}
              maxLength={50}
              autoFocus
              placeholderTextColor={colors.textPlaceholder}
              style={{
                height: 48,
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 16,
              }}
              className="text-slate-800 text-sm font-semibold mb-6"
            />
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setNewAmenityName('');
                  setShowAddModal(false);
                }}
                activeOpacity={0.8}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white items-center"
              >
                <Text className="text-slate-500 font-bold text-xs">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddAmenity}
                activeOpacity={0.85}
                style={{ backgroundColor: colors.primary }}
                className="flex-1 py-3.5 rounded-xl items-center"
              >
                <Text className="text-white font-black text-xs">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Next Button */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: 'rgba(241, 245, 249, 0.8)',
          backgroundColor: '#FFFFFF',

        }}
        className="absolute bottom-0 left-0 right-0 p-5"
      >
        {/* Upload progress banner */}
        {uploadCache.isUploading && (
          <View
            style={{ backgroundColor: '#FFF7ED', borderColor: 'rgba(249,115,22,0.2)', borderWidth: 1 }}
            className="flex-row items-center gap-2 rounded-xl px-4 py-2.5 mb-3"
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="text-orange-600 text-xs font-bold flex-1">Uploading media in background…</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={uploadCache.isUploading ? 1 : 0.85}
          style={{
            backgroundColor: uploadCache.isUploading ? '#94A3B8' : '#1E293B',
          }}
          className="w-full h-14 rounded-2xl flex-row items-center justify-center"
        >
          {uploadCache.isUploading ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-black text-sm tracking-wider">Uploading…</Text>
            </>
          ) : (
            <>
              <Text className="text-white font-black text-sm tracking-wider mr-2">Continue</Text>
              <ArrowRight size={16} color="#FFF" strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}


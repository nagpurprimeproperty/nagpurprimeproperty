import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, BackHandler, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'react-hot-toast/headless';

import { usePropertyWizardStore } from '@/store/propertyWizardStore';
import { usePropertyUploadStore } from '@/store/propertyUploadStore';
import { useAuthStore } from '@/features/auth';
import { useModal } from '@/context/ModalContext';
import { uploadFile } from '@/services/uploadService';
import { validateState } from '@/lib/validation';
import { useCreateMyProperty, useUpdateMyProperty } from '@/features/property';
import { useMySubscription } from '@/hooks/useSubscriptionHooks';
import StepProgressBar from '@/components/addProperty/StepProgressBar';

// Wizard screens
import WizardListedByScreen from '@/components/addProperty/wizard/WizardListedByScreen';
import WizardCategoryScreen from '@/components/addProperty/wizard/WizardCategoryScreen';
import WizardTypeScreen from '@/components/addProperty/wizard/WizardTypeScreen';
import WizardBasicInfoScreen from '@/components/addProperty/wizard/WizardBasicInfoScreen';
import WizardLocalityScreen from '@/components/addProperty/wizard/WizardLocalityScreen';
import WizardMapScreen from '@/components/addProperty/wizard/WizardMapScreen';
import WizardDetailsAScreen from '@/components/addProperty/wizard/WizardDetailsAScreen';
import WizardDetailsBScreen from '@/components/addProperty/wizard/WizardDetailsBScreen';
import WizardPricingScreen from '@/components/addProperty/wizard/WizardPricingScreen';
import WizardPhotosScreen from '@/components/addProperty/wizard/WizardPhotosScreen';
import WizardReviewScreen from '@/components/addProperty/wizard/WizardReviewScreen';

import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

const getPhaseForField = (field: string): string | null => {
  const basicInfoFields = ['title', 'description'];
  const mapFields = ['latitude', 'longitude'];
  const localityFields = ['locality', 'subLocality', 'landmark', 'pinCode'];
  
  const detailsAFields = [
    'bhk', 'bathrooms', 'balcony', 'carpetArea', 'builtUpArea', 
    'superBuiltUpArea', 'plotArea', 'plotAreaSqFt', 'floorNumber', 'totalFloors'
  ];
  
  const detailsBFields = [
    'furnishing', 'ownershipType', 'readyToMove', 'ageOfProperty', 'facing',
    'reraNumber', 'projectReraNumber', 'builderName', 'projectName', 'possessionDate',
    'constructionStatus', 'developmentStatus', 'layoutProjectName'
  ];
  
  const pricingFields = [
    'totalPrice', 'monthlyRent', 'securityDeposit', 'maintenance', 
    'annualLease', 'bookingAmount', 'pricePerSqft'
  ];
  
  const photosFields = ['photos', 'video'];

  if (basicInfoFields.includes(field)) return 'basic_info';
  if (mapFields.includes(field)) return 'map';
  if (localityFields.includes(field)) return 'locality';
  if (detailsAFields.includes(field)) return 'details_a';
  if (detailsBFields.includes(field)) return 'details_b';
  if (pricingFields.includes(field)) return 'pricing';
  if (photosFields.includes(field)) return 'photos';
  
  return null;
};

export default function AddProperty() {
  const wizardPhase = usePropertyWizardStore((s) => s.wizardPhase);
  const isSubmitting = usePropertyWizardStore((s) => s.isSubmitting);
  const setSubmitting = usePropertyWizardStore((s) => s.setSubmitting);
  const resetAll = usePropertyWizardStore((s) => s.resetAll);
  const resetUploadCache = usePropertyUploadStore((s) => s.resetUploadCache);
  const goToPhase = usePropertyWizardStore((s) => s.goToPhase);
  const editingPropertyId = usePropertyWizardStore((s) => s.editingPropertyId);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { openAuth } = useModal();

  const insets = useSafeAreaInsets();
  const topInset = insets?.top ?? 0;
  const bottomInset = insets?.bottom ?? 0;
  const router = useRouter();

  const createMutation = useCreateMyProperty();
  const updateMutation = useUpdateMyProperty();

  // ── Subscription limit check ─────────────────────────────────────────────────
  // enabled=false when not authenticated → zero network cost for guests
  const { data: subData, isLoading: subLoading } = useMySubscription(isAuthenticated);
  const activeSub = subData?.data ?? null;

  // Derived block flags — only block on NEW property creation, never on edits
  const isNewProperty = !editingPropertyId;
  const hasNoActivePlan  = isAuthenticated && isNewProperty && !subLoading && !activeSub;
  const isLimitReached   =
    isAuthenticated &&
    isNewProperty &&
    !subLoading &&
    !!activeSub &&
    !activeSub.limits.isPropertyUploadUnlimited &&
    activeSub.usage.propertiesPosted >= activeSub.limits.propertyUploads;

  // Derived display values for the limit-reached block (safe when activeSub is null)
  const limitUsed     = activeSub?.usage.propertiesPosted ?? 0;
  const limitTotal    = activeSub?.limits.propertyUploads ?? 0;
  const limitPlanName = activeSub?.planName ?? 'Current Plan';

  // ── ALL hooks must be declared unconditionally before any early return ────────

  const handleSubmit = useCallback(async () => {
    const state = usePropertyWizardStore.getState();
    // Validate full wizard state using Zod + dynamic field rules
    const errors = validateState(state);
    if (Object.keys(errors).length > 0) {
      usePropertyWizardStore.getState().setErrors(errors);
      const first = Object.entries(errors)[0];
      toast.error(first[1] as string);
      return;
    }

    setSubmitting(true);
    try {
      const { uploadCache } = usePropertyUploadStore.getState();

      // 1. Resolve photo URLs: use cached CDN URL if already uploaded, else upload now
      const uploadedUrls = await Promise.all(
        state.step5.photos.map((uri) => {
          if (uploadCache.photoUrls[uri]) return Promise.resolve(uploadCache.photoUrls[uri]);
          return uploadFile(uri); // fallback: upload any that weren't pre-uploaded
        })
      );

      // 2. Resolve video URL: use cached CDN URL if already uploaded, else upload now
      let uploadedVideoUrl: string | null = null;
      if (state.step5.video) {
        uploadedVideoUrl = uploadCache.videoUrl
          ? uploadCache.videoUrl
          : await uploadFile(state.step5.video);
      }

      // 3. Build the normalized submission payload matching backend requirements
      const payload = state.buildSubmitPayload(uploadedUrls, uploadedVideoUrl);

      // 4. Post/Put to the real backend endpoint using mutations
      let success = false;
      if (state.editingPropertyId) {
        const response = await updateMutation.mutateAsync({ id: state.editingPropertyId, payload });
        success = response.success;
      } else {
        const response = await createMutation.mutateAsync(payload);
        success = response.success;
      }

      if (success) {
        toast.success(
          state.editingPropertyId
            ? 'Your property listing has been updated successfully.'
            : 'Your property listing has been published successfully.'
        );
        resetAll();
        resetUploadCache();
        router.push('/(myListing)/myProperties' as any);
      } else {
        throw new Error('Listing submission returned unsuccessful status');
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('[handleSubmit] Submission Error:', err?.response?.data || err);
      }

      let errorMsg = 'Could not upload media or publish property. Please check your network and try again.';
      let alertMsg = errorMsg;

      if (err?.response?.data) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          // Get the first error to show in a clean toast
          const firstErr = data.errors[0];
          alertMsg = firstErr.message || data.message || 'Validation Error';

          // Set errors in the store so specific fields highlight red
          const apiErrors: Record<string, string> = {};
          data.errors.forEach((e: any) => {
            if (e.field) {
              apiErrors[e.field] = e.message;
            }
          });
          if (Object.keys(apiErrors).length > 0) {
            usePropertyWizardStore.getState().setErrors(apiErrors);
            
            // Auto-navigate to the wizard step/phase containing the first error
            const firstField = data.errors.find((e: any) => e.field)?.field;
            if (firstField) {
              const targetPhase = getPhaseForField(firstField);
              if (targetPhase) {
                goToPhase(targetPhase as any);
              }
            }
          }
        } else {
          errorMsg = data.message || data.error || errorMsg;
          alertMsg = errorMsg;
        }
      }

      toast.error(alertMsg);
    } finally {
      setSubmitting(false);
    }
  }, [setSubmitting, resetAll, resetUploadCache, router, createMutation, updateMutation]);

  const handleBack = useCallback(() => {
    switch (wizardPhase) {
      case 'listed_by': {
        const origin = usePropertyWizardStore.getState().editOrigin;
        resetAll();
        resetUploadCache();
        if (origin) {
          router.push(origin as any);
        } else {
          router.push('/(tabs)/home');
        }
        break;
      }
      case 'category':
        goToPhase('listed_by');
        break;
      case 'type':
        goToPhase('category');
        break;
      case 'basic_info':
        goToPhase('type');
        break;
      case 'map':
        goToPhase('basic_info');
        break;
      case 'locality':
        goToPhase('map');
        break;
      case 'details_a':
        goToPhase('locality');
        break;
      case 'details_b':
        goToPhase('details_a');
        break;
      case 'pricing':
        goToPhase('details_b');
        break;
      case 'photos':
        goToPhase('pricing');
        break;
      case 'review': {
        const editId = usePropertyWizardStore.getState().editingPropertyId;
        if (editId) {
          const origin = usePropertyWizardStore.getState().editOrigin;
          resetAll();
          resetUploadCache();
          if (origin) {
            router.push(origin as any);
          } else {
            router.push('/(tabs)/home');
          }
        } else {
          goToPhase('photos');
        }
        break;
      }
      default:
        break;
    }
  }, [wizardPhase, goToPhase, router, resetAll, resetUploadCache]);

  // Android hardware back button — must be registered unconditionally
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true; // prevent default back behavior
    });
    return () => sub.remove();
  }, [handleBack]);

  // ── All hooks declared. Now safe to do conditional renders. ──────────────────

  // 1. Not logged in
  if (!isAuthenticated) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-8"
        style={{ paddingTop: topInset }}
      >
        <View className="w-20 h-20 rounded-3xl bg-orange-100 items-center justify-center mb-6">
          <Ionicons name="lock-closed" size={36} color={colors.primary} />
        </View>
        <Text className="text-slate-900 text-xl font-black text-center tracking-tight">
          Login Required
        </Text>
        <Text className="text-slate-400 text-sm font-medium text-center mt-2 leading-5">
          Please verify your phone number to list a property.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openAuth('addProperty')}
          className="mt-8 h-14 bg-orange-500 rounded-2xl flex-row items-center justify-center px-6 min-w-[220px]"
          style={shadows.button}
        >
          <Text className="text-white font-black text-sm uppercase tracking-wider text-center" numberOfLines={1}>
            Verify Number
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Subscription loading shimmer (only for new property, not edits)
  if (isNewProperty && subLoading) {
    return (
      <View style={[ls.root, { paddingTop: topInset }]}>
        <View style={ls.shimmerIcon} />
        <View style={ls.shimmerTitle} />
        <View style={ls.shimmerSub} />
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  // 3. No active subscription — must purchase a plan first
  if (hasNoActivePlan) {
    return (
      <View style={[ls.root, { paddingTop: topInset }]}>
        <View style={ls.blobTopRight} />
        <View style={ls.blobBottomLeft} />

        <View style={ls.iconWrap}>
          <Ionicons name="star-outline" size={38} color={colors.primary} />
        </View>

        <Text style={ls.title}>Subscription Required</Text>
        <Text style={ls.subtitle}>
          You need an active plan to list properties on Nagpur Prime Property.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(subscription)/subscription' as any)}
          style={[ls.primaryBtn, shadows.button]}
        >
          <Ionicons name="flash" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={ls.primaryBtnText}>Browse Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/home' as any)}
          style={ls.secondaryBtn}
        >
          <Text style={ls.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 4. Listing limit reached — must upgrade plan
  if (isLimitReached) {
    return (
      <View style={[ls.root, { paddingTop: topInset }]}>
        <View style={ls.blobTopRight} />
        <View style={ls.blobBottomLeft} />

        <View style={ls.badgeRow}>
          <View style={ls.badge}>
            <Ionicons name="alert-circle" size={11} color={colors.primary} />
            <Text style={ls.badgeText}>Limit Reached</Text>
          </View>
        </View>

        <View style={ls.iconWrap}>
          <Ionicons name="home-outline" size={38} color={colors.primary} />
        </View>

        <Text style={ls.title}>Listing Limit Reached</Text>
        <Text style={ls.subtitle}>
          You've used all {limitTotal} listing{limitTotal !== 1 ? 's' : ''} included in your{' '}
          <Text style={ls.planName}>{limitPlanName}</Text> plan.
        </Text>

        <View style={ls.usagePill}>
          <View style={ls.usageDot} />
          <Text style={ls.usageText}>
            {limitUsed} / {limitTotal} listings used
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(subscription)/subscription' as any)}
          style={[ls.primaryBtn, shadows.button]}
        >
          <Ionicons name="arrow-up-circle" size={17} color="#fff" style={{ marginRight: 8 }} />
          <Text style={ls.primaryBtnText}>Upgrade Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(subscription)/mySubscription' as any)}
          style={ls.secondaryBtn}
        >
          <Text style={ls.secondaryBtnText}>View My Subscription</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 5. Normal wizard — render current phase
  const getListingCategoryLabel = () => {
    const category = usePropertyWizardStore.getState().step1.listingCategory;
    if (category === 'resale') return 'Resale';
    if (category === 'rental') return 'Rental';
    if (category === 'new') return 'New project';
    return null;
  };

  const renderPhaseScreen = () => {
    switch (wizardPhase) {
      case 'listed_by':
        return <WizardListedByScreen />;
      case 'category':
        return <WizardCategoryScreen />;
      case 'type':
        return <WizardTypeScreen />;
      case 'basic_info':
        return <WizardBasicInfoScreen />;
      case 'locality':
        return <WizardLocalityScreen />;
      case 'map':
        return <WizardMapScreen />;
      case 'details_a':
        return <WizardDetailsAScreen />;
      case 'details_b':
        return <WizardDetailsBScreen />;
      case 'pricing':
        return <WizardPricingScreen />;
      case 'photos':
        return <WizardPhotosScreen />;
      case 'review':
        return <WizardReviewScreen onSubmit={handleSubmit} />;
      default:
        return <WizardListedByScreen />;
    }
  };

  const bottomOffset = bottomInset + 12;

  return (
    <View
      style={{ paddingTop: topInset, paddingBottom: bottomOffset, backgroundColor: '#FFFDFA' }}
      className="flex-1"
    >
      {/* 1. Global Wizard Header Progress Bar */}
      <StepProgressBar
        currentPhase={wizardPhase}
        onBack={handleBack}
        categoryLabel={getListingCategoryLabel()}
      />

      {/* 2. active phase screen */}
      <View className="flex-1">
        {isSubmitting ? (
          <View className="flex-1 items-center justify-center bg-white/80 absolute inset-0 z-50">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-slate-700 text-sm font-black mt-4 uppercase tracking-wider">
              {editingPropertyId ? 'Updating Listing...' : 'Publishing Listing...'}
            </Text>
            <Text className="text-slate-400 text-[11px] font-bold mt-2 text-center px-8">
              {editingPropertyId
                ? 'Saving modifications and syncing details with Nagpur Prime Property servers.'
                : 'Uploading media assets and registering details with Nagpur Prime Property servers.'}
            </Text>
          </View>
        ) : null}
        {renderPhaseScreen()}
      </View>
    </View>
  );
}


// ─── Limit / Subscription block screen styles ──────────────────────────────────
const ls = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFDFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  // Decorative background blobs
  blobTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(249,115,22,0.08)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(249,115,22,0.06)',
  },
  // Badge
  badgeRow: {
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(249,115,22,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'hsl(24, 94%, 50%)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Icon circle
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(249,115,22,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  // Text
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  planName: {
    fontWeight: '800',
    color: 'hsl(24, 94%, 50%)',
  },
  // Usage pill
  usagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  usageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  usageText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.2,
  },
  // Buttons
  primaryBtn: {
    height: 54,
    backgroundColor: 'hsl(24, 94%, 50%)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.6,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  // Shimmer / loading placeholders
  shimmerIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    marginBottom: 24,
  },
  shimmerTitle: {
    width: 200,
    height: 20,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  shimmerSub: {
    width: 260,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
});

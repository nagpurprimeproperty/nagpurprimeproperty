import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { validateStepBasicInfo } from '@/lib/validation';
import { ArrowRight, List, AlertCircle } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

export default function WizardBasicInfoScreen() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep1 = useAddPropertyStore((s) => s.updateStep1);
  const setErrors = useAddPropertyStore((s) => s.setErrors);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);

  const handleContinue = () => {
    const stepErrors = validateStepBasicInfo(step1.title, step1.description);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToPhase('map');
  };

  const handleTitleChange = (title: string) => {
    updateStep1({ title });
    if (errors.title) {
      const updated = { ...errors };
      delete updated.title;
      setErrors(updated);
    }
  };

  const handleDescChange = (description: string) => {
    updateStep1({ description });
    if (errors.description) {
      const updated = { ...errors };
      delete updated.description;
      setErrors(updated);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: '#FFFDFA' }}
      className="flex-1"
    >
      {/* Scrollable Form */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
              Step 4 of 11
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Property title & description
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Make your listing stand out with a compelling description.
          </Text>
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
            Property Title
          </Text>
          <TextInput
            placeholder="e.g. Elegant 3 BHK Flat near Manish Nagar Metro"
            value={step1.title}
            onChangeText={handleTitleChange}
            placeholderTextColor={colors.textPlaceholder}
            style={{
              height: 54,
              backgroundColor: '#FFFFFF',
              borderColor: errors.title ? colors.error : '#EBE4DB',
              borderWidth: errors.title ? 1.5 : 1,
              borderRadius: 12
            }}
            className="px-5 text-slate-800 text-sm font-semibold"
          />
          {errors.title ? (
            <View className="flex-row items-center gap-1.5 mt-2">
              <AlertCircle size={12} color={colors.error} />
              <Text className="text-red-500 text-xs font-bold leading-4">
                {errors.title}
              </Text>
            </View>
          ) : (
            <Text className="text-slate-400 text-[10px] font-bold mt-2 leading-4">
              Avoid vague titles. Focus on BHK, Property type, and Key Locality milestones.
            </Text>
          )}
        </View>

        {/* Description Textarea */}
        <View className="mb-6">
          <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
            Description
          </Text>
          <TextInput
            multiline
            numberOfLines={6}
            placeholder="Describe your property details, nearby facilities, connectivity, society amenities, etc. (min 10 characters)"
            value={step1.description}
            onChangeText={handleDescChange}
            placeholderTextColor={colors.textPlaceholder}
            style={{
              height: 140,
              textAlignVertical: 'top',
              backgroundColor: '#FFFFFF',
              borderColor: errors.description ? colors.error : '#EBE4DB',
              borderWidth: errors.description ? 1.5 : 1,
              borderRadius: 12
            }}
            className="px-5 py-4 text-slate-800 text-sm font-semibold"
          />
          {errors.description && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <AlertCircle size={12} color={colors.error} />
              <Text className="text-red-500 text-xs font-bold leading-4">
                {errors.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Area */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: 'rgba(241, 245, 249, 0.8)',
          backgroundColor: '#FFFFFF',
          
        }}
        className="absolute bottom-0 left-0 right-0 p-5"
      >
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#1E293B',
            
          }}
          className="w-full h-14 rounded-xl flex-row items-center justify-center"
        >
          <Text className="text-white font-black text-sm tracking-wider mr-2">
            Continue
          </Text>
          <ArrowRight size={16} color="#FFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}


import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { useRouter } from 'expo-router';
import { MapPin, CheckCircle, Navigation, List } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

export default function WizardMapScreen() {
  const step2 = useAddPropertyStore((s) => s.step2);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isPinned = step2.latitude !== null && step2.longitude !== null;

  const handleOpenMap = () => {
    router.push('/(screens)/mapPicker' as any);
  };

  const handleContinue = () => {
    goToPhase('locality');
  };

  return (
    <View style={{ backgroundColor: '#FFFDFA' }} className="flex-1 justify-between px-6 pb-8 pt-5">
      {/* Top Part */}
      <View className="flex-1 justify-center">
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
              Step 5 of 11
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Confirm location
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Pin the exact coordinates of your property for buyers/tenants.
          </Text>
        </View>

        {/* Pinned / Unpinned State */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: isPinned ? colors.success : '#E2E8F0',
            borderWidth: 1.5,
            ...shadows.card,
          }}
          className="rounded-3xl p-6 items-center"
        >
          {isPinned ? (
            <>
              {/* Pinned Icon */}
              <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
                <CheckCircle size={36} color={colors.success} strokeWidth={2.5} />
              </View>

              <Text className="text-slate-900 text-lg font-black tracking-tight text-center">
                Location Confirmed!
              </Text>
              
              <Text className="text-slate-500 text-xs font-semibold text-center mt-2.5 leading-5">
                Locality: <Text className="text-slate-800 font-extrabold">{step2.locality}</Text>
                {step2.subLocality ? `\nSub-Locality: ${step2.subLocality}` : ''}
                {`\nCoordinates: ${step2.latitude?.toFixed(5)}, ${step2.longitude?.toFixed(5)}`}
              </Text>

              <TouchableOpacity
                onPress={handleOpenMap}
                activeOpacity={0.75}
                style={{ borderColor: 'rgba(249, 115, 22, 0.25)', backgroundColor: 'rgba(249, 115, 22, 0.04)' }}
                className="mt-6 border border-dashed rounded-xl px-5 py-3"
              >
                <Text className="text-orange-600 text-xs font-black uppercase tracking-wider">
                  Edit Map Pin
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Unpinned Icon */}
              <View className="w-16 h-16 rounded-full bg-orange-50 items-center justify-center mb-4">
                <MapPin size={32} color={colors.primary} strokeWidth={2.5} />
              </View>

              <Text className="text-slate-900 text-lg font-black tracking-tight text-center">
                Pin Location on Map
              </Text>
              
              <Text className="text-slate-500 text-xs font-semibold text-center mt-2 px-4 leading-5">
                You selected <Text className="text-slate-800 font-extrabold">{step2.locality}</Text>. Please drop a pin on the Nagpur map to confirm the exact location.
              </Text>

              <TouchableOpacity
                onPress={handleOpenMap}
                activeOpacity={0.8}
                style={{ backgroundColor: colors.primary }}
                className="mt-6 flex-row items-center rounded-2xl px-6 py-4"
              >
                <Navigation size={16} color="#FFF" className="mr-2" strokeWidth={2.5} />
                <Text className="text-white text-xs font-black uppercase tracking-wider">
                  Open Nagpur Map
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Bottom CTA Button */}
      {isPinned && (
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#1E293B',
            shadowColor: '#1E293B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
          className="w-full h-14 rounded-2xl flex-row items-center justify-center"
        >
          <Text className="text-white font-black text-sm tracking-wider">
            Continue
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


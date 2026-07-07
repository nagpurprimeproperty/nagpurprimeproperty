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
import { validateStepDetailsA } from '@/lib/validation';
import { ArrowRight, Minus, Plus, List, AlertCircle } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

export default function WizardDetailsAScreen() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const step3 = useAddPropertyStore((s) => s.step3);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep3 = useAddPropertyStore((s) => s.updateStep3);
  const updateStep3Batch = useAddPropertyStore((s) => s.updateStep3Batch);
  const setErrors = useAddPropertyStore((s) => s.setErrors);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);

  const type = step1.propertyType || 'flat';

  // Initialize stepper fields to their min values if currently undefined
  React.useEffect(() => {
    const defaultValues: Record<string, any> = {};
    let changed = false;

    const checkAndSet = (key: string, minVal: number) => {
      if (step3[key] === undefined || step3[key] === null) {
        defaultValues[key] = minVal;
        changed = true;
      }
    };

    if (['flat', 'builder_floor', 'penthouse'].includes(type)) {
      checkAndSet('bhk', 0);
      checkAndSet('bathrooms', 0);
      checkAndSet('balconies', 0);
    } else if (type === 'villa') {
      checkAndSet('bhk', 0);
      checkAndSet('bathrooms', 0);
      checkAndSet('parkingSlots', 0);
    } else if (type === 'office') {
      checkAndSet('washrooms', 1);
    } else if (type === 'showroom') {
      checkAndSet('numberOfShowroomFloors', 1);
    } else if (type === 'warehouse') {
      checkAndSet('numberOfDocks', 0);
    }

    if (changed) {
      updateStep3Batch(defaultValues);
    }
  }, [type]);

  // Stepper handlers
  const handleFieldChange = (key: string, val: any) => {
    updateStep3(key, val);
    if (errors[key]) {
      const updated = { ...errors };
      delete updated[key];
      setErrors(updated);
    }
  };

  const handleContinue = () => {
    const stepErrors = validateStepDetailsA(step3, type);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToPhase('details_b');
  };

  // Full-width card stepper helper (matching Step 1/2 design)
  const renderCardStepper = (key: string, label: string, min: number = 0, max: number = 20, isRequired: boolean = false) => {
    const currentNum = step3[key] !== undefined && step3[key] !== null ? Number(step3[key]) : min;
    const baseForControls = currentNum;
    const displayValue = String(currentNum);
    const onChange = (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned === '') {
        handleFieldChange(key, min);
        return;
      }
      const parsed = Math.min(Math.max(parseInt(cleaned, 10), min), max);
      handleFieldChange(key, parsed);
    };
    const hasErr = !!errors[key];

    return (
      <View className="mb-3" key={key}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            borderColor: hasErr ? colors.error : '#EBE4DB',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderRadius: 16,
          }}
          className="flex-row items-center justify-between p-4"
        >
          <Text
            style={{ color: colors.text }}
            className="text-sm font-black flex-1"
          >
            {label}
            {isRequired && <Text style={{ color: colors.primary }}> *</Text>}
            {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
          </Text>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => {
                const nextVal = Math.max(currentNum - 1, min);
                handleFieldChange(key, nextVal);
              }}
              disabled={baseForControls <= min}
              activeOpacity={0.85}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#E6E6E6',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: baseForControls <= min ? 0.4 : 1,
              }}
            >
              <Minus size={14} color={colors.text} />
            </TouchableOpacity>

            <TextInput
              value={displayValue}
              keyboardType="numeric"
              onChangeText={onChange}
              style={{
                width: 56,
                height: 40,
                textAlign: 'center',
                fontWeight: '800',
                fontSize: 16,
                color: colors.text,
                backgroundColor: '#FEF7F2',
                borderRadius: 10,
                padding: 0,
              }}
            />

            <TouchableOpacity
              onPress={() => {
                const nextVal = Math.min(currentNum + 1, max);
                handleFieldChange(key, nextVal);
              }}
              disabled={baseForControls >= max}
              activeOpacity={0.8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#E6E6E6',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: baseForControls >= max ? 0.4 : 1,
              }}
            >
              <Plus size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {hasErr && (
          <Text className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors[key]}</Text>
        )}
      </View>
    );
  };

  // Text Input field helper
  const renderTextInputField = (key: string, label: string, placeholder: string, keyboardType: any = 'numeric', isRequired: boolean = false) => {
    const hasErr = !!errors[key];
    return (
      <View className="mb-6" key={key}>
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label} {isRequired && <Text style={{ color: colors.primary }}>*</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <TextInput
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={step3[key] !== undefined && step3[key] !== null ? String(step3[key]) : ''}
          onChangeText={(txt) => {
            const val = keyboardType === 'numeric' ? (txt.replace(/[^0-9.]/g, '') || null) : txt;
            handleFieldChange(key, val);
          }}
          placeholderTextColor={colors.textPlaceholder}
          style={{
            height: 54,
            backgroundColor: '#FFFFFF',
            borderColor: hasErr ? colors.error : '#EBE4DB',
            borderWidth: hasErr ? 1.5 : 1,
            borderRadius: 12,
          }}
          className="px-5 text-slate-800 text-sm font-semibold"
        />
        {hasErr && (
          <View className="flex-row items-center gap-1.5 mt-2">
            <AlertCircle size={12} color={colors.error} />
            <Text className="text-red-500 text-xs font-bold leading-4">
              {errors[key]}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Dropdown select helper
  const renderDropdownField = (key: string, label: string, options: string[], isRequired: boolean = false) => {
    const currentVal = step3[key];
    const hasErr = !!errors[key];
    return (
      <View className="mb-6" key={key}>
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label} {isRequired && <Text style={{ color: colors.primary }}>*</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {options.map((opt) => {
            const isSel = currentVal === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => handleFieldChange(key, opt)}
                activeOpacity={0.8}
                style={{
                  borderColor: isSel ? colors.primary : hasErr ? colors.error : '#EBE4DB',
                  backgroundColor: isSel ? '#FEF7F2' : '#FFFFFF',
                  borderWidth: isSel ? 1.5 : 1,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ color: isSel ? colors.primary : colors.text }}
                  className="text-sm font-black"
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {hasErr && (
          <View className="flex-row items-center gap-1.5 mt-2">
            <AlertCircle size={12} color={colors.error} />
            <Text className="text-red-500 text-xs font-bold leading-4">
              {errors[key]}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Multi select check list helper
  const renderMultiSelectField = (key: string, label: string, options: string[]) => {
    const currentVal = Array.isArray(step3[key]) ? step3[key] : [];
    const toggle = (opt: string) => {
      const next = currentVal.includes(opt)
        ? currentVal.filter((x: string) => x !== opt)
        : [...currentVal, opt];
      handleFieldChange(key, next);
    };
    return (
      <View className="mb-6" key={key}>
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {options.map((opt) => {
            const isSel = currentVal.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => toggle(opt)}
                activeOpacity={0.8}
                style={{
                  borderColor: isSel ? colors.primary : '#EBE4DB',
                  backgroundColor: isSel ? '#FEF7F2' : '#FFFFFF',
                  borderWidth: isSel ? 1.5 : 1,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ color: isSel ? colors.primary : colors.text }}
                  className="text-sm font-black"
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: '#FFFDFA' }}
      className="flex-1"
    >
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
              Step 7 of 11
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Layout & Area
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Tell us about the physical dimensions and structural configurations.
          </Text>
        </View>

        {/* Dynamic Rendering of Fields based on Property Type */}
        {(() => {
          switch (type) {
            case 'flat':
            case 'builder_floor':
            case 'penthouse': {
              return (
                <View>
                  <View className="mb-6">
                    {renderCardStepper('bhk', 'BHK', 0, 8, true)}
                    {renderCardStepper('bathrooms', 'Bathrooms', 0, 15, true)}
                    {renderCardStepper('balconies', 'Balconies', 0, 10)}
                  </View>
                  {renderTextInputField('floorNumber', 'Property Floor', 'e.g. 3 (0 for Ground)', 'numeric', true)}
                  {renderTextInputField('totalFloors', 'Total Floors', 'e.g. 10', 'numeric', true)}
                  {renderTextInputField('carpetArea', 'Carpet Area (sq.ft)', 'e.g. 1200', 'numeric', true)}
                  {renderTextInputField('builtUpArea', 'Built-up Area (sq.ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('superBuiltUpArea', 'Super Built-up Area (sq.ft)', 'Optional', 'numeric', false)}
                  {type === 'builder_floor' && (
                    <View className="mt-4">
                      {renderTextInputField('totalUnitsInBuilding', 'Total Units in Building', 'Optional', 'numeric', false)}
                      {renderDropdownField('floorOwnershipType', 'Floor Ownership Type', ['Individual', 'Shared', 'Builder-owned'], false)}
                    </View>
                  )}
                  {type === 'penthouse' && (
                    <View className="mt-4">
                      {renderTextInputField('terraceArea', 'Terrace Area (sq.ft)', 'Optional', 'numeric', false)}
                    </View>
                  )}
                </View>
              );
            }
            case 'villa': {
              return (
                <View>
                  <View className="mb-6">
                    {renderCardStepper('bhk', 'BHK', 0, 8, true)}
                    {renderCardStepper('bathrooms', 'Bathrooms', 0, 15, true)}
                    {renderCardStepper('parkingSlots', 'Parking Slots', 0, 10)}
                  </View>
                  {renderDropdownField('numberOfFloors', 'Number of Floors', ['1', '1.5', '2', '2.5', '3', '3.5', '4+'], true)}
                  {renderTextInputField('plotArea', 'Plot Area (sq.ft)', 'e.g. 1500', 'numeric', true)}
                  {renderTextInputField('builtUpArea', 'Built-up Area (sq.ft)', 'e.g. 1800', 'numeric', true)}
                  {renderTextInputField('carpetArea', 'Carpet Area (sq.ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('roadWidth', 'Road Width (ft)', 'Optional', 'numeric', false)}
                </View>
              );
            }
            case 'office': {
              return (
                <View>
                  <View className="mb-6">
                    {renderCardStepper('washrooms', 'Washrooms', 1, 10)}
                  </View>
                  {renderTextInputField('floorNumber', 'Property Floor', 'e.g. 2', 'numeric', true)}
                  {renderTextInputField('totalFloors', 'Total Floors', 'Optional', 'numeric', false)}
                  {renderTextInputField('carpetArea', 'Carpet Area (sq.ft)', 'e.g. 1000', 'numeric', true)}
                  {renderTextInputField('builtUpArea', 'Built-up Area (sq.ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('superBuiltUpArea', 'Super Built-up Area (sq.ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('cabinCount', 'Cabin Count', 'Optional', 'numeric', false)}
                  {renderTextInputField('openDesks', 'Open Desks', 'Optional', 'numeric', false)}
                </View>
              );
            }
            case 'shop': {
              return (
                <View>
                  {renderDropdownField('shopFloor', 'Shop Floor', ['Lower Ground', 'Ground', '1st', '2nd', '3rd+'], true)}
                  {renderTextInputField('carpetArea', 'Carpet Area (sq.ft)', 'e.g. 500', 'numeric', true)}
                  {renderTextInputField('builtUpArea', 'Built-up Area (sq.ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('frontage', 'Frontage (ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('depth', 'Depth (ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('ceilingHeight', 'Ceiling Height (ft)', 'Optional', 'numeric', false)}
                </View>
              );
            }
            case 'showroom': {
              return (
                <View>
                  {renderCardStepper('numberOfShowroomFloors', 'Number of Showroom Floors', 1, 5)}
                  {renderTextInputField('showroomArea', 'Showroom Area (sq.ft)', 'e.g. 2000', 'numeric', true)}
                  {renderTextInputField('frontage', 'Frontage (ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('ceilingHeight', 'Ceiling Height (ft)', 'Optional', 'numeric', false)}
                </View>
              );
            }
            case 'warehouse': {
              return (
                <View>
                  {renderTextInputField('warehouseArea', 'Warehouse Area (sq.ft)', 'e.g. 5000', 'numeric', true)}
                  {renderTextInputField('warehouseHeight', 'Warehouse Height (ft)', 'e.g. 24', 'numeric', true)}
                  {renderCardStepper('numberOfDocks', 'Number of Loading Docks', 0, 20)}
                  {renderTextInputField('floorLoadCapacity', 'Floor Load Capacity (tons/sqft)', 'Optional', 'default', false)}
                  {renderTextInputField('openYardArea', 'Open Yard Area (sq.ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('powerLoad', 'Power Load (KW)', 'Optional', 'numeric', false)}
                </View>
              );
            }
            case 'res_plot': {
              return (
                <View>
                  {renderTextInputField('plotAreaSqFt', 'Plot Area (sq.ft)', 'e.g. 1200', 'numeric', true)}
                  {renderTextInputField('plotLength', 'Plot Length (ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('plotWidth', 'Plot Width (ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('roadWidth', 'Road Width (ft)', 'Optional', 'numeric', false)}
                  {renderTextInputField('fsiAvailable', 'FSI Available', 'Optional', 'numeric', false)}
                  {renderMultiSelectField('approvedBy', 'Approved By Layout Authorities', ['NIT', 'NMC', 'NMRDA', 'MHADA', 'Private Layout'])}
                </View>
              );
            }
            case 'agri_land': {
              return (
                <View>
                  {renderTextInputField('areaAcres', 'Area (Acres)', 'e.g. 5', 'numeric', true)}
                  {renderTextInputField('areaHectares', 'Area (Hectares)', 'Optional', 'numeric', false)}
                  {renderTextInputField('distanceFromCity', 'Distance from City (km)', 'Optional', 'numeric', false)}
                  {renderDropdownField('roadType', 'Road Type', ['Tar Road', 'Concrete', 'Mud', 'Kachcha'], false)}
                  {renderMultiSelectField('waterSource', 'Water Source Options', ['Well', 'Borewell', 'Canal', 'River', 'None'])}
                </View>
              );
            }
            default:
              return null;
          }
        })()}
      </ScrollView>

      {/* Sticky Bottom Continue Button */}
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


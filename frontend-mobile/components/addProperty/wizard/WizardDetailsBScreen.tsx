import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { validateStepDetailsB } from '@/lib/validation';
import { ArrowRight, Check, List, AlertCircle } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

export default function WizardDetailsBScreen() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const step3 = useAddPropertyStore((s) => s.step3);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep3 = useAddPropertyStore((s) => s.updateStep3);
  const setErrors = useAddPropertyStore((s) => s.setErrors);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;
      handleSelectValue('possessionDate', formatted);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  };

  const type = step1.propertyType || 'flat';

  const isResidential = ['flat', 'villa', 'builder_floor', 'penthouse'].includes(type);
  const isOffice = type === 'office';
  const isLand = ['res_plot', 'agri_land'].includes(type);

  // Field display logic helpers
  const showFurnishing = isResidential || isOffice || type === 'shop';
  const showFacing = isResidential || type === 'res_plot';
  const showAge = !isLand;
  const showReadyToMove = isResidential && step1.listingCategory === 'resale';
  const showOwnership = (step1.listingCategory === 'resale') || (type === 'agri_land') || (step1.listingCategory === 'rental' && type === 'office');

  const handleSelectValue = (key: string, value: any) => {
    updateStep3(key, value);
    if (errors[key]) {
      const updated = { ...errors };
      delete updated[key];
      setErrors(updated);
    }
  };

  const handleContinue = () => {
    const stepErrors = validateStepDetailsB(step3, type, step1.listingCategory || 'resale');
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToPhase('pricing');
  };

  const getOwnershipOptions = () => {
    if (type === 'agri_land') {
      return ['Individual', 'Joint', 'Family'];
    }
    if (type === 'villa') {
      return ['Freehold', 'Leasehold', 'Power of Attorney'];
    }
    if (isResidential) {
      return ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'];
    }
    return ['Freehold', 'Leasehold'];
  };

  // Premium Toggle Button Row
  const renderToggleRow = (key: string, label: string, description?: string) => {
    const isSel = step3[key] === true;
    return (
      <TouchableOpacity
        onPress={() => handleSelectValue(key, !isSel)}
        activeOpacity={0.8}
        style={{
          borderColor: isSel ? colors.primary : '#EBE4DB',
          backgroundColor: isSel ? '#FEF7F2' : '#FFFFFF',
          borderWidth: isSel ? 1.5 : 1,
          borderRadius: 16,
        }}
        className="flex-row items-center justify-between p-4 mb-3"
      >
        <View className="flex-1 mr-3">
          <Text style={{ color: colors.text }} className="text-sm font-bold">
            {label}
          </Text>
          {description && (
            <Text className="text-slate-400 text-xs mt-0.5">
              {description}
            </Text>
          )}
        </View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: isSel ? 0 : 1.5,
            borderColor: '#D4CDC4',
            backgroundColor: isSel ? colors.primary : 'transparent',
          }}
          className="items-center justify-center"
        >
          {isSel && <Check size={12} color="#FFFFFF" strokeWidth={3.5} />}
        </View>
      </TouchableOpacity>
    );
  };

  // Premium Text Input Box
  const renderTextInput = (key: string, label: string, placeholder: string, keyboardType: 'default' | 'numeric' = 'default', isRequired: boolean = false) => {
    const hasErr = !!errors[key];
    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}
          {isRequired && <Text style={{ color: colors.primary }}> *</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <TextInput
          placeholder={placeholder}
          value={step3[key] !== undefined && step3[key] !== null ? String(step3[key]) : ''}
          onChangeText={(val: string) => handleSelectValue(key, val)}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType={keyboardType}
          style={{
            height: 54,
            backgroundColor: '#FFFFFF',
            borderColor: hasErr ? colors.error : '#EBE4DB',
            borderWidth: hasErr ? 1.5 : 1,
            borderRadius: 16,
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

  // Premium Multi-Select Option Picker
  const renderMultiSelect = (key: string, label: string, options: string[], isRequired: boolean = false) => {
    const currentVal = Array.isArray(step3[key]) ? step3[key] : [];
    const hasErr = !!errors[key];

    const toggleOption = (opt: string) => {
      let updated: string[];
      if (currentVal.includes(opt)) {
        updated = currentVal.filter((v: string) => v !== opt);
      } else {
        updated = [...currentVal, opt];
      }
      handleSelectValue(key, updated);
    };

    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}
          {isRequired && <Text style={{ color: colors.primary }}> *</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {options.map((opt) => {
            const isSel = currentVal.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => toggleOption(opt)}
                activeOpacity={0.8}
                style={{
                  borderColor: isSel ? colors.primary : '#EBE4DB',
                  backgroundColor: isSel ? '#FEF7F2' : '#FFFFFF',
                  borderWidth: isSel ? 1.5 : 1,
                  borderRadius: 12,
                }}
                className="px-4 py-2.5 mr-2 mb-2 flex-row items-center"
              >
                <Text
                  style={{ color: isSel ? colors.primary : colors.text }}
                  className="text-sm font-semibold mr-2"
                >
                  {opt}
                </Text>
                {isSel && <Check size={14} color={colors.primary} strokeWidth={3} />}
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

  // Full-width card selector helper (matching Step 1/2 design)
  const renderCardSelector = (key: string, label: string, options: string[], icon?: any, isRequired: boolean = false) => {
    const currentVal = step3[key];
    const hasErr = !!errors[key];
    const Icon = icon;
    
    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}
          {isRequired && <Text style={{ color: colors.primary }}> *</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        {options.map((opt) => {
          const isSel = currentVal === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => handleSelectValue(key, opt)}
              activeOpacity={0.8}
              style={{
                borderColor: isSel ? colors.primary : hasErr ? colors.error : '#EBE4DB',
                backgroundColor: isSel ? '#FEF7F2' : '#FFFFFF',
                borderWidth: isSel ? 1.5 : 1,
                borderRadius: 12,
              }}
              className="flex-row items-center justify-between p-4 mb-2.5"
            >
              {/* Left Section: Icon + Text */}
              <View className="flex-row items-center flex-1">
                {/* Icon Box */}
                {Icon && (
                  <View
                    style={{
                      backgroundColor: isSel ? 'rgba(235, 127, 62, 0.12)' : 'rgba(235, 127, 62, 0.06)',
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                    }}
                    className="items-center justify-center mr-3"
                  >
                    <Icon
                      size={20}
                      color={isSel ? colors.primary : '#9CA3AF'}
                      strokeWidth={2.5}
                    />
                  </View>
                )}
                {/* Text Section */}
                <View className="flex-1">
                  <Text
                    style={{
                      color: isSel ? colors.primary : colors.text,
                    }}
                    className="text-sm font-black"
                  >
                    {opt}
                  </Text>
                </View>
              </View>

              {/* Right Section: Selection Circle */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: isSel ? 0 : 1.5,
                  borderColor: '#D4CDC4',
                  backgroundColor: isSel ? colors.primary : 'transparent',
                }}
                className="items-center justify-center"
              >
                {isSel && <Check size={12} color="#FFFFFF" strokeWidth={3.5} />}
              </View>
            </TouchableOpacity>
          );
        })}
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

  return (
    <View style={{ backgroundColor: '#FFFDFA' }} className="flex-1 justify-between">
      {/* Scrollable details list */}
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
              Step 8 of 11
            </Text>
          </View>
        </View>

        {/* Title info */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Property Specifications
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Select furnishing, construction age, and ownership type.
          </Text>
        </View>

        {/* Furnishing dropdown */}
        {showFurnishing &&
          renderCardSelector('furnishing', 'Furnishing Status', [
            'Unfurnished',
            'Semi-Furnished',
            'Fully Furnished',
            'Bare Shell',
            'Warm Shell',
          ], undefined, true)}

        {/* Ownership Type */}
        {showOwnership &&
          renderCardSelector('ownershipType', 'Ownership Type', getOwnershipOptions(), undefined, true)}

        {/* Facing selector */}
        {showFacing &&
          renderCardSelector('facing', 'Property Facing', [
            'N',
            'S',
            'E',
            'W',
            'NE',
            'NW',
            'SE',
            'SW',
          ])}

        {/* Construction Age */}
        {showAge &&
          renderCardSelector('ageOfProperty', 'Age of Property', [
            'New',
            '1–3 Years',
            '3–5 Years',
            '5–10 Years',
            '10+ Years',
          ])}

        {/* Ready to Move Toggles */}
        {showReadyToMove && (
          <View className="mb-6">
            <Text className="text-slate-800 font-extrabold text-xs mb-2.5 uppercase tracking-wider">
              Is it ready to move in?
              <Text style={{ color: colors.primary }}> *</Text>
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleSelectValue('readyToMove', true)}
                activeOpacity={0.8}
                style={{
                  borderColor: step3.readyToMove === true ? colors.success : errors.readyToMove ? colors.error : '#E2E8F0',
                  backgroundColor: step3.readyToMove === true ? colors.successLight : '#FFFFFF',
                  borderWidth: step3.readyToMove === true ? 1.8 : 1,
                }}
                className="flex-1 border rounded-2xl py-4 items-center"
              >
                <Text
                  style={{ color: step3.readyToMove === true ? colors.successDark : colors.text }}
                  className="text-sm font-black"
                >
                  YES, Ready
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectValue('readyToMove', false)}
                activeOpacity={0.8}
                style={{
                  borderColor: step3.readyToMove === false ? colors.error : errors.readyToMove ? colors.error : '#E2E8F0',
                  backgroundColor: step3.readyToMove === false ? 'rgba(239, 68, 68, 0.08)' : '#FFFFFF',
                  borderWidth: step3.readyToMove === false ? 1.8 : 1,
                }}
                className="flex-1 border rounded-2xl py-4 items-center"
              >
                <Text
                  style={{ color: step3.readyToMove === false ? colors.error : colors.text }}
                  className="text-sm font-black"
                >
                  NO, Under-Construction
                </Text>
              </TouchableOpacity>
            </View>
            {errors.readyToMove && (
              <View className="flex-row items-center gap-1.5 mt-2">
                <AlertCircle size={12} color={colors.error} />
                <Text className="text-red-500 text-xs font-bold leading-4">
                  {errors.readyToMove}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Section 2: Property-Specific Features */}
        {(isResidential || isOffice || ['shop', 'showroom', 'warehouse', 'res_plot', 'agri_land'].includes(type)) && (
          <View className="mt-4">
            {/* Header */}
            <View className="mb-6 flex-row items-center gap-2">
              <View className="w-1 h-[18px] bg-orange-500 rounded-sm" />
              <Text className="text-xs font-extrabold text-gray-700 tracking-widest uppercase">
                Additional Features & Specs
              </Text>
            </View>

            {/* Flat/Apartment, Penthouse, Builder Floor extra selectors */}
            {['flat', 'builder_floor', 'penthouse'].includes(type) && (
              <>
                {renderCardSelector('floorType', 'Floor Type', ['Marble', 'Vitrified', 'Wooden', 'Granite', 'Ceramic'])}
                {renderCardSelector('waterSupply', 'Water Supply', ['Municipal', 'Borewell', 'Both'])}
                {renderCardSelector('electricityStatus', 'Electricity Status', ['Metered', 'Non-metered', 'Pre-paid'])}
              </>
            )}

            {/* Builder Floor Specific */}
            {type === 'builder_floor' && (
              <>
                {renderCardSelector('floorOwnershipType', 'Floor Ownership Type', ['Individual', 'Shared', 'Builder-owned'])}
                {renderToggleRow('stiltParking', 'Stilt Parking Available')}
              </>
            )}

            {/* Penthouse Specific */}
            {type === 'penthouse' && (
              <>
                <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 mt-2 text-[#6B6B6B]">
                  Penthouse Features <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>
                </Text>
                {renderToggleRow('privateLift', 'Private Lift Available')}
                {renderToggleRow('isDuplex', 'Is Duplex Penthouse')}
                {renderToggleRow('servantRoom', 'Servant Room Included')}
                {renderToggleRow('privatePool', 'Private Pool Available')}
              </>
            )}

            {/* Villa Specific */}
            {type === 'villa' && (
              <>
                {renderCardSelector('floorType', 'Floor Type', ['Marble', 'Vitrified', 'Wooden', 'Granite', 'Ceramic'])}
                {renderCardSelector('waterSupply', 'Water Supply', ['Municipal', 'Borewell', 'Both'])}
                <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 mt-2 text-[#6B6B6B]">
                  Villa Features
                </Text>
                {renderToggleRow('hasGarden', 'Independent Garden')}
                {renderToggleRow('cornerProperty', 'Corner Property')}
                {renderToggleRow('gatedSociety', 'Gated Society / Security')}
                {renderToggleRow('independentEntry', 'Independent Entry')}
              </>
            )}

            {/* Office Space Specific */}
            {type === 'office' && (
              <>
                {renderToggleRow('hasPantry', 'Pantry / Cafeteria')}
                {renderToggleRow('itReady', 'IT / Server Room Ready')}
                {renderToggleRow('conferenceRoom', 'Conference Room Available')}
                {renderToggleRow('receptionArea', 'Dedicated Reception Area')}
                {renderToggleRow('centralAC', 'Centralized AC Installed')}
                {renderToggleRow('officeFireSafety', 'Fire Safety Compliant')}
                {renderToggleRow('dgBackup', 'DG Power Backup')}
              </>
            )}

            {/* Shop Specific */}
            {type === 'shop' && (
              <>
                {renderToggleRow('mainRoadFacing', 'Main Road Facing')}
                {renderToggleRow('cornerShop', 'Corner Shop')}
                {renderToggleRow('mezzanineFloor', 'Mezzanine Floor Installed')}
                {renderToggleRow('hasWashroom', 'Washroom Attached')}
                {renderMultiSelect('suitableFor', 'Suitable For Business Types', ['Retail', 'Food', 'Pharmacy', 'Showroom', 'Office', 'Clinic'])}
              </>
            )}

            {/* Showroom Specific */}
            {type === 'showroom' && (
              <>
                {renderToggleRow('glassFront', 'Glass Frontage')}
                {renderToggleRow('parkingAvailable', 'Parking Available for Customers')}
                {renderToggleRow('acInstalled', 'Air Conditioning Installed')}
                {renderToggleRow('mainRoadFacing', 'Main Road Facing')}
              </>
            )}

            {/* Warehouse Specific */}
            {type === 'warehouse' && (
              <>
                {renderToggleRow('truckAccess', 'Heavy Truck Access Available')}
                {renderToggleRow('waterSupplyWarehouse', 'Water Connection Available')}
                {renderToggleRow('officeSpaceInside', 'Small Office Space Inside')}
                {renderToggleRow('midc', 'Located inside MIDC Area')}
              </>
            )}

            {/* Residential Plot Specific */}
            {type === 'res_plot' && (
              <>
                {renderToggleRow('boundaryWall', 'Boundary Wall Constructed')}
                {renderToggleRow('gatedLayout', 'Gated Layout / Security Gate')}
                {renderToggleRow('cornerPlot', 'Corner Plot')}
              </>
            )}

            {/* Agricultural Land Specific */}
            {type === 'agri_land' && (
              <>
                {renderToggleRow('roadAccess', 'Road Access Available (Required)', undefined)}
                {renderToggleRow('fencing', 'Fenced Boundary')}
                {renderToggleRow('electricityLand', 'Electricity Supply Available')}
                {renderToggleRow('sevenTwelveExtract', '7/12 Extract Available')}
                {renderCardSelector('soilType', 'Soil Type', ['Black', 'Red', 'Alluvial', 'Mixed'])}
                {renderCardSelector('irrigationType', 'Irrigation Type', ['Drip', 'Sprinkler', 'Canal', 'Flood', 'None'])}
                {renderTextInput('treesPlantation', 'Trees / Plantation Details', 'e.g. 50 Mango, 10 Teak trees')}
              </>
            )}

            {/* Tenant Preferences for Flat (Rental), Builder Floor (Rental), Penthouse (Resale/Rental), and Villa */}
            {((['flat', 'builder_floor'].includes(type) && step1.listingCategory === 'rental') ||
              (type === 'penthouse' && (step1.listingCategory === 'rental' || step1.listingCategory === 'resale')) ||
              type === 'villa') && (
              <View className="mb-4">
                <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 mt-2 text-[#6B6B6B]">
                  Tenant Preferences <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>
                </Text>
                {renderToggleRow('petFriendly', 'Pet Friendly')}
                {renderToggleRow('nonVegAllowed', 'Non-Veg Allowed')}
              </View>
            )}
          </View>
        )}

        {/* New Project & RERA Details */}
        {step1.listingCategory === 'new' && type !== 'agri_land' && (
          <View className="mt-4">
            {/* Header / Divider */}
            <View className="mb-6 flex-row items-center gap-2">
              <View className="w-1 h-[18px] bg-orange-500 rounded-sm" />
              <Text className="text-xs font-extrabold text-gray-700 tracking-widest uppercase">
                New Project & RERA Details
              </Text>
            </View>

            {/* Project / Layout Name */}
            {type === 'res_plot' ? (
              <View className="mb-6">
                <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                  Layout Project Name<Text style={{ color: colors.primary }}> *</Text>
                </Text>
                <TextInput
                  placeholder="e.g. Green Meadows Layout"
                  value={step3.layoutProjectName || ''}
                  onChangeText={(val: string) => handleSelectValue('layoutProjectName', val)}
                  placeholderTextColor={colors.textPlaceholder}
                  style={{
                    height: 54,
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.layoutProjectName ? colors.error : '#EBE4DB',
                    borderWidth: errors.layoutProjectName ? 1.5 : 1,
                    borderRadius: 16,
                  }}
                  className="px-5 text-slate-800 text-sm font-semibold"
                />
                {errors.layoutProjectName && (
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <AlertCircle size={12} color={colors.error} />
                    <Text className="text-red-500 text-xs font-bold leading-4">
                      {errors.layoutProjectName}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="mb-6">
                <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                  Project Name{type === 'warehouse' ? <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text> : <Text style={{ color: colors.primary }}> *</Text>}
                </Text>
                <TextInput
                  placeholder="e.g. Vrindavan Heights"
                  value={step3.projectName || ''}
                  onChangeText={(val: string) => handleSelectValue('projectName', val)}
                  placeholderTextColor={colors.textPlaceholder}
                  style={{
                    height: 54,
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.projectName ? colors.error : '#EBE4DB',
                    borderWidth: errors.projectName ? 1.5 : 1,
                    borderRadius: 16,
                  }}
                  className="px-5 text-slate-800 text-sm font-semibold"
                />
                {errors.projectName && (
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <AlertCircle size={12} color={colors.error} />
                    <Text className="text-red-500 text-xs font-bold leading-4">
                      {errors.projectName}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Builder Name */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                Builder Name{type === 'warehouse' ? <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text> : <Text style={{ color: colors.primary }}> *</Text>}
              </Text>
              <TextInput
                placeholder="e.g. Landmark Developers"
                value={step3.builderName || ''}
                onChangeText={(val: string) => handleSelectValue('builderName', val)}
                placeholderTextColor={colors.textPlaceholder}
                style={{
                  height: 54,
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.builderName ? colors.error : '#EBE4DB',
                  borderWidth: errors.builderName ? 1.5 : 1,
                  borderRadius: 16,
                }}
                className="px-5 text-slate-800 text-sm font-semibold"
              />
              {errors.builderName && (
                <View className="flex-row items-center gap-1.5 mt-2">
                  <AlertCircle size={12} color={colors.error} />
                  <Text className="text-red-500 text-xs font-bold leading-4">
                    {errors.builderName}
                  </Text>
                </View>
              )}
            </View>

            {/* RERA Number */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                Agent RERA Number<Text style={{ color: colors.primary }}> *</Text>
              </Text>
              <TextInput
                placeholder="e.g. P52100012345"
                value={step3.reraNumber || ''}
                onChangeText={(val: string) => handleSelectValue('reraNumber', val)}
                placeholderTextColor={colors.textPlaceholder}
                style={{
                  height: 54,
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.reraNumber ? colors.error : '#EBE4DB',
                  borderWidth: errors.reraNumber ? 1.5 : 1,
                  borderRadius: 16,
                }}
                className="px-5 text-slate-800 text-sm font-semibold"
              />
              {errors.reraNumber && (
                <View className="flex-row items-center gap-1.5 mt-2">
                  <AlertCircle size={12} color={colors.error} />
                  <Text className="text-red-500 text-xs font-bold leading-4">
                    {errors.reraNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Project RERA Number */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                Project RERA Number<Text style={{ color: colors.primary }}> *</Text>
              </Text>
              <TextInput
                placeholder="e.g. P52100012345"
                value={step3.projectReraNumber || ''}
                onChangeText={(val: string) => handleSelectValue('projectReraNumber', val)}
                placeholderTextColor={colors.textPlaceholder}
                style={{
                  height: 54,
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.projectReraNumber ? colors.error : '#EBE4DB',
                  borderWidth: errors.projectReraNumber ? 1.5 : 1,
                  borderRadius: 16,
                }}
                className="px-5 text-slate-800 text-sm font-semibold"
              />
              {errors.projectReraNumber && (
                <View className="flex-row items-center gap-1.5 mt-2">
                  <AlertCircle size={12} color={colors.error} />
                  <Text className="text-red-500 text-xs font-bold leading-4">
                    {errors.projectReraNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Construction Status / Development Status */}
            {type === 'res_plot'
              ? renderCardSelector('developmentStatus', 'Development Status', [
                  'Under Development',
                  'Ready',
                  'Partially Ready',
                ], undefined, true)
              : renderCardSelector('constructionStatus', 'Construction Status', type === 'warehouse'
                ? ['Under Construction', 'Ready']
                : [
                    'Pre-launch',
                    'Under Construction',
                    'Ready to Move',
                    'Ready',
                    'Partially Ready',
                    'Under Development',
                  ]
              , undefined, true)}

            {/* Expected Possession Date */}
            {type !== 'res_plot' && (
              <View className="mb-6">
                <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                  Expected Possession Date<Text style={{ color: colors.primary }}> *</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                  style={{
                    height: 54,
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.possessionDate ? colors.error : '#EBE4DB',
                    borderWidth: errors.possessionDate ? 1.5 : 1,
                    borderRadius: 16,
                    justifyContent: 'center',
                  }}
                  className="px-5"
                >
                  <Text
                    style={{
                      color: step3.possessionDate ? colors.text : colors.textPlaceholder,
                    }}
                    className="text-sm font-semibold"
                  >
                    {step3.possessionDate ? formatDateDisplay(step3.possessionDate) : 'Select Date (DD/MM/YYYY)'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={step3.possessionDate ? new Date(step3.possessionDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                {errors.possessionDate && (
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <AlertCircle size={12} color={colors.error} />
                    <Text className="text-red-500 text-xs font-bold leading-4">
                      {errors.possessionDate}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Additional Project Metrics */}
            {type === 'villa' ? (
              <>
                {renderTextInput('totalVillasInProject', 'Total Villas in Project', 'e.g. 50', 'numeric')}
                {renderTextInput('unitsAvailable', 'Villas Available', 'e.g. 12', 'numeric')}
                {renderTextInput('towerWing', 'Phase / Wing', 'e.g. Phase 2')}
              </>
            ) : type === 'res_plot' ? (
              <>
                {renderTextInput('totalPlotsInLayout', 'Total Plots in Layout', 'e.g. 100', 'numeric')}
                {renderTextInput('plotsAvailable', 'Plots Available', 'e.g. 24', 'numeric')}
              </>
            ) : type === 'warehouse' ? (
              <>
                {renderTextInput('towerWing', 'Tower / Wing', 'e.g. Tower A')}
                {renderTextInput('approvedBanks', 'Approved Banks', 'e.g. HDFC, SBI, ICICI')}
                {renderCardSelector('ccOcReceived', 'CC/OC Status', ['CC Received', 'OC Received', 'Both', 'None', 'Applied'])}
                {step1.listingCategory === 'new' && renderMultiSelect('approvedBy', 'Approved By Layout Authorities', ['NIT', 'NMC', 'NMRDA', 'MHADA', 'Private Layout'])}
              </>
            ) : (
              <>
                {renderTextInput('totalUnitsInProject', 'Total Units in Project', 'e.g. 120', 'numeric')}
                {renderTextInput('unitsAvailable', 'Units Available', 'e.g. 45', 'numeric')}
                {renderTextInput('towerWing', 'Tower / Wing', 'e.g. Tower A')}
                {renderTextInput('approvedBanks', 'Approved Banks', 'e.g. HDFC, SBI, ICICI')}
                {renderCardSelector('ccOcReceived', 'CC/OC Status', ['CC Received', 'OC Received', 'Both', 'None', 'Applied'])}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
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
          className="w-full h-14 rounded-2xl flex-row items-center justify-center"
        >
          <Text className="text-white font-black text-sm tracking-wider mr-2">
            Continue
          </Text>
          <ArrowRight size={16} color="#FFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}




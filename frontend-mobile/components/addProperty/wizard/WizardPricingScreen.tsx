import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { validateStepPricing } from '@/lib/validation';
import { ArrowRight, Check, List, AlertCircle, Calculator } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';
import PriceRangeSlider from '@/components/addProperty/fields/PriceRangeSlider';

export default function WizardPricingScreen() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const step3 = useAddPropertyStore((s) => s.step3);
  const step4 = useAddPropertyStore((s) => s.step4);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep4 = useAddPropertyStore((s) => s.updateStep4);
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
      handlePriceChange(category === 'new' ? 'possessionDate' : 'availableFrom', formatted);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  };

  const category = step1.listingCategory || 'resale';
  const type = step1.propertyType || 'flat';

  const isAgri = type === 'agri_land';
  const isResidential = ['flat', 'villa', 'builder_floor', 'penthouse'].includes(type);

  // Dynamic values based on category
  const mainPriceLabel = category === 'resale'
    ? 'Total Price (₹)'
    : category === 'rental'
    ? (isAgri ? 'Annual Lease (₹)' : 'Monthly Rent (₹)')
    : 'Starting Price (₹)';

  const mainPriceKey = category === 'resale'
    ? 'totalPrice'
    : category === 'rental'
    ? (isAgri ? 'annualLease' : 'monthlyRent')
    : 'startingPrice';

  // ── Auto-calculate Price per Sqft (Task 4) ─────────────────────────────────
  const getMainArea = (): number => {
    if (['flat', 'builder_floor', 'penthouse', 'office', 'shop'].includes(type))
      return parseFloat(step3.carpetArea) || 0;
    if (type === 'villa')
      return parseFloat(step3.builtUpArea) || parseFloat(step3.plotArea) || 0;
    if (type === 'showroom')
      return parseFloat(step3.showroomArea) || 0;
    if (type === 'warehouse')
      return parseFloat(step3.warehouseArea) || 0;
    if (type === 'res_plot')
      return parseFloat(step3.plotAreaSqFt) || 0;
    return 0;
  };

  const autoPerSqft = useMemo(() => {
    const mainArea = getMainArea();
    const price = parseFloat(step4[mainPriceKey]) || 0;
    if (mainArea > 0 && price > 0) return Math.round(price / mainArea);
    return null;
  }, [step4[mainPriceKey], step3, type]);

  // Sync auto-calculated value to store
  React.useEffect(() => {
    if (autoPerSqft !== null && (category === 'resale' || category === 'new')) {
      updateStep4('pricePerSqft', autoPerSqft);
    }
  }, [autoPerSqft, category]);

  const areaLabel = useMemo(() => {
    if (['flat', 'builder_floor', 'penthouse', 'office', 'shop'].includes(type)) return 'Carpet Area';
    if (type === 'villa') return 'Built-up Area';
    if (type === 'showroom') return 'Showroom Area';
    if (type === 'warehouse') return 'Warehouse Area';
    if (type === 'res_plot') return 'Plot Area';
    return 'Area';
  }, [type]);

  const handleSelectTimeline = (timeline: string) => {
    updateStep4('possessionTimeline', timeline);
    if (errors.possessionTimeline) {
      const updated = { ...errors };
      delete updated.possessionTimeline;
      setErrors(updated);
    }
  };

  const handleToggleNegotiable = () => {
    const key = category === 'rental' ? 'rentNegotiable' : 'priceNegotiable';
    updateStep4(key, !step4[key]);
  };

  const handlePriceChange = (key: string, val: any) => {
    updateStep4(key, val);
    if (errors[key]) {
      const updated = { ...errors };
      delete updated[key];
      setErrors(updated);
    }
  };

  const handleContinue = () => {
    const stepErrors = validateStepPricing(step4, category, type);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToPhase('photos');
  };

  // Horizontal Scroll Card Selector
  const renderCardSelector = (key: string, label: string, options: string[], isRequired = false) => {
    const currentVal = step4[key];
    const hasErr = !!errors[key];
    
    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}{isRequired && <Text style={{ color: colors.primary }}> *</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {options.map((opt) => {
            const isSel = currentVal === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => handlePriceChange(key, opt)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isSel ? '#FCF5EC' : '#FFFFFF',
                  borderColor: isSel ? colors.primary : hasErr ? colors.error : '#E2E8F0',
                  borderWidth: isSel ? 1.8 : 1,
                  borderRadius: 20,
                }}
                className="flex-row items-center px-5 py-2.5 mr-2"
              >
                {isSel && <Check size={12} color={colors.primary} className="mr-1.5" strokeWidth={3.5} />}
                <Text
                  style={{ color: isSel ? colors.primaryDark : colors.textSecondary }}
                  className="text-xs font-bold"
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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

  // Premium Toggle Button Row
  const renderToggleRow = (key: string, label: string, description?: string) => {
    const isSel = step4[key] === true;
    return (
      <TouchableOpacity
        onPress={() => handlePriceChange(key, !isSel)}
        activeOpacity={0.8}
        style={{
          borderColor: isSel ? colors.primary : '#E2E8F0',
          backgroundColor: isSel ? '#FCF5EC' : '#FFFFFF',
          borderWidth: isSel ? 1.8 : 1,
          borderRadius: 16,
        }}
        className="flex-row items-center justify-between p-4 mb-6"
      >
        <View className="flex-1 mr-3 flex-row items-center">
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: isSel ? 0 : 1.5,
              borderColor: '#CBD5E1',
              backgroundColor: isSel ? colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mr-3"
          >
            {isSel && <Check size={13} color="#FFF" strokeWidth={3.5} />}
          </View>
          <View className="flex-1">
            <Text className="text-slate-800 font-extrabold text-sm">
              {label}
            </Text>
            {!!description && (
              <Text className="text-slate-400 text-xs mt-0.5">
                {description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Premium Text Input Box
  const renderTextInput = (key: string, label: string, placeholder: string, keyboardType: 'default' | 'numeric' = 'default', isRequired = false) => {
    const hasErr = !!errors[key];
    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}{isRequired && <Text style={{ color: colors.primary }}> *</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <TextInput
          placeholder={placeholder}
          value={step4[key] !== undefined && step4[key] !== null ? String(step4[key]) : ''}
          onChangeText={(val: string) => handlePriceChange(key, val)}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType={keyboardType}
          style={{
            height: 54,
            backgroundColor: '#FFFFFF',
            borderColor: hasErr ? colors.error : '#E2E8F0',
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

  // Premium Numeric Input Box with Rupee Icon
  const renderNumericInput = (key: string, label: string, placeholder: string, isRequired = false) => {
    const hasErr = !!errors[key];
    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}{isRequired && <Text style={{ color: colors.primary }}> *</Text>}
          {!isRequired && <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>}
        </Text>
        <View
          style={{
            borderColor: hasErr ? colors.error : '#E2E8F0',
            borderWidth: hasErr ? 1.5 : 1,
            height: 54,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
          }}
          className="flex-row items-center px-5"
        >
          <Text className="text-slate-400 font-bold text-sm mr-2">₹</Text>
          <TextInput
            placeholder={placeholder}
            keyboardType="numeric"
            value={step4[key] !== undefined && step4[key] !== null ? String(step4[key]) : ''}
            onChangeText={(txt) => {
              const cleaned = txt.replace(/[^0-9]/g, '');
              handlePriceChange(key, cleaned ? parseInt(cleaned, 10) : null);
            }}
            placeholderTextColor={colors.textPlaceholder}
            className="flex-1 text-slate-800 text-sm font-semibold"
          />
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

  // Premium Multi-Select Option Picker
  const renderMultiSelect = (key: string, label: string, options: string[]) => {
    const currentVal = Array.isArray(step4[key]) ? step4[key] : [];
    const hasErr = !!errors[key];

    const toggleOption = (opt: string) => {
      let updated: string[];
      if (currentVal.includes(opt)) {
        updated = currentVal.filter((v: string) => v !== opt);
      } else {
        updated = [...currentVal, opt];
      }
      handlePriceChange(key, updated);
    };

    return (
      <View className="mb-6">
        <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
          {label}
          <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>
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
                  borderColor: isSel ? colors.primary : '#E2E8F0',
                  backgroundColor: isSel ? '#FCF5EC' : '#FFFFFF',
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: '#FFFDFA' }}
      className="flex-1"
    >
      {/* Form content */}
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
              Step 9 of 11
            </Text>
          </View>
        </View>

        {/* Title details */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Pricing & Availability
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Define the pricing model, booking costs, and availability dates.
          </Text>
        </View>

        {/* Total Price or Rent amount */}
        {renderNumericInput(mainPriceKey, mainPriceLabel, 'e.g. 45,00,000', true)}

        {/* Resale Category Additional Fields */}
        {category === 'resale' && (
          <>
            {/* Auto-calculated Price per Sqft */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                Price per Sqft (₹)
                <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Auto)</Text>
              </Text>
              <View
                style={{
                  height: 54,
                  backgroundColor: '#F8F6F3',
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 16,
                }}
                className="flex-row items-center px-5"
              >
                <Calculator size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: autoPerSqft ? colors.text : '#9CA3AF',
                    fontSize: 14,
                    fontWeight: '700',
                    flex: 1,
                  }}
                >
                  {autoPerSqft ? `₹ ${autoPerSqft.toLocaleString('en-IN')} / sq.ft` : 'Enter price & area to calculate'}
                </Text>
              </View>
              {!!autoPerSqft && (
                <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4, fontWeight: '500' }}>
                  Calculated from {mainPriceLabel.replace(' (₹)', '')} ÷ {areaLabel}
                </Text>
              )}
            </View>
            {renderCardSelector('possessionTimeline', 'Possession Timeline', ['Immediate', 'Within 1 Month', '1–3 Months', '3–6 Months'], true)}
          </>
        )}

        {/* New Launches Additional Fields */}
        {category === 'new' && (
          <>
            {/* Auto-calculated Price per Sqft */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                Price per Sqft (₹)
                <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Auto)</Text>
              </Text>
              <View
                style={{
                  height: 54,
                  backgroundColor: '#F8F6F3',
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 16,
                }}
                className="flex-row items-center px-5"
              >
                <Calculator size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: autoPerSqft ? colors.text : '#9CA3AF',
                    fontSize: 14,
                    fontWeight: '700',
                    flex: 1,
                  }}
                >
                  {autoPerSqft ? `₹ ${autoPerSqft.toLocaleString('en-IN')} / sq.ft` : 'Enter price & area to calculate'}
                </Text>
              </View>
              {!!autoPerSqft && (
                <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4, fontWeight: '500' }}>
                  Calculated from {mainPriceLabel.replace(' (₹)', '')} ÷ {areaLabel}
                </Text>
              )}
            </View>

            {/* Price Range Slider */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
                Price Range
                <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '600' }}> (Optional)</Text>
              </Text>
              <PriceRangeSlider
                minPrice={step4.priceRangeMin || 0}
                maxPrice={step4.priceRangeMax || 0}
                onRangeChange={(min, max) => {
                  updateStep4('priceRangeMin', min);
                  updateStep4('priceRangeMax', max);
                  handlePriceChange('priceRange', `${min}-${max}`);
                }}
              />
            </View>

            {renderNumericInput('bookingAmount', 'Booking Amount (₹)', 'e.g. 1,00,000')}
          </>
        )}

        {/* Rentals Additional Fields */}
        {category === 'rental' && (
          <>
            {!isAgri && renderNumericInput('annualLease', 'Annual Lease (₹)', 'Optional')}
            {renderNumericInput('securityDeposit', 'Security Deposit (₹)', 'e.g. 50,000', true)}
            {!isAgri && renderNumericInput('maintenance', 'Maintenance (₹/month)', 'Optional')}
          </>
        )}

        {/* Date Pickers (For Rentals and New Launches) */}
        {(category === 'rental' || category === 'new') && (
          <View className="mb-6">
            <Text className="text-slate-500 text-[12px] font-black uppercase tracking-wider mb-3 text-[#6B6B6B]">
              {category === 'new' ? 'Expected Possession Date' : 'Available From Date'}
              <Text style={{ color: colors.primary }}> *</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
              style={{
                height: 54,
                backgroundColor: '#FFFFFF',
                borderColor: errors[category === 'new' ? 'possessionDate' : 'availableFrom'] ? colors.error : '#E2E8F0',
                borderWidth: errors[category === 'new' ? 'possessionDate' : 'availableFrom'] ? 1.5 : 1,
                borderRadius: 16,
                justifyContent: 'center',
              }}
              className="px-5"
            >
              <Text
                style={{
                  color: step4[category === 'new' ? 'possessionDate' : 'availableFrom'] ? colors.text : colors.textPlaceholder,
                }}
                className="text-sm font-semibold"
              >
                {step4[category === 'new' ? 'possessionDate' : 'availableFrom'] ? formatDateDisplay(step4[category === 'new' ? 'possessionDate' : 'availableFrom']) : 'Select Date (DD/MM/YYYY)'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={step4[category === 'new' ? 'possessionDate' : 'availableFrom'] ? new Date(step4[category === 'new' ? 'possessionDate' : 'availableFrom']) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {!!errors[category === 'new' ? 'possessionDate' : 'availableFrom'] && (
              <View className="flex-row items-center gap-1.5 mt-2">
                <AlertCircle size={12} color={colors.error} />
                <Text className="text-red-500 text-xs font-bold leading-4">
                  {errors[category === 'new' ? 'possessionDate' : 'availableFrom']}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Lease, Lock-in, Preferred Tenants for Rentals */}
        {category === 'rental' && (
          <>
            {renderCardSelector('leaseDuration', 'Lease Duration', ['11 months', '1 year', '2 years', '3 years', '5 years', '10+ years', 'Flexible'], true)}
            {renderCardSelector('lockInPeriod', 'Lock-in Period', ['None', '3 months', '6 months', '1 year'])}
            {isResidential && renderMultiSelect('preferredTenants', 'Preferred Tenants', ['Family', 'Bachelor Male', 'Bachelor Female', 'Company', 'Any'])}
          </>
        )}

        {/* GST Toggle for New Projects */}
        {category === 'new' && renderToggleRow('gstApplicable', 'GST Applicable', 'Is GST included/applicable to the pricing?')}

        {/* Brokerage Terms (All Listings) */}
        {renderTextInput('brokerage', 'Brokerage Terms (Optional)', 'e.g. 1% or ₹50,000')}

        {/* Negotiability Toggle */}
        {renderToggleRow(category === 'rental' ? 'rentNegotiable' : 'priceNegotiable', 'Price/Rent is negotiable', 'Are you open to offers?')}
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


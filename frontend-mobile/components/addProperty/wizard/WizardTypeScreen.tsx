import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { isValidCombination } from '@/lib/propertyTypes';
import { 
  Building2, 
  Home, 
  Layers, 
  Building, 
  Briefcase, 
  ShoppingBag, 
  Store, 
  Warehouse, 
  Map, 
  Sprout, 
  FileText,
  List,
  ArrowRight,
  Check
} from 'lucide-react-native';
import colors from '@/theme/colors';

const ALL_TYPES = [
  // LAND
  { id: 'res_plot', label: 'Residential Plot', desc: 'For home construction', icon: Map, badge: 'Land Category', group: 'land' },
  { id: 'agri_land', label: 'Agricultural Land', desc: 'Farms & agriculture', icon: Sprout, badge: 'Land Category', group: 'land' },
  // RESIDENTIAL
  { id: 'villa', label: 'Villa / House', desc: 'Independent homes', icon: Home, badge: 'Most Popular', group: 'residential' },
  { id: 'flat', label: 'Flat / Apartment', desc: 'Apartments & flats', icon: Building2, badge: 'Residential', group: 'residential' },
  { id: 'penthouse', label: 'Penthouse', desc: 'Premium apartments', icon: Building, badge: 'Residential', group: 'residential' },
  { id: 'builder_floor', label: 'Builder Floor', desc: 'Independent floors', icon: Layers, badge: 'Residential', group: 'residential' },
  // COMMERCIAL
  { id: 'office', label: 'Office Space', desc: 'Offices & co-working', icon: Briefcase, badge: 'Commercial', group: 'commercial' },
  { id: 'shop', label: 'Shop', desc: 'Retail shops & outlets', icon: ShoppingBag, badge: 'Commercial', group: 'commercial' },
  { id: 'showroom', label: 'Showroom', desc: 'Car or product showroom', icon: Store, badge: 'Commercial', group: 'commercial' },
  { id: 'warehouse', label: 'Warehouse', desc: 'Godowns & industrial', icon: Warehouse, badge: 'Commercial', group: 'commercial' },
];

export default function WizardTypeScreen() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const setPropertyType = useAddPropertyStore((s) => s.setPropertyType);

  const currentCategory = step1.listingCategory || 'resale';

  // Local selection state before confirmation via Continue button
  const [selectedType, setSelectedType] = useState<string | null>(step1.propertyType);

  const handleSelect = (type: string) => {
    if (isValidCombination(currentCategory, type as any)) {
      setSelectedType(type);
    }
  };

  const handleContinue = () => {
    if (selectedType) {
      setPropertyType(selectedType as any);
    }
  };

  const groups = [
    { title: 'LAND', items: ALL_TYPES.filter(t => t.group === 'land') },
    { title: 'RESIDENTIAL', items: ALL_TYPES.filter(t => t.group === 'residential') },
    { title: 'COMMERCIAL', items: ALL_TYPES.filter(t => t.group === 'commercial') },
  ];

  return (
    <View style={{ backgroundColor: '#FFFDFA' }} className="flex-1 justify-between">
      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 110 }}
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
              Step 3 of 11
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            What type of property is it?
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Choose the option that best describes your property.
          </Text>
        </View>

        {/* Groups */}
        {groups.map((group) => (
          <View key={group.title} className="mb-6">
            <Text className="text-[#9CA3AF] font-extrabold text-[10px] tracking-widest mb-3 uppercase">
              {group.title}
            </Text>

            <View className="flex-col gap-3">
              {group.items.map((type) => {
                const isValid = isValidCombination(currentCategory, type.id as any);
                const isSelected = selectedType === type.id;
                const Icon = type.icon;
                const isBadgePopular = type.badge === 'Most Popular';

                return (
                  <TouchableOpacity
                    key={type.id}
                    disabled={!isValid}
                    activeOpacity={0.9}
                    onPress={() => handleSelect(type.id)}
                    style={{
                      borderColor: isSelected ? '#EB7F3E' : isValid ? '#EBE4DB' : '#E8E8E8',
                      backgroundColor: isSelected ? '#FEF7F2' : isValid ? '#FFFFFF' : '#FAFAF9',
                      borderWidth: isSelected ? 1.5 : 1,
                      borderRadius: 16,
                      opacity: isValid ? 1 : 0.5,
                    }}
                    className="flex-row items-center justify-between p-4"
                  >
                    {/* Left Side */}
                    <View className="flex-row items-center flex-1 pr-2">
                      {/* Icon Block */}
                      <View
                        style={{ backgroundColor: '#FAF1E8' }}
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                      >
                        <Icon size={22} color="#EB7F3E" strokeWidth={2} />
                      </View>

                      {/* Text Section */}
                      <View className="flex-1 items-start">
                        <Text className="text-[#222222] font-bold text-[16px] mb-0.5">
                          {type.label}
                        </Text>
                        <Text className="text-[#6B6B6B] text-[13px] mb-2.5">
                          {type.desc}
                        </Text>

                        {/* Badge Pill */}
                        <View
                          style={{
                            borderColor: isBadgePopular ? 'rgba(251, 146, 60, 0.22)' : '#F0D5C1',
                            backgroundColor: isBadgePopular ? 'rgba(251, 146, 60, 0.14)' : '#FFF8F2',
                          }}
                          className="border rounded-full px-2.5 py-1"
                        >
                          <Text 
                            style={{ 
                              color: isBadgePopular ? '#F97316' : '#AF5D2E' 
                            }} 
                            className="text-[11px] font-bold"
                          >
                            {type.badge}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Right Selection Circle */}
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: isSelected ? 0 : 1.5,
                        borderColor: '#D4CDC4',
                        backgroundColor: isSelected ? '#EB7F3E' : 'transparent',
                      }}
                      className="items-center justify-center ml-4"
                    >
                      {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: 'rgba(241, 245, 249, 0.8)',
          backgroundColor: '#FFFFFF',
        }}
        className="absolute bottom-0 left-0 right-0 p-5"
      >
        <TouchableOpacity
          disabled={!selectedType}
          onPress={handleContinue}
          activeOpacity={0.85}
          style={{
            backgroundColor: selectedType ? '#1E293B' : 'rgba(203, 213, 225, 0.6)',
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


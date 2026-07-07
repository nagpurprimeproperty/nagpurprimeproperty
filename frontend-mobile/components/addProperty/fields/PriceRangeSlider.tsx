import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import colors from '@/theme/colors';

const MIN_VALUE = 100000;       // ₹1 Lakh
const MAX_VALUE = 500000000;    // ₹50 Crore

export function formatPrice(value: number): string {
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  if (value >= 100000) {
    const lakh = value / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onRangeChange: (min: number, max: number) => void;
}

export default function PriceRangeSlider({ minPrice, maxPrice, onRangeChange }: PriceRangeSliderProps) {
  const [displayMin, setDisplayMin] = useState(minPrice || MIN_VALUE);
  const [displayMax, setDisplayMax] = useState(maxPrice || MAX_VALUE);

  const [isMinFocused, setIsMinFocused] = useState(false);
  const [isMaxFocused, setIsMaxFocused] = useState(false);
  const [minInputVal, setMinInputVal] = useState(String(minPrice || MIN_VALUE));
  const [maxInputVal, setMaxInputVal] = useState(String(maxPrice || MAX_VALUE));

  // Sync state values with props
  useEffect(() => {
    setDisplayMin(minPrice || MIN_VALUE);
  }, [minPrice]);

  useEffect(() => {
    setDisplayMax(maxPrice || MAX_VALUE);
  }, [maxPrice]);

  // Sync text inputs with props when not focused
  useEffect(() => {
    if (!isMinFocused) {
      setMinInputVal(String(minPrice || MIN_VALUE));
    }
  }, [minPrice, isMinFocused]);

  useEffect(() => {
    if (!isMaxFocused) {
      setMaxInputVal(String(maxPrice || MAX_VALUE));
    }
  }, [maxPrice, isMaxFocused]);

  const handleMinBlur = () => {
    setIsMinFocused(false);
    let val = parseInt(minInputVal.replace(/[^0-9]/g, ''), 10) || MIN_VALUE;
    // Clamp to range: MIN_VALUE <= val <= displayMax - 10000
    val = Math.max(MIN_VALUE, Math.min(displayMax - 10000, val));
    onRangeChange(val, displayMax);
  };

  const handleMaxBlur = () => {
    setIsMaxFocused(false);
    let val = parseInt(maxInputVal.replace(/[^0-9]/g, ''), 10) || MAX_VALUE;
    // Clamp to range: displayMin + 10000 <= val <= MAX_VALUE
    val = Math.max(displayMin + 10000, Math.min(MAX_VALUE, val));
    onRangeChange(displayMin, val);
  };

  return (
    <View style={S.container}>
      {/* Price labels / Inputs */}
      <View style={S.labelRow}>
        <View style={S.labelBox}>
          <Text style={S.labelTitle}>Min (₹)</Text>
          <TextInput
            style={S.labelInput}
            keyboardType="numeric"
            value={isMinFocused ? minInputVal : formatPrice(displayMin)}
            onFocus={() => {
              setIsMinFocused(true);
              setMinInputVal(String(displayMin));
            }}
            onChangeText={(txt) => {
              const cleaned = txt.replace(/[^0-9]/g, '');
              setMinInputVal(cleaned);
            }}
            onBlur={handleMinBlur}
            onSubmitEditing={handleMinBlur}
            returnKeyType="done"
            selectTextOnFocus
          />
        </View>
        <View style={S.labelDash}>
          <Text style={S.dashText}>—</Text>
        </View>
        <View style={[S.labelBox, { alignItems: 'flex-end' }]}>
          <Text style={S.labelTitle}>Max (₹)</Text>
          <TextInput
            style={[S.labelInput, { textAlign: 'right' }]}
            keyboardType="numeric"
            value={isMaxFocused ? maxInputVal : formatPrice(displayMax)}
            onFocus={() => {
              setIsMaxFocused(true);
              setMaxInputVal(String(displayMax));
            }}
            onChangeText={(txt) => {
              const cleaned = txt.replace(/[^0-9]/g, '');
              setMaxInputVal(cleaned);
            }}
            onBlur={handleMaxBlur}
            onSubmitEditing={handleMaxBlur}
            returnKeyType="done"
            selectTextOnFocus
          />
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  labelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  labelValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  labelInput: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    padding: 0,
    width: '100%',
  },
  labelDash: {
    paddingHorizontal: 10,
  },
  dashText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CBD5E1',
  },
});

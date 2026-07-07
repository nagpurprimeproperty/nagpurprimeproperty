import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';
import type { FieldDef } from '../../../lib/fieldMatrix';

// ── FieldWrapper ───────────────────────────────────────────────────────────────
function FieldWrapper({ label, required, error, hint, children }: {
  label: string; required: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-1 mb-2">
        <Text className="text-[13px] font-bold text-gray-700">{label}</Text>
        {required
          ? <Text className="text-orange-500 text-sm font-extrabold">*</Text>
          : <View className="bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5">
              <Text className="text-gray-400 text-[10px]">optional</Text>
            </View>
        }
      </View>
      {children}
      {hint && !error && (
        <View className="flex-row items-center gap-1 mt-1">
          <Ionicons name="information-circle-outline" size={12} color={colors.inactive} />
          <Text className="text-xs text-gray-400">{hint}</Text>
        </View>
      )}
      {error && (
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text className="text-xs text-red-500 flex-1">{error}</Text>
        </View>
      )}
    </View>
  );
}

// ── PremiumTextInput ───────────────────────────────────────────────────────────
// h-[52px] because h-13 is not a valid Tailwind class
function PremiumTextInput({ icon, value, placeholder, onChangeText, keyboardType, error, multiline }: {
  icon: keyof typeof Ionicons.glyphMap; value: string; placeholder: string;
  onChangeText: (t: string) => void; keyboardType?: any; error?: string; multiline?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const borderCls = error ? 'border-red-400 bg-red-50' : focused ? 'border-orange-500 bg-white' : 'border-gray-200 bg-white';

  if (multiline) {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}
        className={`border-[1.5px] rounded-xl flex-row items-start p-3.5 gap-2.5 ${borderCls}`}
        style={focused ? { shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 } : undefined}
      >
        <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.inactive} style={{ marginTop: 2 }} />
        <TextInput ref={inputRef} className="flex-1 text-gray-900 text-sm"
          style={{ minHeight: 100, textAlignVertical: 'top' }}
          placeholder={placeholder} placeholderTextColor={colors.inactive}
          value={value} onChangeText={onChangeText} multiline numberOfLines={4}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}
      className={`border-[1.5px] rounded-xl flex-row items-center px-3.5 gap-2.5 ${borderCls}`}
      style={[{ height: 52 }, focused ? { shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 } : {}]}
    >
      <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.inactive} />
      <TextInput ref={inputRef} className="flex-1 text-gray-900 text-sm"
        style={{ height: 52 }}
        placeholder={placeholder} placeholderTextColor={colors.inactive}
        value={value} onChangeText={onChangeText} keyboardType={keyboardType}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </TouchableOpacity>
  );
}

// ── Stepper ────────────────────────────────────────────────────────────────────
function Stepper({ value, onChange, min = 0, max = 99 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <View className="flex-row items-center border-[1.5px] border-gray-200 rounded-xl overflow-hidden self-start">
      <TouchableOpacity onPress={() => onChange(Math.max(min, (value || 0) - 1))} activeOpacity={0.75}
        className="items-center justify-center bg-gray-50" style={{ width: 48, height: 48 }}>
        <Ionicons name="remove" size={20} color="#374151" />
      </TouchableOpacity>
      <View className="items-center justify-center border-x border-gray-200 bg-white" style={{ width: 64, height: 48 }}>
        <Text className="text-gray-900 text-lg font-extrabold">{value ?? 0}</Text>
      </View>
      <TouchableOpacity onPress={() => onChange(Math.min(max, (value || 0) + 1))} activeOpacity={0.75}
        className="items-center justify-center bg-orange-50" style={{ width: 48, height: 48 }}>
        <Ionicons name="add" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

// ── SelectDropdown ─────────────────────────────────────────────────────────────
function SelectDropdown({ options, value, onChange, placeholder, error }: {
  options: string[]; value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.8}
        className={`flex-row items-center justify-between px-3.5 rounded-xl border-[1.5px]
          ${error ? 'border-red-400 bg-red-50' : open ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
        style={[{ height: 52 }, open ? { shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 6 } : {}]}
      >
        <Text className={`text-sm flex-1 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value || placeholder || 'Select…'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={open ? colors.primary : colors.inactive} />
      </TouchableOpacity>

      {open && (
        <View className="mt-1.5 border-[1.5px] border-orange-200 rounded-xl overflow-hidden bg-white"
          style={{ elevation: 6, shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10 }}>
          {options.map(opt => (
            <TouchableOpacity key={opt} onPress={() => { onChange(opt); setOpen(false); }} activeOpacity={0.8}
              className={`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50
                ${value === opt ? 'bg-orange-50' : 'bg-white'}`}>
              <Text className={`text-sm ${value === opt ? 'font-bold text-orange-700' : 'text-gray-900'}`}>{opt}</Text>
              {value === opt && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ── MultiSelect ────────────────────────────────────────────────────────────────
function MultiSelectField({ options, value = [], onChange }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(opt => {
        const sel = value.includes(opt);
        return (
          <TouchableOpacity key={opt} onPress={() => toggle(opt)} activeOpacity={0.8}
            className={`flex-row items-center gap-1 px-3 py-2 rounded-xl border-[1.5px]
              ${sel ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
            style={sel ? { elevation: 2, shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 } : undefined}
          >
            <Ionicons name={sel ? 'checkmark-circle' : 'ellipse-outline'} size={13} color={sel ? '#fff' : colors.inactive} />
            <Text className={`text-[13px] font-semibold ${sel ? 'text-white' : 'text-gray-700'}`}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── PriceInput ─────────────────────────────────────────────────────────────────
function PriceInput({ value, onChange, placeholder, error }: {
  value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  return (
    <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}
      className={`flex-row items-center rounded-xl overflow-hidden border-[1.5px]
        ${error ? 'border-red-400' : focused ? 'border-orange-500' : 'border-gray-200'}`}
      style={[{ height: 52 }, focused ? { shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 } : {}]}
    >
      <View className={`flex-row items-center gap-1 px-3.5 h-full bg-orange-50 border-r-[1.5px]
        ${focused ? 'border-orange-500' : 'border-gray-200'}`}>
        <Ionicons name="cash-outline" size={15} color={colors.primaryDark} />
        <Text className="text-orange-700 font-extrabold text-base">₹</Text>
      </View>
      <TextInput ref={inputRef} className="flex-1 px-3.5 text-gray-900 text-sm"
        style={{ height: 52 }}
        keyboardType="numeric" placeholder={placeholder || '0'} placeholderTextColor={colors.inactive}
        value={value} onChangeText={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </TouchableOpacity>
  );
}

// ── AutoCalcDisplay ────────────────────────────────────────────────────────────
function AutoCalcDisplay({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5 border-[1.5px] border-orange-200 bg-orange-50 rounded-xl px-3.5"
      style={{ height: 52 }}>
      <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center">
        <Ionicons name="calculator-outline" size={15} color="#fff" />
      </View>
      <Text className="text-orange-700 text-sm font-bold flex-1">{value || '—'}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}

// ── ToggleRow ──────────────────────────────────────────────────────────────────
function ToggleRow({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className={`flex-row items-center justify-between border-[1.5px] rounded-xl px-4 py-3.5
      ${value ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
      <View className="flex-row items-center gap-2.5">
        <View className={`w-8 h-8 rounded-full items-center justify-center
          ${value ? 'bg-orange-500' : 'bg-gray-200'}`}>
          <Ionicons name={value ? 'checkmark' : 'close'} size={16} color="#fff" />
        </View>
        <Text className={`text-sm font-semibold ${value ? 'text-orange-700' : 'text-gray-500'}`}>
          {value ? 'Yes' : 'No'}
        </Text>
      </View>
      <Switch value={!!value} onValueChange={onChange}
        trackColor={{ false: colors.border, true: '#FED7AA' }}
        thumbColor={value ? colors.primary : colors.inactive}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

// ── DateInput ──────────────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder, error }: {
  value: string; onChange: (t: string) => void; placeholder?: string; error?: string;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  return (
    <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}
      className={`flex-row items-center px-3.5 gap-2.5 border-[1.5px] rounded-xl
        ${error ? 'border-red-400 bg-red-50' : focused ? 'border-orange-500 bg-white' : 'border-gray-200 bg-white'}`}
      style={[{ height: 52 }, focused ? { shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 } : {}]}
    >
      <Ionicons name="calendar-outline" size={18} color={focused ? colors.primary : colors.inactive} />
      <TextInput ref={inputRef} className="flex-1 text-gray-900 text-sm"
        style={{ height: 52 }}
        placeholder={placeholder || 'DD/MM/YYYY'} placeholderTextColor={colors.inactive}
        value={value} onChangeText={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </TouchableOpacity>
  );
}

// ── DynamicField ───────────────────────────────────────────────────────────────
interface Props {
  field: FieldDef; value: any; allValues: Record<string, any>;
  onChange: (key: string, val: any) => void; error?: string;
}

export default function DynamicField({ field, value, allValues, onChange, error }: Props) {
  if (field.conditionKey && allValues[field.conditionKey] !== field.conditionValue) return null;
  const handleChange = (val: any) => onChange(field.key, val);

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return <PremiumTextInput icon="create-outline" value={value || ''} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} onChangeText={handleChange} error={error} />;
      case 'textarea':
        return <PremiumTextInput icon="document-text-outline" value={value || ''} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} onChangeText={handleChange} error={error} multiline />;
      case 'number':
        return <PremiumTextInput icon="calculator-outline" value={value?.toString() || ''} placeholder={field.placeholder || '0'} onChangeText={t => handleChange(t ? parseFloat(t) : undefined)} keyboardType="numeric" error={error} />;
      case 'price':
        return <PriceInput value={value?.toString() || ''} onChange={t => handleChange(t ? parseFloat(t) : undefined)} placeholder={field.placeholder} error={error} />;
      case 'stepper':
        return <Stepper value={value ?? 0} onChange={handleChange} min={field.min} max={field.max} />;
      case 'select':
        return <SelectDropdown options={field.options || []} value={value || ''} onChange={handleChange} placeholder={field.placeholder} error={error} />;
      case 'multi_select':
        return <MultiSelectField options={field.options || []} value={value || []} onChange={handleChange} />;
      case 'toggle':
        return <ToggleRow value={!!value} onChange={handleChange} />;
      case 'area_auto': {
        let computed = '';
        const source = field.autoCalcFrom ? allValues[field.autoCalcFrom] : null;
        if (source && !isNaN(parseFloat(source))) {
          if (field.autoCalcLabel?.includes('0.0929')) computed = (parseFloat(source) * 0.0929).toFixed(2) + ' sq.m';
          else if (field.autoCalcLabel?.includes('0.4047')) computed = (parseFloat(source) * 0.4047).toFixed(4) + ' ha';
          else if (field.autoCalcLabel?.includes('÷')) {
            const ca = allValues['carpetArea'];
            if (ca && parseFloat(ca) > 0) computed = '₹ ' + (parseFloat(source) / parseFloat(ca)).toFixed(0) + ' / sq.ft';
          }
        }
        return <AutoCalcDisplay value={computed} label={field.autoCalcLabel || ''} />;
      }
      case 'date':
        return <DateInput value={value || ''} onChange={handleChange} placeholder={field.placeholder} error={error} />;
      default:
        return null;
    }
  };

  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      {renderInput()}
    </FieldWrapper>
  );
}
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, User } from "lucide-react-native";
import { toast } from "react-hot-toast/headless";

import ScreenHeader from "@/shared/components/ScreenHeader";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { useProfile, useUpdateProfileMutation } from "@/features/profile";
import { useAuthStore } from "@/features/auth";

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const user = useAuthStore((state) => state.user);
  const { profile } = useProfile();
  const displayUser = profile ?? user;

  const updateProfileMutation = useUpdateProfileMutation();
  const saving = updateProfileMutation.isPending;

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  // Initial state tracking to detect unsaved changes
  const [initialState, setInitialState] = useState<{
    name: string;
    email: string;
    city: string;
    area: string;
    avatarUri?: string;
  } | null>(null);

  // Focus Refs
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const cityInputRef = useRef<TextInput>(null);
  const areaInputRef = useRef<TextInput>(null);

  const isSavedRef = useRef(false);

  // Initialize form fields once user data is loaded
  useEffect(() => {
    if (displayUser && !initialState) {
      const data = {
        name: displayUser.name ?? "",
        email: displayUser.email ?? "",
        city: displayUser.city ?? "",
        area: displayUser.area ?? "",
        avatarUri: displayUser.avatar ?? undefined,
      };
      setName(data.name);
      setEmail(data.email);
      setCity(data.city);
      setArea(data.area);
      setAvatarUri(data.avatarUri);
      setInitialState(data);
    }
  }, [displayUser, initialState]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialState) return false;
    return (
      name !== initialState.name ||
      email !== initialState.email ||
      city !== initialState.city ||
      area !== initialState.area ||
      avatarUri !== initialState.avatarUri
    );
  }, [name, email, city, area, avatarUri, initialState]);

  // Warn on navigation if there are unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges || isSavedRef.current) {
        return;
      }

      // Prevent leaving immediately
      e.preventDefault();

      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them and leave?",
        [
          { text: "Keep Editing", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  // Gallery photo picker
  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your avatar."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  // Camera photo capture
  const captureFromCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your camera to capture a new avatar."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  // Show options Alert when tapping avatar
  const handlePhotoPress = useCallback(() => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option to update your photo",
      [
        { text: "Take Photo", onPress: captureFromCamera },
        { text: "Choose from Library", onPress: pickFromGallery },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, [captureFromCamera, pickFromGallery]);

  // Submit profile edits
  const handleSave = useCallback(() => {
    if (saving) return;

    const nextPayload = {
      name: name?.trim() || undefined,
      email: email?.trim() || undefined,
      city: city?.trim() || undefined,
      area: area?.trim() || undefined,
      avatarUri: avatarUri,
    };

    updateProfileMutation.mutate(nextPayload, {
      onSuccess: () => {
        isSavedRef.current = true;
        toast.success("Your profile has been updated.");
        router.back();
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Unable to update your profile.");
      },
    });
  }, [name, email, city, area, avatarUri, saving, updateProfileMutation, router]);

  // Header Save Button
  const headerSaveButton = useMemo(() => {
    return (
      <TouchableOpacity
        disabled={saving}
        onPress={handleSave}
        activeOpacity={0.8}
        className="px-3 py-1.5 rounded-lg"
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text className="font-black text-sm uppercase tracking-wider" style={{ color: colors.primary }}>
            Save
          </Text>
        )}
      </TouchableOpacity>
    );
  }, [saving, handleSave, colors.primary]);

  return (
    <ScreenWrapper edges={["top", "bottom"]}>
      <ScreenHeader
        title="Edit Profile"
        showBack={true}
        rightElement={headerSaveButton}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View className="items-center mt-6 mb-6">
            <View className="relative">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-28 h-28 rounded-full border-[3px] border-white shadow-md"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                  }}
                />
              ) : (
                <View
                  className="w-28 h-28 rounded-full items-center justify-center border-[3px] border-white shadow-md"
                  style={{
                    backgroundColor: colors.primaryLight,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                  }}
                >
                  <User size={52} color={colors.primary} strokeWidth={2} />
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePhotoPress}
                disabled={saving}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full items-center justify-center border-2 border-white shadow"
                style={{ backgroundColor: colors.primary }}
              >
                <Camera size={16} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <Text className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
              Tap to change photo
            </Text>
          </View>

          {/* Form Fields Card */}
          <View className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm shadow-slate-100/50 gap-4">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Full Name
              </Text>
              <TextInput
                ref={nameInputRef}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textPlaceholder}
                className="rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] text-slate-900"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                blurOnSubmit={false}
                editable={!saving}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Email Address
              </Text>
              <TextInput
                ref={emailInputRef}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                placeholderTextColor={colors.textPlaceholder}
                className="rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] text-slate-900"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => cityInputRef.current?.focus()}
                blurOnSubmit={false}
                editable={!saving}
              />
            </View>

            {/* Location (City & Area) */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  City
                </Text>
                <TextInput
                  ref={cityInputRef}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={colors.textPlaceholder}
                  className="rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] text-slate-900"
                  returnKeyType="next"
                  onSubmitEditing={() => areaInputRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!saving}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Area
                </Text>
                <TextInput
                  ref={areaInputRef}
                  value={area}
                  onChangeText={setArea}
                  placeholder="Area"
                  placeholderTextColor={colors.textPlaceholder}
                  className="rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] text-slate-900"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Bottom Action Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={saving}
            className="mt-6 rounded-xl py-4 items-center justify-center shadow-md shadow-orange-500/20"
            style={{ backgroundColor: saving ? colors.textPlaceholder : colors.primary }}
          >
            {saving ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color={colors.white} />
                <Text className="text-white font-black text-sm uppercase tracking-wider">
                  Saving Changes...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-black text-sm uppercase tracking-wider">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

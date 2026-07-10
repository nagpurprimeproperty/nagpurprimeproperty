import { useTheme } from "@/hooks/useTheme";
import { useLogoutMutation, useAuthStore } from "@/features/auth";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useProfile } from "@/features/profile";
import { useUnreadCount } from "@/features/notification";
import { useModal } from "@/context/ModalContext";
import ConfirmationOverlay from "@/shared/components/ui/ConfirmationOverlay";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  FileText,
  Heart,
  HelpCircle,
  Home,
  Info,
  MapPin,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Star,
  User,
  UserX,
  Users,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  InteractionManager,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHeader from "@/shared/components/ScreenHeader";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import SectionDivider from "@/shared/components/SectionDivider";
import Shimmer from "@/shared/components/Shimmer";

function StatCard({ value, label, delay, onPress, active }: any) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, delay, opacity, scale]);

  return (
    <Animated.View
      className="flex-1 mx-1"
      style={{ opacity, transform: [{ scale }] }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View
          className="items-center py-5 rounded-xl border border-slate-200"
          style={[{ backgroundColor: colors.white }]}
        >
          <Text className="text-2xl font-black text-slate-500 tracking-tight">
            {value}
          </Text>
          <Text className="text-[12px] font-bold text-slate-500 text-center mt-1">
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function MenuItem({ icon: Icon, label, badge, onPress, delay, active }: any) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, delay, useNativeDriver: true }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, delay, opacity, translateX]);

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateX }] }}
      className="mb-3"
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="flex-row items-center rounded-xl px-4 py-4 border border-slate-200"
        style={[{ backgroundColor: colors.white }]}
      >
        <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mr-3">
          <Icon size={18} color={colors.primary} strokeWidth={2} />
        </View>
        <Text className="flex-1 text-[14px] font-bold text-slate-800">
          {label}
        </Text>
        {badge > 0 && (
          <View className="bg-orange-500 rounded-xl px-2.5 py-1 mr-2">
            <Text className="text-white text-[10px] font-black">{badge}</Text>
          </View>
        )}
        <ChevronRight size={16} color={colors.textPlaceholder} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function ProfileSkeleton() {
  const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"];

  return (
    <View className="px-3 pt-2">
      <View className="rounded-xl bg-white p-6 border border-slate-200">
        <View className="items-center">
          <Shimmer
            shimmerColors={shimmerColors}
            style={{ width: 80, height: 80, borderRadius: 9999 }}
          />
          <Shimmer
            shimmerColors={shimmerColors}
            style={{ width: "45%", height: 18, borderRadius: 9999, marginTop: 16 }}
          />
          <Shimmer
            shimmerColors={shimmerColors}
            style={{ width: "70%", height: 12, borderRadius: 9999, marginTop: 10 }}
          />
          <Shimmer
            shimmerColors={shimmerColors}
            style={{ width: "100%", height: 46, borderRadius: 16, marginTop: 18 }}
          />
        </View>

        <View className="flex-row mt-6 gap-1">
          {[0, 1, 2, 3].map((item) => (
            <View key={item} className="flex-1 mx-1 rounded-xl bg-slate-50 py-5 px-2">
              <Shimmer
                shimmerColors={shimmerColors}
                style={{ width: "70%", height: 28, borderRadius: 8, alignSelf: "center" }}
              />
              <Shimmer
                shimmerColors={shimmerColors}
                style={{ width: "60%", height: 12, borderRadius: 8, marginTop: 10, alignSelf: "center" }}
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-4">
        {[0, 1, 2, 3].map((item) => (
          <View
            key={item}
            className="mb-3 rounded-xl bg-white px-4 py-4 border border-slate-200"
          >
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: "70%", height: 16, borderRadius: 8 }}
            />
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: "90%", height: 12, borderRadius: 8, marginTop: 12 }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

type ProfileStatsResponse = {
  success: boolean;
  data: {
    propertiesCount: number;
    leadsCount: number;
    enquiriesCount: number;
    savedPropertiesCount: number;
  };
};



export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { openAuth } = useModal();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const phone = useAuthStore((state) => state.phone);
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const { profile, isLoading, isError, error } = useProfile();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: statsResponse } = useApiQuery<ProfileStatsResponse>(
    ["profile-stats"],
    "/stats",
    undefined,
    isAuthenticated,
  );
  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);
  const [animationsTriggered, setAnimationsTriggered] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setAnimationsTriggered(true);
    });
    return () => task.cancel();
  }, []);

  const displayUser = useMemo(() => profile ?? user, [profile, user]);
  const displayName = displayUser?.name || (isAuthenticated && phone ? `+91 ${phone}` : "Guest User");
  const mobileValue = displayUser?.mobile || phone || "Not added yet";
  const emailValue = displayUser?.email || "Not added yet";
  const cityValue = displayUser?.city || "Not added yet";
  const areaValue = displayUser?.area || "Not added yet";
  const subtitle =
    displayUser?.email ||
    (displayUser?.city && displayUser?.area
      ? `${displayUser.city}, ${displayUser.area}`
      : displayUser?.city ||
        (isAuthenticated
          ? "Verified user • Access premium features"
          : "Sign in to unlock premium broker contacts"));

  const stats = useMemo(() => {
    const statsData = statsResponse?.success ? statsResponse.data : undefined;

    return [
      {
        value: statsData?.savedPropertiesCount ?? 0,
        label: "Saved",
        navigation: "/saved",
      },
      {
        value: statsData?.enquiriesCount ?? 0,
        label: "Enquiries",
        navigation: "/(myEnquiries)/enquiries",
      },
      {
        value: statsData?.propertiesCount ?? 0,
        label: "Listings",
        navigation: "/(myListing)/myProperties",
      },
      {
        value: statsData?.leadsCount ?? 0,
        label: "Leads",
        navigation: "/(myListing)/leads",
      },
    ];
  }, [statsResponse]);

  const openEditor = useCallback(() => {
    router.push("/profile/edit");
  }, [router]);

  const handleLogoutConfirm = useCallback(() => {
    setConfirmLogoutVisible(false);
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <ScreenWrapper edges={["top"]}>
      <ScreenHeader
        title="Profile"
        subtitle="Your account"
        showBack={false}
        rightElement={
          <TouchableOpacity
            onPress={() => router.push("/notification")}
            className="w-11 h-11 items-center justify-center relative"
            activeOpacity={0.7}
          >
            <Bell size={24} color="#1E293B" strokeWidth={2} />
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  backgroundColor: "#EF4444",
                  borderRadius: 10,
                  paddingHorizontal: 4,
                  minWidth: 18,
                  height: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: "#FFFFFF",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: "white",
                    fontSize: 9,
                    fontWeight: "900",
                    textAlign: "center",
                    includeFontPadding: false,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
      >
        {isAuthenticated && isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <View className="mb-6 mt-2">
              <View
                className="rounded-xl overflow-hidden p-6 border border-slate-200"
                style={[{ backgroundColor: colors.white }]}
              >
                <View className="items-center">
                  {displayUser?.avatar ? (
                    <Image
                      source={{ uri: displayUser.avatar }}
                      className="w-20 h-20 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className="w-20 h-20 rounded-full items-center justify-center border-3 border-white"
                      style={{
                        backgroundColor: colors.primaryLight,
                        shadowColor: colors.shadowPrimary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <User size={36} color={colors.primary} strokeWidth={2.5} />
                    </View>
                  )}

                  <View
                    className="absolute top-0 right-0 rounded-full px-2 py-1 border-2 border-white"
                    style={{ backgroundColor: isAuthenticated ? colors.success : colors.primary }}
                  >
                    <Text className="text-[8px] font-black text-white">
                      {isAuthenticated ? "VERIFIED" : "GUEST"}
                    </Text>
                  </View>

                  <Text className="text-xl font-black text-slate-950 mt-4 tracking-tight">
                    {displayName}
                  </Text>
                  <Text className="text-slate-500 text-xs font-medium text-center mt-2 px-4 leading-5">
                    {subtitle}
                  </Text>

                  {isError && isAuthenticated ? (
                    <Text className="text-red-500 text-xs font-semibold mt-3 text-center">
                      {error?.message ?? "Could not sync your profile right now."}
                    </Text>
                  ) : null}

                  <View className="mt-5 w-full">
                    {isAuthenticated ? (
                      <View className="flex-row gap-3 w-full">
                        <TouchableOpacity
                          activeOpacity={0.85}
                          className="flex-row items-center justify-center rounded-lg py-3"
                          style={{ 
                            backgroundColor: colors.primary,
                            flex: 1
                          }}
                          onPress={openEditor}
                        >
                          <Text className="text-white font-black text-xs uppercase tracking-wider">
                            Edit Profile
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          className="flex-row items-center justify-center rounded-lg py-3 border"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.error,
                            flex: 1
                          }}
                          onPress={() => setConfirmLogoutVisible(true)}
                        >
                          <Text className="font-black text-xs uppercase tracking-wider"
                            style={{ color: colors.error }}
                          >
                            Log Out
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        className="flex-row items-center justify-center rounded-full py-3 px-6"
                        style={{ backgroundColor: colors.black, alignSelf: "center", minWidth: 180 }}
                        onPress={() => openAuth("verifyNumber")}
                      >
                        <PhoneCall size={16} color={colors.white} />
                        <Text className="text-white font-black text-xs uppercase tracking-wider ml-2">
                          Verify Number
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className="mt-6 border-t border-slate-100 pt-4">
                  <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Profile Details
                  </Text>

                  {[
                    { label: "Mobile", value: mobileValue },
                    { label: "Email", value: emailValue },
                    { label: "City", value: cityValue },
                    { label: "Area", value: areaValue },
                  ].map((item) => (
                    <View key={item.label} className="flex-row items-center justify-between py-3 border-b border-slate-100">
                      <Text className="text-xs font-bold text-slate-500">{item.label}</Text>
                      <Text className="text-sm font-bold text-slate-900 text-right flex-1 ml-4">
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row mt-6 gap-1">
                  {stats.map((s, i) => (
                    <StatCard
                      key={s.label}
                      {...s}
                      delay={50 + i * 50}
                      onPress={() => router.push(s.navigation as any)}
                      active={animationsTriggered}
                    />
                  ))}
                </View>
              </View>
            </View>



            <View className="mb-3">
              <SectionDivider label="Property Management" />
              <MenuItem
                icon={Home}
                label="My Properties"
                delay={100}
                onPress={() => router.push("/(myListing)/myProperties")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={Users}
                label="Leads"
                delay={130}
                onPress={() => router.push("/(myListing)/leads")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={Star}
                label="Subscription Plans"
                delay={160}
                onPress={() => router.push("/(subscription)/subscription")}
                active={animationsTriggered}
              />
            </View>

            <View className="mb-3 mt-2">
              <SectionDivider label="Buyer Preferences" />
              <MenuItem
                icon={Heart}
                label="Saved Properties"
                delay={190}
                onPress={() => router.push("/saved")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={MessageSquare}
                label="My Enquiries"
                delay={220}
                onPress={() => router.push("/(myEnquiries)/enquiries")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={MapPin}
                label="Set Location"
                delay={250}
                onPress={() => router.push("/location")}
                active={animationsTriggered}
              />
            </View>

            <View className="mb-4 mt-2">
              <SectionDivider label="Support & Legal" />
              <MenuItem
                icon={Bell}
                label="Notifications"
                delay={280}
                onPress={() => router.push("/notification")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={HelpCircle}
                label="Help & Support"
                delay={310}
                onPress={() => router.push("/(accountAndSupport)/helpAndSupport")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={FileText}
                label="Terms & Conditions"
                delay={340}
                onPress={() => router.push("/(accountAndSupport)/termsAndConditions")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={ShieldCheck}
                label="Privacy Policy"
                delay={370}
                onPress={() => router.push("/(accountAndSupport)/privacy")}
                active={animationsTriggered}
              />
              <MenuItem
                icon={Info}
                label="About Us"
                delay={400}
                onPress={() => router.push("/(accountAndSupport)/about")}
                active={animationsTriggered}
              />
              {isAuthenticated && (
                <MenuItem
                  icon={UserX}
                  label="Delete Account"
                  delay={430}
                  onPress={() => router.push("/(accountAndSupport)/deleteAccount")}
                  active={animationsTriggered}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmationOverlay
        visible={confirmLogoutVisible}
        variant="danger"
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to continue."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogoutVisible(false)}
      />
    </ScreenWrapper>
  );
}
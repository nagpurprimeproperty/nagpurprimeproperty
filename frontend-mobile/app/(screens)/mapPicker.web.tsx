/**
 * mapPicker.web.tsx
 * Web-only stub — react-native-maps is a native-only library and cannot run
 * in a browser. Metro automatically picks this file on the web platform
 * instead of mapPicker.tsx, preventing the codegen import error.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@/theme/colors";

export default function MapPickerScreenWeb() {
  const router = useRouter();

  return (
    <View style={S.container}>
      <View style={S.card}>
        <View style={S.iconWrap}>
          <Ionicons name="map-outline" size={48} color={colors.primary} />
        </View>
        <Text style={S.title}>Map Picker</Text>
        <Text style={S.subtitle}>
          The interactive map picker is available on the{" "}
          <Text style={S.bold}>iOS & Android</Text> apps only.{"\n"}
          Please use the mobile app to drop a pin on your property location.
        </Text>
        <TouchableOpacity
          style={S.btn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={S.btnTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fff7ed",
    borderWidth: 2,
    borderColor: "#fed7aa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  bold: { fontWeight: "700", color: "#374151" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnTxt: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

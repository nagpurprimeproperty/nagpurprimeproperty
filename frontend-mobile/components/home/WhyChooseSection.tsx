import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import { ShieldCheck, Camera, Zap, Tag } from "lucide-react-native";

const FEATURES = [
  { id: "verified", Icon: ShieldCheck, label: "Verified\nBrokers"   },
  { id: "photos",   Icon: Camera,      label: "Real\nPhotos"        },
  { id: "connect",  Icon: Zap,         label: "Instant\nConnect"    },
  { id: "free",     Icon: Tag,         label: "Zero\nCommission"    },
];

const WhyChooseSection = memo(function WhyChooseSection() {
  return (
    <Reanimated.View
      entering={FadeInDown.delay(300).duration(450).springify()}
      style={styles.outer}
    >
      <View style={styles.card}>

        {/* Title */}
        <Text style={styles.title}>Why Choose Nagpur Prime Property?</Text>

        {/* 4-column feature row */}
        <View style={styles.row}>
          {FEATURES.map(({ id, Icon, label }, index) => (
            <View key={id} style={styles.col}>
              {/* Orange solid circle icon */}
              <View style={styles.iconCircle}>
                <Icon size={22} color="#FFFFFF" strokeWidth={1.8} />
              </View>

              {/* Label */}
              <Text style={styles.label}>{label}</Text>

              {/* Vertical separator (not on last item) */}
              {index < FEATURES.length - 1 && <View style={styles.sep} />}
            </View>
          ))}
        </View>

      </View>
    </Reanimated.View>
  );
});

export default WhyChooseSection;

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#FFF0E5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  // Title
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 18,
    letterSpacing: -0.2,
  },

  // Feature row
  row: {
    flexDirection: "row",
  },
  col: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },

  // Solid orange circle
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // Label
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 15,
  },

  // Thin separator between columns
  sep: {
    position: "absolute",
    right: 0,
    top: 5,
    width: 1,
    height: 56,
    backgroundColor: "#F97316",
    opacity: 0.2,
  },
});

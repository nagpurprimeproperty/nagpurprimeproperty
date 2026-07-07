import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  subtitle?: string;
  onPressSeeAll?: () => void;
};

export default function SectionHeader({ title, subtitle, onPressSeeAll }: Props) {
  const { colors } = useTheme();
  const arrowX = useSharedValue(0);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
  }));

  return (
    <View className="flex-row justify-between items-center mb-3">
      <View>
        <Text
          style={{ color: colors.text, letterSpacing: -0.3 }}
          className="text-base font-semibold"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs mt-0.5"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {onPressSeeAll && (
        <AnimatedPressable
          onPress={onPressSeeAll}
          onPressIn={() => {
            arrowX.value = withSpring(4);
          }}
          onPressOut={() => {
            arrowX.value = withSpring(0);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: colors.primaryLight,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text
            style={{ color: colors.primary }}
            className="text-xs font-bold"
          >
            See All
          </Text>
          <Animated.View style={arrowStyle}>
            <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          </Animated.View>
        </AnimatedPressable>
      )}
    </View>
  );
}
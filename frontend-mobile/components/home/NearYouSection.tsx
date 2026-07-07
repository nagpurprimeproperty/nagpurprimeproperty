import Animated, { FadeInDown } from "react-native-reanimated";
import SectionHeader from "../common/SectionHeader";
import PropertyList from "../property/PropertyList";
import { router } from "expo-router";

type Props = {
  data?: any[];
  locality?: string | null;
  onToggleSave?: (id: string) => void;
  onCreateCallEnquiry?: (id: string) => Promise<any>;
};

export default function NearYouSection({
  data = [],
  locality,
  onToggleSave,
  onCreateCallEnquiry,
}: Props) {
  const subtitle = locality
    ? `Properties in ${locality}`
    : "Properties near you";

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(500).springify()}
      style={{ paddingHorizontal: 12, marginTop: 24 }}
    >
      <SectionHeader
        title="Near You"
        subtitle={subtitle}
        onPressSeeAll={() => {
          router.push("/(tabs)/search");
        }}
      />
      <PropertyList
        data={data}
        horizontal
        fullSize
        onToggleSave={onToggleSave}
        onCreateCallEnquiry={onCreateCallEnquiry}
      />
    </Animated.View>
  );
}
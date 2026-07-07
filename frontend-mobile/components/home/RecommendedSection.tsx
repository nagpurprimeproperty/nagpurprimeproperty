import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import SectionHeader from "../common/SectionHeader";
import PropertyList from "../property/PropertyList";
import { memo } from "react";

const RecommendedSection = memo(function RecommendedSection({
  data,
  onToggleSave,
  onCreateCallEnquiry,
}: {
  data: any[];
  onToggleSave?: (id: string) => void;
  onCreateCallEnquiry?: (id: string) => Promise<any>;
}) {
  const sectionData = Array.isArray(data) ? data : [];

  return (
    <Animated.View
      entering={FadeInDown.delay(500).duration(500).springify()}
      style={{ paddingHorizontal: 12, marginTop: 24 }}
    >
      <SectionHeader
        title="Recommended For You"
        subtitle="Based on your interests"
      />
      {sectionData.length === 0 ? (
        <View className="bg-white rounded-2xl border border-slate-200 p-5">
          <Text className="text-slate-900 text-base font-bold">
            No recommendations yet
          </Text>
          <Text className="text-slate-500 text-sm mt-2 leading-5">
            Browse featured homes and nearby listings to discover more properties.
          </Text>
        </View>
      ) : (
        <PropertyList
          data={sectionData}
          horizontal
          fullSize
          onToggleSave={onToggleSave}
          onCreateCallEnquiry={onCreateCallEnquiry}
        />
      )}
    </Animated.View>
  );
});

export default RecommendedSection;
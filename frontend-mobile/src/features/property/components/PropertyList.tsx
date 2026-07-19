import { useCallback, memo } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import PropertyCard, { PROPERTY_CARD_WIDTH_OFFSET } from "./PropertyCard";

const VERTICAL_ITEM_HEIGHT = 380;
const HORIZONTAL_ITEM_WIDTH = 214;
const FULL_CARD_GAP = 16;

const contentStyles = StyleSheet.create({
  container: { paddingVertical: 10 },
  fullSizeRow: { paddingVertical: 4 },
});

type ListItemProps = {
  item: any;
  horizontal?: boolean;
  fullSize?: boolean;
  fullCardWidth: number;
  gap: number;
  onToggleSave?: (id: string) => void;
  onCreateCallEnquiry?: (id: string) => Promise<any>;
};

const PropertyListItem = memo(({
  item,
  horizontal,
  fullSize,
  fullCardWidth,
  gap,
  onToggleSave,
  onCreateCallEnquiry,
}: ListItemProps) => {
  if (horizontal && fullSize) {
    return (
      <View style={{ width: fullCardWidth, marginRight: gap }}>
        <PropertyCard
          item={item}
          width={fullCardWidth}
          onToggleSave={onToggleSave}
          onCreateCallEnquiry={onCreateCallEnquiry}
        />
      </View>
    );
  }

  return (
    <PropertyCard
      item={item}
      variant={horizontal ? "horizontal" : "vertical"}
      onToggleSave={onToggleSave}
      onCreateCallEnquiry={onCreateCallEnquiry}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.horizontal === nextProps.horizontal &&
    prevProps.fullSize === nextProps.fullSize &&
    prevProps.fullCardWidth === nextProps.fullCardWidth &&
    prevProps.gap === nextProps.gap &&
    prevProps.onToggleSave === nextProps.onToggleSave &&
    prevProps.onCreateCallEnquiry === nextProps.onCreateCallEnquiry &&
    (prevProps.item.id || prevProps.item._id) === (nextProps.item.id || nextProps.item._id) &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.location === nextProps.item.location &&
    prevProps.item.area === nextProps.item.area &&
    prevProps.item.badge === nextProps.item.badge &&
    prevProps.item.isSaved === nextProps.item.isSaved &&
    prevProps.item.isLiked === nextProps.item.isLiked
  );
});

type Props = {
  data: any[];
  horizontal?: boolean;
  /** Horizontal scroll using full home-style property cards. */
  fullSize?: boolean;
  onToggleSave?: (id: string) => void;
  onCreateCallEnquiry?: (id: string) => Promise<any>;
};

export default function PropertyList({
  data,
  horizontal,
  fullSize,
  onToggleSave,
  onCreateCallEnquiry,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const fullCardWidth = Math.max(0, windowWidth - PROPERTY_CARD_WIDTH_OFFSET);
  const fullItemLength = fullCardWidth + FULL_CARD_GAP;

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <PropertyListItem
        item={item}
        horizontal={horizontal}
        fullSize={fullSize}
        fullCardWidth={fullCardWidth}
        gap={FULL_CARD_GAP}
        onToggleSave={onToggleSave}
        onCreateCallEnquiry={onCreateCallEnquiry}
      />
    ),
    [horizontal, fullSize, fullCardWidth, onToggleSave, onCreateCallEnquiry],
  );

  const getItemLayout = horizontal
    ? fullSize
      ? (_: any, index: number) => ({
          length: fullItemLength,
          offset: fullItemLength * index,
          index,
      })
      : (_: any, index: number) => ({
          length: HORIZONTAL_ITEM_WIDTH,
          offset: HORIZONTAL_ITEM_WIDTH * index,
          index,
      })
    : (_: any, index: number) => ({
        length: VERTICAL_ITEM_HEIGHT,
        offset: VERTICAL_ITEM_HEIGHT * index,
        index,
    });

  const keyExtractor = useCallback((item: any) => item?.id?.toString() ?? item?._id?.toString() ?? "", []);

  if (horizontal) {
    return (
      <FlatList
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          fullSize ? contentStyles.fullSizeRow : contentStyles.container
        }
        snapToInterval={fullSize ? fullItemLength : undefined}
        decelerationRate={fullSize ? "fast" : undefined}
        disableIntervalMomentum={fullSize}
        scrollEventThrottle={16}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      horizontal={false}
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentStyles.container}
      getItemLayout={getItemLayout}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      removeClippedSubviews
      updateCellsBatchingPeriod={50}
      renderItem={renderItem}
    />
  );
}

import { useTheme } from "@/hooks/useTheme";
import React, { useCallback, useState, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";

const DUMMY_FALLBACK =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

type PropertyImageCarouselProps = {
  images: string[];
  width: number;
  height: number;
  rounded?: boolean;
};

function PropertyImageCarousel({
  images,
  width,
  height,
  rounded = false,
}: PropertyImageCarouselProps) {

  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [isInteracted, setIsInteracted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const activeIndexRef = useRef(0);

  const slideCount = images.length;

  const getUri = useCallback(
    (uri: string) => (failedImages[uri] ? DUMMY_FALLBACK : uri),
    [failedImages],
  );

  const handleTouchStart = useCallback(() => {
    setIsInteracted(true);
  }, []);

  const keyExtractor = useCallback((_: string, idx: number) => String(idx), []);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Image
        source={{ uri: getUri(item) }}
        style={{ width, height }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        onError={() =>
          setFailedImages((prev) => ({ ...prev, [item]: true }))
        }
      />
    ),
    [width, height, getUri],
  );

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    const clamped = Math.max(0, Math.min(idx, slideCount - 1));
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
  };

  if (slideCount === 0) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: colors.borderLight,
          ...(rounded ? { borderTopLeftRadius: 18, borderTopRightRadius: 18 } : {}),
          overflow: "hidden",
        }}
      />
    );
  }

  if (slideCount === 1) {
    const uri = images[0];
    return (
      <View
        style={[
          styles.wrapper,
          { width, height },
          rounded && styles.roundedTop,
        ]}
      >
        <Image
          source={{ uri: getUri(uri) }}
          style={{ width, height }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          onError={() =>
            setFailedImages((prev) => ({ ...prev, [uri]: true }))
          }
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        { width, height },
        rounded && styles.roundedTop,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        bounces={slideCount > 1}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        nestedScrollEnabled
        style={{ width, height }}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        onScrollBeginDrag={handleTouchStart}
        onTouchStart={handleTouchStart}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
      />

      {slideCount > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  width: idx === activeIndex ? 20 : 7,
                  backgroundColor:
                    idx === activeIndex
                      ? colors.primary
                      : "rgba(255,255,255,0.55)",
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  roundedTop: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
});

export default React.memo(PropertyImageCarousel, (prevProps, nextProps) => {
  return (
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.rounded === nextProps.rounded &&
    prevProps.images.length === nextProps.images.length &&
    prevProps.images.join(",") === nextProps.images.join(",")
  );
});

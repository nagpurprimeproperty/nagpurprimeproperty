import { Tabs } from "expo-router";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import React, { useMemo } from "react";
import Svg, { Path } from "react-native-svg";
import { Home, Search, Heart, User, Plus } from "lucide-react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getPath = (width: number, height: number) => {
  const r = 24; // corner radius of the top-left / top-right
  const center = width / 2;
  const startX = center - 52;
  const endX = center + 52;

  return `
    M 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    L ${startX} 0
    C ${center - 43.2} 0, ${center - 36} 7.2, ${center - 36} 16
    C ${center - 36} 36, ${center - 20} 52, ${center} 52
    C ${center + 20} 52, ${center + 36} 36, ${center + 36} 16
    C ${center + 36} 7.2, ${center + 43.2} 0, ${endX} 0
    L ${width - r} 0
    A ${r} ${r} 0 0 1 ${width} ${r}
    L ${width} ${height}
    L 0 ${height}
    Z
  `;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const TabBg = React.memo(({ width, height }: { width: number; height: number }) => {
  const path = useMemo(() => getPath(width, height), [width, height]);
  return (
    <View style={styles.tabBgContainer}>
      <Svg width={width} height={height}>
        <Path d={path} fill="white" stroke="#F1F5F9" strokeWidth={1.5} />
      </Svg>
    </View>
  );
});
TabBg.displayName = "TabBg";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName === "addProperty") {
    return <View style={{ height: 0, backgroundColor: "transparent" }} />;
  }

  const bottomInset = Math.round(insets?.bottom ?? 0);
  const visibleHeight = 72;
  const totalHeight = visibleHeight + bottomInset;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          height: totalHeight + 12,
        }
      ]}
    >
      <TabBg width={SCREEN_WIDTH} height={totalHeight} />
      
      <View style={styles.buttonsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // 1. Center FAB Button
          if (route.name === "addProperty") {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={(options as any).tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.8}
                style={styles.fabTabButton}
              >
                <View
                  style={[
                    styles.fabButton,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ]}
                >
                  <Plus size={24} color="white" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            );
          }

          // 2. Normal Tabs
          const labelMap: Record<string, string> = {
            home: "Home",
            search: "Search",
            saved: "Saved",
            profile: "Profile",
          };
          const label = labelMap[route.name] || route.name;

          const renderIcon = () => {
            const iconColor = isFocused ? colors.primary : "#94A3B8";
            const size = 22;
            const strokeWidth = 2;

            switch (route.name) {
              case "home":
                return <Home size={size} color={iconColor} strokeWidth={strokeWidth} />;
              case "search":
                return <Search size={size} color={iconColor} strokeWidth={strokeWidth} />;
              case "saved":
                return <Heart size={size} color={iconColor} strokeWidth={strokeWidth} />;
              case "profile":
                return <User size={size} color={iconColor} strokeWidth={strokeWidth} />;
              default:
                return null;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <View style={styles.tabIconContainer}>
                {renderIcon()}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? colors.primary : "#64748B",
                      fontWeight: isFocused ? "600" : "500",
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
              {isFocused && (
                <View
                  style={[
                    styles.activeIndicator,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen
        name="addProperty"
        options={{
          title: "",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBgContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 12,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    height: 72,
    width: "100%",
    position: "absolute",
    top: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 72,
    paddingTop: 4,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    position: "absolute",
    bottom: 2,
  },
  fabTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 72,
  },
  fabButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    top: -20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});

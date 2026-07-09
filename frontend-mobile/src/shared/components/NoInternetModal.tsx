import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { WifiOff } from "lucide-react-native";
import NetInfo from "@react-native-community/netinfo";
import colors from "@/theme/colors";

export default function NoInternetModal() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can be null initially, treat it as true to avoid visual flashing
      setIsConnected(state.isConnected !== false);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckAgain = () => {
    setChecking(true);
    NetInfo.refresh().then((state) => {
      setIsConnected(state.isConnected !== false);
      // Give a tiny delay for visual feedback of check
      setTimeout(() => {
        setChecking(false);
      }, 600);
    });
  };

  return (
    <Modal
      visible={!isConnected}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <WifiOff size={32} color={colors.primary} strokeWidth={2} />
          </View>
          
          <Text style={styles.title}>No Internet Connection</Text>
          
          <Text style={styles.description}>
            Please check your network settings and turn on mobile data or Wi-Fi to continue using Nagpur Prime Property.
          </Text>
          
          <TouchableOpacity
            onPress={handleCheckAgain}
            activeOpacity={0.8}
            disabled={checking}
            style={[styles.button, checking && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {checking ? "Checking..." : "Check Again"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
});

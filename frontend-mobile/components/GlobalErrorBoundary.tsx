/**
 * GlobalErrorBoundary
 *
 * Wraps the entire app tree at the root level.
 * Catches any unhandled JavaScript runtime errors (null pointer,
 * third-party library crash, react-native-maps render failure, etc.)
 * and shows a graceful "Something went wrong" fallback instead of
 * silently closing the app to the home screen.
 *
 * Must be a CLASS component — React only supports error boundaries
 * via getDerivedStateFromError / componentDidCatch in class components.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorKey: number; // increment to re-mount child tree on retry
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorKey: 0 };
  }

  // Called synchronously after a descendant throws — used to update state
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  // Called after render — ideal place for Sentry / Crashlytics logging
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error("[GlobalErrorBoundary] Caught error:", error);
      console.error("[GlobalErrorBoundary] Component stack:", info.componentStack);
    }
    // TODO: Sentry.captureException(error, { extra: info })
  }

  handleRetry = () => {
    // Incrementing errorKey forces React to unmount + remount the entire
    // child tree from scratch, clearing all component state and the error.
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorKey: prev.errorKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
    }

    return (
      // Key change forces full remount of child tree on retry
      <React.Fragment key={this.state.errorKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

// ─── Fallback UI ──────────────────────────────────────────────────────────────

function ErrorFallback({
  onRetry,
  error,
}: {
  onRetry: () => void;
  error: Error | null;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4EC" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        {/* Heading */}
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          The app ran into an unexpected error.{"\n"}
          Tap below to try again.
        </Text>

        {/* Dev-only error detail box */}
        {__DEV__ && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>Error (dev only)</Text>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        {/* Retry */}
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4EC",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ef4444",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#991b1b",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#f97316",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});

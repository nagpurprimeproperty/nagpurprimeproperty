/** @type {import('tailwindcss').Config} */
// Keep in sync with theme/colors.ts
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        primaryDark: "#EA580C",
        primaryLight: "#FFF7ED",
        primaryMuted: "#FFEDD5",
        background: "#F8F9FB",
        surface: "#FFFFFF",
        text: "#111827",
        textSecondary: "#475569",
        textMuted: "#6B7280",
        textLight: "#94A3B8",
        muted: "#6B7280",
        border: "#E5E7EB",
        borderLight: "#F1F5F9",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [],
};

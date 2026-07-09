import React from "react";
import ScreenHeader from "@/shared/components/ScreenHeader";

interface BackHeaderProps {
  rightIcon?: React.ReactNode;
}

/**
 * Minimal back row for content-heavy screens (legal, about).
 * Page title lives in the scroll body below.
 */
export default function BackHeader({ rightIcon }: BackHeaderProps) {
  return (
    <ScreenHeader title="" layout="minimal" showBack rightIcon={rightIcon} />
  );
}

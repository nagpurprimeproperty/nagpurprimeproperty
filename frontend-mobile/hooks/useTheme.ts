import colors from "@/theme/colors";
import shadows from "@/theme/shadows";
import spacing from "@/theme/spacing";
import typography from "@/theme/typography";

const THEME = {
  colors,
  shadows,
  spacing,
  typography,
};

export const useTheme = () => {
  return THEME;
};

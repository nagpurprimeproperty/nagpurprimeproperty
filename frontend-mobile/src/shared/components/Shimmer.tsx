import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

// ✅ Correct way
const Shimmer = createShimmerPlaceholder(LinearGradient);

export default Shimmer;
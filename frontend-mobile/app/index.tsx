import { Redirect } from "expo-router";
import "react-native-reanimated";
export default function Index() {
  return <Redirect href="/(onBoarding)/splash" />;
  // return <Redirect href="/(tabs)/home" />;
}
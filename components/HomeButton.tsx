import { Text, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";

function HomeButton({
  onPress,
  children,
  type,
}: {
  onPress: () => void;
  children: React.ReactNode;
  type?: "primary" | "secondary" | "danger";
}) {
  return (
    <Pressable onPress={onPress}>
      <Text style={[Styles.button, type && Styles[type]]}>{children}</Text>
    </Pressable>
  );
}

export default HomeButton;

const Styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    textAlign: "center",
    minWidth: 80,
  },
  primary: {
    borderColor: Colors.primary,
    color: Colors.primary,
  },
  secondary: {
    borderColor: Colors.secondaryGray,
    color: Colors.secondaryGray,
  },
  danger: {
    borderColor: "red",
    color: "red",
  },
});

import { View, StyleSheet, Text, Image } from "react-native";
import { Colors } from "../constants/colors";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  return (
    <LinearGradient
      colors={["#fff", Colors.primary]}
      locations={[0.2, 0.8]}
      style={{ flex: 1 }}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.root}>
        <Image
          style={{
            width: 200,
            height: 200,
            alignSelf: "center",
            marginTop: 50,
          }}
          source={require("../assets/images/Catenate-Logo.png")}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  text: {
    color: Colors.primary,
    fontSize: 20,
  },
});

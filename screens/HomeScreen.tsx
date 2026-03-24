import { Text, View, Image, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import Typography from "../constants/typography";
import HomeButton from "../components/HomeButton";
import Colors from "../constants/colors";

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <View
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../assets/images/user.png")}
        style={styles.profileImage}
        resizeMode="contain"
      />

      <View style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
        <Text style={Typography.title}>Welcome back</Text>
        <Text style={Typography.subtitle}>{user?.firstName ?? "Guest"}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <HomeButton onPress={handleLogout} type="danger">
          Logout
        </HomeButton>
        <HomeButton
          onPress={() => navigation.navigate("EditProfile")}
          type="secondary"
        >
          Edit
        </HomeButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    marginTop: 40,
  },
});

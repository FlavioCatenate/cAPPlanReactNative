import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import Colors from "../constants/colors";
import { login, loggedAccount } from "../services/authService";
import Typography from "../constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function LoginScreen({ navigation }: any) {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Password cannot be empty");
      return;
    }
    try {
      // login and store token in secure storage
      const response = await login(username, password);
      await SecureStore.setItemAsync("auth_token", response.id_token);

      // logged account set into the global auth context
      const loggedAccountRes = await loggedAccount();
      setUser(loggedAccountRes);

      // navigate to home screen
      navigation.replace("Home");
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login Failed",
        "Please check your credentials and try again.",
      );
    }
  }

  return (
    <LinearGradient
      colors={["#fff", Colors.primary]}
      locations={[0.2, 0.8]}
      style={{ flex: 1 }}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 1 }}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <View style={styles.root}>
          {/* Logo and title */}
          <View style={{ marginBottom: 70 }}>
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
            <Text style={[Typography.title, { textAlign: "center" }]}>
              cAPPlan
            </Text>
          </View>

          {/* Form */}
          <View>
            <View
              style={{
                padding: 20,
                alignItems: "center",
              }}
            >
              <Text style={[Typography.subtitle, { marginBottom: 10 }]}>
                Login
              </Text>
              <Text style={Typography.body}>
                Enter your userame and password
              </Text>
            </View>

            {/* Form inputs */}
            <TextInput
              placeholder="username"
              style={styles.formInput}
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              placeholder="password"
              style={styles.formInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <Pressable
              onPress={handleLogin}
              style={[
                styles.formInput,
                {
                  backgroundColor: Colors.secondaryGray,
                  alignItems: "center",
                },
              ]}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Continue
              </Text>
            </Pressable>
          </View>

          {/* Pryvacy */}
          <View
            style={{
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ color: Colors.secondaryGray }}>
              By clicking continue, you agree to our {"\n"}{" "}
              <Text
                style={{ color: "#454545", textDecorationLine: "underline" }}
              >
                Terms of Service{" "}
              </Text>
              and{" "}
              <Text
                style={{ color: "#454545", textDecorationLine: "underline" }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
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
  formInput: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    borderColor: Colors.secondaryGray,
  },
});

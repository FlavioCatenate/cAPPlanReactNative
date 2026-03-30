import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Colors from "../constants/colors";
import Typography from "../constants/typography";
import { useAuth } from "../context/AuthContext";          // ← resta, migrazione graduale
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginThunk, selectAuthStatus, selectAuthError } from "../store/slices/authSlice";

export default function LoginScreen({ navigation }: any) {
  const { setUser } = useAuth();                           // ← resta temporaneamente
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);

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

    const result = await dispatch(loginThunk({ username, password }));

    if (loginThunk.fulfilled.match(result)) {
      setUser(result.payload);                             // ← aggiorna ancora il Context
    } else {
      Alert.alert("Login Failed", authError ?? "Controlla le credenziali e riprova.");
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
          <View style={{ marginBottom: 40 }}>
            <Image
              style={{ width: 200, height: 200, alignSelf: "center", marginTop: 30, marginBottom: 10 }}
              source={require("../assets/images/Catenate-Logo.png")}
              resizeMode="contain"
            />
            <Text style={[Typography.title, { textAlign: "center" }]}>cAPPlan</Text>
          </View>

          <View>
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={[Typography.subtitle, { marginBottom: 10 }]}>Login</Text>
              <Text style={Typography.body}>Enter your username and password</Text>
            </View>

            <TextInput
              placeholder="username"
              style={styles.formInput}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"                        
            />
            <TextInput
              placeholder="password"
              style={styles.formInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Pressable
              onPress={handleLogin}
              disabled={authStatus === 'loading'}          // ← disabilita durante fetch
              style={[
                styles.formInput,
                {
                  backgroundColor: authStatus === 'loading'
                    ? Colors.secondaryGray + '88'
                    : Colors.secondaryGray,
                  alignItems: "center",
                },
              ]}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {authStatus === 'loading' ? 'Loading...' : 'Continue'}
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text style={{ color: Colors.secondaryGray }}>
              By clicking continue, you agree to our{"\n"}{" "}
              <Text style={{ color: "#454545", textDecorationLine: "underline" }}>Terms of Service </Text>
              and{" "}
              <Text style={{ color: "#454545", textDecorationLine: "underline" }}>Privacy Policy</Text>
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
    width: "80%",
    alignSelf: "center",
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
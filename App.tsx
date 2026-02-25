import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // AuthProvider handle the global authentication state
    <AuthProvider>
      {/* SafeAreaProvider provide the context for safe area (notch, bottom bar ecc...) */}
      <SafeAreaProvider>
        {/* SafeAreaView protect content from unsafe areas like notch, bottom bar ecc... */}
        <SafeAreaView style={{ flex: 1 }}>
          {/* NavigationContiner initialize the navigation system */}
          <NavigationContainer>
            {/* Stack.Navigator define nvaigation structure */}
            <Stack.Navigator>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Capacity Planning",
                }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Edit Profile",
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

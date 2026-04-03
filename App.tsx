import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import SplashScreen from "./screens/SplashScreen";
import AllocationPlanningScreen from "./screens/AllocationPlanning/AllocationPlanningScreen";
import AllocationDetailScreen from "./screens/AllocationPlanning/AllocationDetailScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { Provider } from "react-redux";
import { useAuth } from "./context/AuthContext";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "./constants/colors";
import { store } from "./store";
import AddAllocationScreen from "./screens/AllocationPlanning/addAllocationScreen";
import EditAllocationScreen from "./screens/AllocationPlanning/editAllocationScreen";
import EmployeeListScreen from "./screens/Employees/EmployeeListScreen";
import EmployeeDetailScreen from "./screens/Employees/EmployeeDetailScreen";
import AddEmployeeScreen from "./screens/Employees/addEmployeeScreen";
import EditEmployeeScreen from "./screens/Employees/editEmployeeScreen";
import SkillListScreen from "./screens/Skills/SkillListScreen";
import SkillDetailScreen from "./screens/Skills/SkillDetailScreen";
import AddSkillScreen from "./screens/Skills/addSkillScreen";
import EditSkillScreen from "./screens/Skills/editSkillScreen";
import CalendarScreen from "./screens/Calendar/Calendarscreen";
import EmployeeMonthScreen from "./screens/Calendar/EmployeeMonthScreen";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const AllocationStack = createNativeStackNavigator();
const EmployeeStack = createNativeStackNavigator();
const SkillStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerContent({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.closeDrawer();
  };

  return (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderTitle}>Menu</Text>
        <Text style={styles.drawerUserName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.drawerUserEmail}>{user?.email}</Text>
      </View>

      <View style={styles.drawerItems}>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            navigation.navigate("Home");
            navigation.closeDrawer();
          }}
        >
          <Text style={styles.drawerItemText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            navigation.navigate("AllocationStack");
            navigation.closeDrawer();
          }}
        >
          <Text style={styles.drawerItemText}>Allocation Planning</Text>
        </TouchableOpacity>

          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              navigation.navigate("EmployeeStack");
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.drawerItemText}>Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              navigation.navigate("SkillStack");
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.drawerItemText}>Skills</Text>
          </TouchableOpacity>

        <View style={styles.drawerDivider} />

        <TouchableOpacity
          style={styles.drawerItemLogout}
          onPress={handleLogout}
        >
          <Text style={styles.drawerItemLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AllocationStackNavigator() {
  return (
    <AllocationStack.Navigator>
      <AllocationStack.Screen
        name="AllocationPlanning"
        component={AllocationPlanningScreen}
        options={{ headerShown: false }}
      />
      <AllocationStack.Screen
        name="AddAllocation"
        component={AddAllocationScreen}
        options={{
          headerShown: false,
          headerTitle: "Nuova Allocation",
          headerBackTitle: "Indietro",
        }}
      />
      <AllocationStack.Screen
        name="EditAllocation"
        component={EditAllocationScreen}
        options={{
          headerShown: false,
          headerTitle: "Modifica Allocation",
          headerBackTitle: "Indietro",
        }}
      />
      <AllocationStack.Screen
        name="AllocationDetail"
        component={AllocationDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <AllocationStack.Screen
        name="EmployeeMonth"
        component={EmployeeMonthScreen}
        options={{
          headerShown: true,
          headerTitle: "Calendario Mensile",
          headerBackTitle: "Indietro",
        }}
      />
      <AllocationStack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={({ route }: any) => ({
          title: route.params?.employeeName ?? "Dettaglio",
        })}
      />
    </AllocationStack.Navigator>
  );
}

function EmployeeStackNavigator() {
  return (
    <EmployeeStack.Navigator>
      <EmployeeStack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        options={{ headerShown: false }}
      />
      <EmployeeStack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{ headerShown: false }}
      />
      <EmployeeStack.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={{ headerShown: false }}
      />
      <EmployeeStack.Screen
        name="EditEmployee"
        component={EditEmployeeScreen}
        options={{ headerShown: false }}
      />
    </EmployeeStack.Navigator>
  );
}

function SkillStackNavigator() {
  return (
    <SkillStack.Navigator>
      <SkillStack.Screen
        name="SkillList"
        component={SkillListScreen}
        options={{ headerShown: false }}
      />
      <SkillStack.Screen
        name="SkillDetail"
        component={SkillDetailScreen}
        options={{ headerShown: false }}
      />
      <SkillStack.Screen
        name="AddSkill"
        component={AddSkillScreen}
        options={{ headerShown: false }}
      />
      <SkillStack.Screen
        name="EditSkill"
        component={EditSkillScreen}
        options={{ headerShown: false }}
      />
    </SkillStack.Navigator>
  );
}


function AppNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation }: any) => ({
        headerShown: true,
        headerTitle: "Capacity Planning",
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Text style={{ fontSize: 24 }}>☰</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <Ionicons name="calendar" size={24} style={{ marginRight: 15 }} color="black" />
          </TouchableOpacity>
        ),
      })}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: "Capacity Planning",
        }}
      />
      <Drawer.Screen
        name="AllocationStack"
        component={AllocationStackNavigator}
        options={{
          headerTitle: "Allocation Planning",
          drawerLabel: "Allocation Planning",
        }}
      />
      <Drawer.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          headerTitle: "Calendar",
          drawerLabel: "Calendar",
        }}
      />
      <Drawer.Screen
        name="EmployeeStack"
        component={EmployeeStackNavigator}
        options={{
          headerTitle: "Employees",
          drawerLabel: "Employees",
        }}
      />
      <Drawer.Screen
        name="SkillStack"
        component={SkillStackNavigator}
        options={{
          headerTitle: "Skills",
          drawerLabel: "Skills",
        }}
      />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator>
      {!isLoggedIn ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="MainApp"
          component={AppNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  drawerHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 15,
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  drawerUserEmail: {
    fontSize: 12,
    color: "#999",
  },
  drawerItems: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  drawerItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  drawerDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  drawerItemLogout: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    marginTop: 10,
  },
  drawerItemLogoutText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "600",
  },
});

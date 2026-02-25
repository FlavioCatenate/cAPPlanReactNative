import { createContext, useContext, useState } from "react";
import * as SecureStore from "expo-secure-store";

export interface User {
  activated: boolean;
  authorities: string[];
  createdBy: string;
  createdDate: string | null;
  email: string;
  firstName: string;
  id: number;
  imageUrl: string;
  langKey: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  lastName: string;
  login: string;
}

// interface to define the shape of the AuthContext value - what data and functions it will provide
// it's accessible from any component that uses the context via the useAuth() hook
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

//creation of the context whit default value null, the value will be provided by the AuthProvider component
const AuthContext = createContext<AuthContextType | null>(null);

// This component will manage the authentication state and provide it to all its. children via the authcontext.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Boolean value if the user is logged in or not
  let isLoggedIn = user !== null;

  // logout function delete the current user and set it to null
  const logout = () => {
    SecureStore.deleteItemAsync("auth_token");
    isLoggedIn = false;
    setUser(null);
  };

  // this obeject contains all the data and functions that we want to provide to the comoponents
  const value: AuthContextType = {
    user,
    setUser,
    logout,
    isLoggedIn: user !== null,
  };

  // return the provider component with the valie and all the children that will have access to the context
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// this hook is used for accessing the auth context from any component, it will return the value of the context (user, setUser, logout, isLoggedIn)
export function useAuth() {
  const ctx = useContext(AuthContext);

  // if the contxt is null throw an error
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");

  return ctx;
}

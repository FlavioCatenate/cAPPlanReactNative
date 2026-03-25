import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Create an axios instance with a base URL and default headers
const api = axios.create({
  baseURL: "http://10.0.2.2:9074",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token in headers
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getEmployeeProjects() {
  const res = await api.get("/api/employee-projects?eagerload=true&sort=id,asc");
  return res.data;
}

export default api;

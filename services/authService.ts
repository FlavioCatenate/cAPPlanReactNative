import api from "./api";

export async function login(username: string, password: string) {
  try {
    const res = await api.post("/api/authenticate", {
      username,
      password,
    });
    return res.data;
  } catch (e: any) {
    console.error("Login error:", e);
    throw new Error("Login failed");
  }
}

export async function loggedAccount() {
  try {
    const res = await api.get("/api/account");
    return res.data;
  } catch (e) {
    throw new Error("Failed to fetch logged account");
  }
}

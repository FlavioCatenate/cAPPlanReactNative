import axios from "axios";
import api from "./api";

export async function login(username: string, password: string) {
  try {
    const res = await api.post("/api/authenticate", {
      username,
      password,
    });
    return res.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      console.error("Login error:", {
        status,
        code: e.code,
        message: e.message,
      });

      if (status === 401) throw new Error("INVALID_CREDENTIALS");
      if (e.code === "ECONNABORTED") throw new Error("LOGIN_TIMEOUT");
      if (status) throw new Error(`LOGIN_HTTP_${status}`);
      throw new Error("LOGIN_NETWORK");
    }

    console.error("Login error:", e);
    throw new Error("LOGIN_UNKNOWN");
  }
}

export async function loggedAccount() {
  try {
    const res = await api.get("/api/account");
    return res.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      const res = await api.get("/api/account");
      console.log("loggedAccount response:", res.status, res.data);

      if (status === 401) throw new Error("ACCOUNT_UNAUTHORIZED");
      if (e.code === "ECONNABORTED") throw new Error("ACCOUNT_TIMEOUT");
      if (status) throw new Error(`ACCOUNT_HTTP_${status}`);
      throw new Error("ACCOUNT_NETWORK");
    }

    throw new Error("ACCOUNT_UNKNOWN");
  }
}

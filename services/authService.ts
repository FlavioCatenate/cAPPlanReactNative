import api from "./api";

export async function login(username: string, password: string) {
  const res = await api.post("/api/authenticate", {
    username,
    password,
  });
  return res.data;
}

export async function loggedAccount() {
  const res = await api.get("/api/account");
  return res.data;
}

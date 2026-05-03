import { createContext, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, password) {
    const res = await api.post("/user-login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refresh", res.data.refreshToken);
    setUser(res.data.user);
  }

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}
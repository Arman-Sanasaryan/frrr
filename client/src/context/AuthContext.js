import { createContext, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("userEmail");
    return email ? { email } : null;
  });

  async function register(email, password) {
    await api.post("/register", { email, password });
  }

  async function login(email, password) {
    const res = await api.post("/user-login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refresh", res.data.refreshToken);
    localStorage.setItem("userEmail", res.data.user?.email || email);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("userEmail");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
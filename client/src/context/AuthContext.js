import { createContext, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function readStoredUser() {
  const email = localStorage.getItem("userEmail");
  if (!email) {
    return null;
  }
  return {
    email,
    name: localStorage.getItem("userName") || "",
    avatarUrl: localStorage.getItem("userAvatar") || ""
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  function persistSession(sessionUser, token, refreshToken) {
    localStorage.setItem("token", token);
    localStorage.setItem("refresh", refreshToken);
    localStorage.setItem("userEmail", sessionUser.email);
    localStorage.setItem("userName", sessionUser.name || "");
    localStorage.setItem("userAvatar", sessionUser.avatarUrl || "");
    setUser(sessionUser);
  }

  function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
    setUser(null);
  }

  async function register(email, password, name) {
    await api.post("/register", { email, password, name });
  }

  async function login(email, password) {
    const res = await api.post("/user-login", { email, password });
    persistSession(res.data.user, res.data.token, res.data.refreshToken);
  }

  function completeOAuthLogin({ token, refreshToken, email, name, avatarUrl }) {
    persistSession(
      { email, name: name || "", avatarUrl: avatarUrl || "" },
      token,
      refreshToken
    );
  }

  function startGoogleLogin() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  function logout() {
    clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        completeOAuthLogin,
        startGoogleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

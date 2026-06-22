import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

export const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(emailOrData, password) {
    if (emailOrData && typeof emailOrData === "object" && emailOrData.token) {
      localStorage.setItem("token", emailOrData.token);
      setUser(emailOrData.user);
      return emailOrData.user;
    }
    const data = await api.post("/auth/login", { email: emailOrData, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(nameOrData, email, password) {
    if (nameOrData && typeof nameOrData === "object" && nameOrData.token) {
      localStorage.setItem("token", nameOrData.token);
      setUser(nameOrData.user);
      return nameOrData.user;
    }
    const data = await api.post("/auth/register", { name: nameOrData, email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContextProvider as AuthProvider };

export function useAuth() {
  return useContext(AuthContext);
}

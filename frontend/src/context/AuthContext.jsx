import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", formData);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", formData);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updatePreferences = async (prefs) => {
    try {
      const { data } = await API.put("/auth/preferences", prefs);
      // The backend response doesn't include the token, so we merge it from the current session
      const updatedUser = { ...data, token: user?.token };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update preferences",
      };
    }
  };

  useEffect(() => {
    if (user?.token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [user]);

  // Proactive Backend Wakeup (For Free-Tier Render Services)
  useEffect(() => {
    const wakeupUrl = (API.defaults.baseURL || "http://localhost:5000/api").replace("/api", "/");
    fetch(wakeupUrl).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
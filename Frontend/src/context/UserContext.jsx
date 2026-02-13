import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // Initial Mock Data Structure (for UI compatibility)
  const defaultStats = {
    total: 0,
    resolved: 0,
    pending: 0,
  };

  // Load from localStorage
  // Load from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("wayanad_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Ensure stats exist (backwards compatibility for buggy saves)
      if (!parsed.stats) {
        return { ...parsed, stats: defaultStats };
      }
      return parsed;
    }
    return null;
  });

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("wayanad_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("wayanad_user");
    }
  }, [user]);

  const login = (userData) => {
    // Merge with default structure if needed, or just use userData
    // We'll ensure userData includes the token from backend
    setUser({
      ...userData,
      stats: userData.stats || defaultStats, // Add default stats if missing from backend
      location: "Wayanad", // Default location
      avatar: null,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wayanad_user");
  };

  const updateProfile = async (updates) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put("http://localhost:5000/api/auth/profile", updates, config);
      setUser(prev => {
        const updatedUser = { ...prev, ...data };
        localStorage.setItem("wayanad_user", JSON.stringify(updatedUser));
        return updatedUser;
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed"
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(
        "http://localhost:5000/api/auth/update-password",
        { currentPassword, newPassword },
        config
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password update failed"
      };
    }
  };

  const refreshUser = async () => {
    try {
      if (!user?.token) return { success: false };

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/auth/me", config);

      setUser(prev => {
        // config.stats will come from backend now
        const updatedUser = { ...prev, ...data };
        localStorage.setItem("wayanad_user", JSON.stringify(updatedUser));
        return updatedUser;
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to refresh user stats:", error);
      return { success: false };
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile, changePassword, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

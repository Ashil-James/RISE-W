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
    // 1. Try "wayanad_user" (UserContext specific)
    const savedUser = localStorage.getItem("wayanad_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (!parsed.stats) {
        return { ...parsed, stats: defaultStats };
      }
      return parsed;
    }

    // 2. Fallback: Try "user" (AuthContext / Old Logic)
    const authUser = localStorage.getItem("user");
    if (authUser) {
      const parsed = JSON.parse(authUser);
      return {
        ...parsed,
        stats: defaultStats,
        location: parsed.location || "Wayanad",
        avatar: parsed.avatar || null
      };
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
    // Check if userData has a 'user' property (common in some backends)
    const userDetails = userData.user || userData;
    // Token usually at top level
    const token = userData.token || userDetails.token;

    const dataToSave = {
      ...userDetails,
      token: token, // Ensure token is accessible
      name: userDetails.name || (userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName}` : "User"),
      phoneNumber: userDetails.phoneNumber || userDetails.phone || "",
      stats: userDetails.stats || defaultStats,
      location: userDetails.location || "Wayanad",
      avatar: userDetails.avatar || null,
    };

    setUser(dataToSave);
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

      // Map 'phone' to 'phoneNumber' if present in updates for backend compatibility
      const dataToSend = { ...updates };
      if (dataToSend.phone) {
        dataToSend.phoneNumber = dataToSend.phone;
        delete dataToSend.phone;
      }

      const { data } = await axios.put("http://localhost:5000/api/auth/profile", dataToSend, config);
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

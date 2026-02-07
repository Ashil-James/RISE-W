import React, { createContext, useContext, useState, useEffect } from "react";

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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("wayanad_user");
    return savedUser ? JSON.parse(savedUser) : null;
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
      stats: defaultStats, // Add default stats if missing from backend
      location: "Wayanad", // Default location
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wayanad_user");
  };

  const updateProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

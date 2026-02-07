import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
<<<<<<< HEAD
    // Initial Mock Data
    const defaultUser = {
        name: "Felix The Cat",
        email: "felix@wayanadconnect.com",
        phone: "+91 98765 43210",
        location: "Kalpetta, Wayanad",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        stats: {
            total: 12,
            resolved: 8,
            pending: 4
        }
    };

    // Load from localStorage or use default
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("wayanad_user");
        return savedUser ? JSON.parse(savedUser) : defaultUser;
=======
    // Initial Mock Data Structure (for UI compatibility)
    const defaultStats = {
        total: 0,
        resolved: 0,
        pending: 0
    };

    // Load from localStorage
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("wayanad_user");
        return savedUser ? JSON.parse(savedUser) : null;
>>>>>>> a44f1fb674b30254a424a840f7b1af31d7aa4c1a
    });

    // Save to localStorage whenever user changes
    useEffect(() => {
<<<<<<< HEAD
        localStorage.setItem("wayanad_user", JSON.stringify(user));
    }, [user]);

    const login = (email) => {
        console.log("Logging in...", email);
        // In a real app, this would fetch user data from backend
        // For now, we just keep the current mock user or reset to default
        setUser(defaultUser);
    };

    const logout = () => {
        console.log("Logging out...");
        // Clear user data or set to null? 
        // For specific requirement "logout option", we'll simulate clearing session
        localStorage.removeItem("wayanad_user");
        // We might want to keep the user object for the login page demo, 
        // or set it to null to force a redirect.
        // For this UI demo, let's keep the user object but maybe reset it to default
        // or handle "isAuthenticated" state separately.
        // Keeping it simple: Logout just navigates away in the UI components, 
        // but here we can reset to default if we want "fresh" session next time.
=======
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
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("wayanad_user");
>>>>>>> a44f1fb674b30254a424a840f7b1af31d7aa4c1a
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

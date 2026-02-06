import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
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
    });

    // Save to localStorage whenever user changes
    useEffect(() => {
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

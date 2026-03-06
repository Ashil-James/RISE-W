import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useUser();

    const fetchAlerts = async () => {
        try {
            const { data: response } = await axios.get('/api/v1/broadcasts');
            const broadcasts = response.data;
            // Map backend broadcasts to frontend alerts structure
            const mappedAlerts = broadcasts.map(b => ({
                id: b._id,
                type: b.severity === 'High' ? 'critical' : b.severity === 'Medium' ? 'warning' : 'info',
                title: b.type,
                message: b.message,
                location: b.location,
                time: b.createdAt,
                icon: b.severity === 'High' ? 'AlertTriangle' : b.severity === 'Medium' ? 'Zap' : 'Info',
                isAuthority: b.isAuthority,
            }));
            setAlerts(mappedAlerts);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const addAlert = async (alertData) => {
        try {
            if (!user?.token) {
                throw new Error("User not authenticated");
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Map frontend Alert fields to Backend Broadcast fields
            // The broadcast model's `type` requires specific enum values
            // The user's title goes into the message since `type` is an enum
            const dataToPost = {
                type: 'SAFETY_ALERT', // Default enum value; can be extended with a selector
                severity: alertData.type === 'critical' ? 'High' : alertData.type === 'warning' ? 'Medium' : 'Low',
                location: alertData.location || 'Unknown',
                message: alertData.title + (alertData.message ? ': ' + alertData.message : ''),
            };

            await axios.post('/api/v1/broadcasts', dataToPost, config);
            await fetchAlerts();
        } catch (error) {
            console.error("Failed to post alert:", error);
            if (error.response?.status === 401 && logout) {
                logout();
            }
            throw error;
        }
    };

    return (
        <AlertContext.Provider value={{ alerts, addAlert, loading, refreshAlerts: fetchAlerts }}>
            {children}
        </AlertContext.Provider>
    );
};

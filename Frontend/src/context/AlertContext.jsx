import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const { data } = await axios.get('/api/v1/broadcasts');
            // Map backend broadcasts to frontend alerts structure
            const mappedAlerts = data.map(b => ({
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
            const user = JSON.parse(localStorage.getItem('user'));
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Map frontend Alert fields to Backend Broadcast fields
            const dataToPost = {
                type: alertData.title,
                severity: alertData.type === 'critical' ? 'High' : alertData.type === 'warning' ? 'Medium' : 'Low',
                location: alertData.location,
                message: alertData.message
            };

            await axios.post('/api/v1/broadcasts', dataToPost, config);
            await fetchAlerts();
        } catch (error) {
            console.error("Failed to post alert:", error);
            throw error;
        }
    };

    return (
        <AlertContext.Provider value={{ alerts, addAlert, loading, refreshAlerts: fetchAlerts }}>
            {children}
        </AlertContext.Provider>
    );
};

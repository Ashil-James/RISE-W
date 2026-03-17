import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./UserContext";
import {
  ALERT_CACHE_KEY,
  ALERT_CACHE_VERSION,
  isValidCachedAlert,
  mapBroadcastToAlert,
  severityToneToLevel,
  sortAlertsByNewest,
} from "../utils/alertTracking";

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

const readCachedAlerts = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALERT_CACHE_KEY) || "null");
    if (!parsed || parsed.version !== ALERT_CACHE_VERSION || !Array.isArray(parsed.items)) {
      localStorage.removeItem(ALERT_CACHE_KEY);
      return [];
    }

    return parsed.items.filter(isValidCachedAlert);
  } catch {
    localStorage.removeItem(ALERT_CACHE_KEY);
    return [];
  }
};

const writeCachedAlerts = (items) => {
  localStorage.setItem(
    ALERT_CACHE_KEY,
    JSON.stringify({
      version: ALERT_CACHE_VERSION,
      items,
    }),
  );
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState(readCachedAlerts);
  const [loading, setLoading] = useState(readCachedAlerts().length === 0);
  const { user, logout } = useUser();

  const fetchAlerts = useCallback(async () => {
    try {
      const config = user?.token
        ? {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        : {};

      const { data: response } = await axios.get("/api/v1/broadcasts", config);
      const broadcasts = response.data || [];
      const mappedAlerts = sortAlertsByNewest(broadcasts.map(mapBroadcastToAlert));

      setAlerts(mappedAlerts);
      writeCachedAlerts(mappedAlerts);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      if (error.response?.status === 401 && logout) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout, user?.token]);

  useEffect(() => {
    setLoading(alerts.length === 0);
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = useCallback(
    async (alertData) => {
      try {
        if (!user?.token) {
          throw new Error("User not authenticated");
        }

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const payload = {
          title: alertData.title,
          type: alertData.category || alertData.type || "SAFETY_ALERT",
          severity: alertData.severity || severityToneToLevel(alertData.type),
          location: alertData.location || "Township Area",
          message: alertData.message,
        };

        const { data: response } = await axios.post("/api/v1/broadcasts", payload, config);
        const createdAlert = response?.data ? mapBroadcastToAlert(response.data) : null;

        if (createdAlert) {
          setAlerts((previousAlerts) => {
            const nextAlerts = sortAlertsByNewest([
              createdAlert,
              ...previousAlerts.filter((alert) => alert.id !== createdAlert.id),
            ]);
            writeCachedAlerts(nextAlerts);
            return nextAlerts;
          });
        } else {
          await fetchAlerts();
        }

        return { success: true, data: createdAlert };
      } catch (error) {
        console.error("Failed to post alert:", error);
        if (error.response?.status === 401 && logout) {
          logout();
        }
        throw error;
      }
    },
    [fetchAlerts, logout, user?.token],
  );

  return (
    <AlertContext.Provider value={{ alerts, addAlert, loading, refreshAlerts: fetchAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

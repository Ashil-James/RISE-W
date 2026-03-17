import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

const DEFAULT_POLL_INTERVAL = 20000;
const DEFAULT_INITIAL_TOAST_LIMIT = 2;

const normalizeNotification = (notification) => ({
    id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    createdAt: notification.createdAt,
    unread: !notification.userReadStatus,
});

export const useNotificationFeed = ({
    token,
    pollInterval = DEFAULT_POLL_INTERVAL,
    initialToastLimit = DEFAULT_INITIAL_TOAST_LIMIT,
    welcomeToast = null,
} = {}) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const knownNotificationIdsRef = useRef(new Set());
    const activeToastIdsRef = useRef(new Set());
    const initializedRef = useRef(false);

    const dismissToast = useCallback((notificationId) => {
        activeToastIdsRef.current.delete(notificationId);
        setToasts((prev) => prev.filter((toast) => toast.id !== notificationId));
    }, []);

    const queueToastNotifications = useCallback((items) => {
        const freshItems = items.filter((item) => !activeToastIdsRef.current.has(item.id));

        if (!freshItems.length) {
            return;
        }

        freshItems.forEach((item) => activeToastIdsRef.current.add(item.id));

        setToasts((prev) => [...freshItems, ...prev].slice(0, 4));

        freshItems.forEach((item, index) => {
            window.setTimeout(() => {
                dismissToast(item.id);
            }, 5200 + index * 450);
        });
    }, [dismissToast]);

    const fetchNotifications = useCallback(async ({ showLoading = false } = {}) => {
        if (!token) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {
            if (showLoading) {
                setLoading(true);
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get("/api/v1/notifications", config);

            if (!data.success) {
                return;
            }

            const mapped = (data.data || []).map(normalizeNotification);
            const unreadNotifications = mapped.filter((notification) => notification.unread);

            if (!initializedRef.current) {
                if (unreadNotifications.length > 0) {
                    queueToastNotifications(unreadNotifications.slice(0, initialToastLimit));
                } else if (welcomeToast) {
                    queueToastNotifications([{
                        id: welcomeToast.id || `welcome-${Date.now()}`,
                        title: welcomeToast.title,
                        message: welcomeToast.message,
                        type: welcomeToast.type || "SYSTEM",
                        createdAt: new Date().toISOString(),
                        unread: false,
                    }]);
                }
                initializedRef.current = true;
            } else {
                const newUnreadNotifications = unreadNotifications.filter(
                    (notification) => !knownNotificationIdsRef.current.has(notification.id)
                );
                queueToastNotifications(newUnreadNotifications);
            }

            knownNotificationIdsRef.current = new Set(mapped.map((notification) => notification.id));
            setNotifications(mapped);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [initialToastLimit, queueToastNotifications, token, welcomeToast]);

    useEffect(() => {
        setNotifications([]);
        setToasts([]);
        setLoading(false);
        knownNotificationIdsRef.current = new Set();
        activeToastIdsRef.current = new Set();
        initializedRef.current = false;

        if (!token) {
            return undefined;
        }

        fetchNotifications({ showLoading: true });
        const intervalId = window.setInterval(() => {
            fetchNotifications();
        }, pollInterval);

        return () => window.clearInterval(intervalId);
    }, [fetchNotifications, pollInterval, token]);

    const markAsRead = useCallback(async (notificationId) => {
        if (!token) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.patch(`/api/v1/notifications/${notificationId}/read`, {}, config);
            dismissToast(notificationId);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, unread: false }
                        : notification
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, [dismissToast, token]);

    const markAllAsRead = useCallback(async () => {
        if (!token) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post("/api/v1/notifications/mark-all-read", {}, config);
            activeToastIdsRef.current = new Set();
            setToasts([]);
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, unread: false }))
            );
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    }, [token]);

    return {
        notifications,
        loading,
        toasts,
        unreadCount: notifications.filter((notification) => notification.unread).length,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissToast,
    };
};

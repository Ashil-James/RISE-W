import React, { useState, useEffect, useRef, useMemo } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import NotificationToastStack from "./NotificationToastStack";

const NotificationsDropdown = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const welcomeToast = useMemo(() => ({
        id: "user-portal-welcome",
        title: "Notifications Active",
        message: "You will see quick popups here when broadcasts or incident updates arrive.",
    }), []);
    const {
        notifications,
        loading,
        toasts,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        dismissToast,
    } = useNotificationFeed({
        token: user?.token,
        welcomeToast,
    });

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!isOpen) {
            refreshNotifications();
        }
        setIsOpen(!isOpen);
    };

    const getIcon = (type) => {
        switch (type) {
            case "INCIDENT_UPDATE": return <CheckCircle size={16} className="text-emerald-500" />;
            case "BROADCAST": return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <NotificationToastStack toasts={toasts} onDismiss={dismissToast} />

            {/* Bell Icon & Badge */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-full text-wayanad-muted hover:text-wayanad-text hover:bg-white/[0.05] transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl z-50"
                        style={{
                            background: "#0c1117",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            isolation: "isolate",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                        }}
                    >
                        <div className="p-4 border-b border-white/[0.05] flex justify-between items-center">
                            <h3 className="font-bold text-wayanad-text flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center text-wayanad-muted text-sm flex flex-col items-center justify-center">
                                     <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                                     Loading notifications...
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-white/[0.03]">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 transition-colors hover:bg-white/[0.02] flex gap-3 ${
                                                notif.unread ? "bg-white/[0.03]" : ""
                                            }`}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm mb-1 ${notif.unread ? "font-bold text-wayanad-text" : "text-wayanad-text/80"}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-wayanad-muted line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-wayanad-muted/60 mt-2 font-mono">
                                                    {new Date(notif.createdAt).toLocaleString(undefined, {
                                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                            {notif.unread && (
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="flex-shrink-0 p-1 rounded-full text-emerald-500 hover:bg-emerald-500/10 transition-colors h-fit"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center flex flex-col items-center">
                                    <Bell size={32} className="text-wayanad-muted/30 mb-3" />
                                    <p className="text-wayanad-muted text-sm">No notifications yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsDropdown;

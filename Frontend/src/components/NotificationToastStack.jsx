import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle, Info, X } from "lucide-react";

const TYPE_STYLES = {
    INCIDENT_UPDATE: {
        color: "#10b981",
        border: "rgba(16,185,129,0.26)",
        glow: "rgba(16,185,129,0.22)",
        icon: CheckCircle,
    },
    BROADCAST: {
        color: "#ef4444",
        border: "rgba(239,68,68,0.26)",
        glow: "rgba(239,68,68,0.22)",
        icon: AlertTriangle,
    },
    NEW_INCIDENT: {
        color: "#f59e0b",
        border: "rgba(245,158,11,0.26)",
        glow: "rgba(245,158,11,0.22)",
        icon: Bell,
    },
    SYSTEM: {
        color: "#38bdf8",
        border: "rgba(56,189,248,0.26)",
        glow: "rgba(56,189,248,0.22)",
        icon: Info,
    },
};

const formatToastTime = (createdAt) => {
    if (!createdAt) {
        return "Just now";
    }

    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) {
        return "Just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours} hr ago`;
    }

    return `${Math.floor(diffHours / 24)} d ago`;
};

const NotificationToastStack = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-20 right-4 z-[80] w-[min(24rem,calc(100vw-2rem))] space-y-3 pointer-events-none md:right-6">
            <AnimatePresence initial={false}>
                {toasts.map((toast) => {
                    const style = TYPE_STYLES[toast.type] || TYPE_STYLES.SYSTEM;
                    const Icon = style.icon;

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.94 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 260, damping: 24 }}
                            className="pointer-events-auto relative overflow-hidden rounded-2xl p-4"
                            style={{
                                background: "rgba(7, 12, 20, 0.94)",
                                border: `1px solid ${style.border}`,
                                boxShadow: `0 18px 45px -18px ${style.glow}, 0 12px 40px rgba(0,0,0,0.45)`,
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                            }}
                        >
                            <div
                                className="absolute inset-y-0 left-0 w-1.5"
                                style={{ background: style.color }}
                            />

                            <div className="flex items-start gap-3">
                                <div
                                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        background: `${style.color}1A`,
                                        border: `1px solid ${style.border}`,
                                        color: style.color,
                                    }}
                                >
                                    <Icon size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-white">
                                                {toast.title}
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-gray-300 line-clamp-3">
                                                {toast.message}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onDismiss(toast.id)}
                                            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
                                            aria-label="Dismiss notification"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                                        {formatToastTime(toast.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default NotificationToastStack;

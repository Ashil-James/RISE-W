import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    Droplets,
    TableProperties,
    Bell,
    User,
    ChevronDown,
    Settings,
    HelpCircle,
    Zap,
    Construction,
    BarChart3,
    Megaphone
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const AuthorityLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user: authUser } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Fetch water incidents for notifications
                const token = authUser?.token || localStorage.getItem("token") || (authUser && authUser.accessToken ? authUser.accessToken : null);
                if (!token) return;

                const res = await fetch("/api/v1/authority/water/incidents", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        // Take the 5 most recent incidents
                        const recent = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

                        const mapped = recent.map(inc => {
                            const now = new Date();
                            const then = new Date(inc.createdAt);
                            const diffMins = Math.floor((now - then) / 60000);
                            let timeStr = `${diffMins} min ago`;
                            if (diffMins > 60) {
                                const hrs = Math.floor(diffMins / 60);
                                timeStr = `${hrs} hr ago`;
                                if (hrs > 24) timeStr = `${Math.floor(hrs / 24)} d ago`;
                            }

                            let title = "Complaint Updated";
                            if (inc.status === "OPEN") { title = "New Complaint Received"; }
                            else if (inc.status === "IN_PROGRESS" || inc.status === "ACCEPTED") { title = "Complaint In Progress"; }
                            else if (inc.status === "RESOLVED" || inc.status === "CLOSED") { title = "Complaint Resolved"; }

                            return {
                                id: inc._id,
                                title: title,
                                message: `${inc.title || inc.category} reported at ${inc.address ? inc.address.split(',')[0] : "Unknown"}`,
                                time: timeStr,
                                type: inc.urgencyScore >= 75 ? "urgent" : "new",
                                unread: inc.status === "OPEN" || inc.urgencyScore >= 75
                            };
                        });
                        setNotifications(mapped);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
    }, [authUser]);


    const unreadCount = notifications.filter(n => n.unread).length;

    const isPower = location.pathname.includes("/power") || authUser?.role === "power_authority";
    const isRoad = location.pathname.includes("/road") || authUser?.role === "road_authority";

    // Theme Configuration
    let theme;
    if (isPower) {
        theme = {
            name: "Power Authority",
            short: "Power",
            accent: "amber",
            icon: Zap,
            primaryColor: "#F59E0B",
            accentText: "text-amber-400",
            accentBg: "bg-amber-500/10",
            accentBorder: "border-amber-500/20",
            accentGlow: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
            activePill: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
            iconGlow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
        };
    } else if (isRoad) {
        theme = {
            name: "Road Infrastructure Authority",
            short: "Road",
            accent: "orange",
            icon: Construction,
            primaryColor: "#F97316",
            accentText: "text-orange-400",
            accentBg: "bg-orange-500/10",
            accentBorder: "border-orange-500/20",
            accentGlow: "shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]",
            activePill: "bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)]",
            iconGlow: "drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
        };
    } else {
        theme = {
            name: "Water Authority",
            short: "Water",
            accent: "sky",
            icon: Droplets,
            primaryColor: "#0EA5E9",
            accentText: "text-sky-400",
            accentBg: "bg-sky-500/10",
            accentBorder: "border-sky-500/20",
            accentGlow: "shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]",
            activePill: "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]",
            iconGlow: "drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
        };
    }

    // Close dropdowns on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest("#profile-dropdown-trigger")) {
                setIsProfileOpen(false);
            }
            if (isNotificationsOpen && !event.target.closest("#notifications-dropdown-trigger")) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileOpen, isNotificationsOpen]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname.includes(to);

        return (
            <li>
                <Link
                    to={to}
                    className={`
            relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group overflow-hidden
            ${isActive
                            ? `${theme.accentBg} ${theme.accentText} font-bold border ${theme.accentBorder} ${theme.accentGlow}`
                            : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                        }
          `}
                >
                    {isActive && (
                        <motion.div
                            layoutId="active-pill"
                            className={`absolute left-0 top-2 bottom-2 w-1.5 ${theme.activePill} rounded-r-full`}
                        />
                    )}
                    <Icon
                        size={22}
                        className={`z-10 transition-all duration-300 ${isActive
                            ? `${theme.accentText} ${theme.iconGlow}`
                            : `group-hover:text-${theme.accent}-300`
                            }`}
                    />
                    <span className="z-10 text-sm tracking-wide">{label}</span>
                </Link>
            </li>
        );
    };

    return (
        <div className={`flex min-h-screen bg-[#020617] text-white font-sans selection:bg-${theme.accent}-500/30 overflow-hidden relative`}>
            {/* BACKGROUND ELEMENTS */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className={`absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-${theme.accent}-600/10 rounded-full blur-[150px] animate-blob`}></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[130px] animate-blob delay-200"></div>
                <div className={`absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-${theme.accent}-400/5 rounded-full blur-[100px] animate-pulse-slow`}></div>
                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>
            </div>

            {/* MOBILE TOGGLE */}
            <button
                className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-neutral-900/80 backdrop-blur-md rounded-xl border border-white/10"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* SIDEBAR */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="w-72 bg-[#020617]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between min-h-screen p-6 fixed z-40 shadow-2xl lg:shadow-none lg:relative"
                    >
                        <div>
                            {/* Brand Logo */}
                            <div className="flex items-center gap-4 mb-12 px-2 mt-2">
                                <div className="relative group cursor-pointer">
                                    <div className={`absolute -inset-1 bg-gradient-to-r from-${theme.accent}-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
                                    <div className="relative w-12 h-12 rounded-xl bg-neutral-950 flex items-center justify-center text-sky-400 font-black text-xl border border-white/10 shadow-2xl overflow-hidden">
                                        <theme.icon size={24} className={`${theme.accentText} ${theme.iconGlow}`} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
                                        RISE<span className={`text-${theme.accent}-500`}>.OPS</span>
                                    </h2>
                                    <p className={`text-[10px] ${theme.accentText}/80 font-bold uppercase tracking-[0.2em] ${theme.iconGlow}`}>
                                        Authority Hub
                                    </p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 space-y-8">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
                                        {theme.name}
                                    </p>
                                    <ul className="space-y-3">
                                        <NavItem
                                            to={`/authority/${theme.short.toLowerCase()}/dashboard`}
                                            icon={LayoutDashboard}
                                            label="Executive Dashboard"
                                        />
                                        <NavItem
                                            to={`/authority/${theme.short.toLowerCase()}/matrix`}
                                            icon={TableProperties}
                                            label="Complaint Matrix"
                                        />
                                        <NavItem
                                            to={`/authority/${theme.short.toLowerCase()}/reports`}
                                            icon={BarChart3}
                                            label="Reports & Analytics"
                                        />
                                        <NavItem
                                            to={`/authority/${theme.short.toLowerCase()}/broadcasts`}
                                            icon={Megaphone}
                                            label="Broadcast Alerts"
                                        />
                                    </ul>

                                </div>
                            </nav>
                        </div>

                        {/* Logout Button */}
                        <div className="pt-6 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-bold group"
                            >
                                <LogOut
                                    size={20}
                                    className="group-hover:-translate-x-1 transition-transform"
                                />
                                Sign Out System
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* CONTENT WRAPPER */}
            <div className={`flex-1 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300 ${isSidebarOpen ? "" : "lg:ml-0"}`}>
                {/* TOP HEADER BAR */}
                <header className="h-16 w-full bg-[#020617] border-b border-white/10 px-8 flex items-center justify-between shrink-0">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-widest text-gray-400">AUTHORITY</span>
                        <span className="text-white font-semibold leading-tight">{theme.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                id="notifications-dropdown-trigger"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2 transition-colors ${isNotificationsOpen ? "text-white" : "text-gray-400 hover:text-white"}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#020617]"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-[#020617] border border-white/10 rounded-xl shadow-2xl z-50 backdrop-blur-3xl overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className={`${theme.accentBg} ${theme.accentText} text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={`px-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer relative group ${n.unread ? "bg-white/[0.01]" : ""}`}
                                                    >
                                                        {n.unread && (
                                                            <div className={`absolute top-5 left-1 w-1 h-6 rounded-full ${theme.activePill}`}></div>
                                                        )}
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 p-1.5 rounded-lg ${n.unread ? theme.accentBg : "bg-white/5"}`}>
                                                                <Bell size={14} className={n.unread ? theme.accentText : "text-gray-400"} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-bold ${n.unread ? "text-white" : "text-gray-300"}`}>
                                                                    {n.title}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                                                    {n.message}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 mt-2 font-medium">
                                                                    {n.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-12 text-center">
                                                    <Bell size={32} className="mx-auto text-gray-700 mb-2 opacity-20" />
                                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-4 py-2 text-center bg-white/5 border-t border-white/5">
                                            <button
                                                onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                                                className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                                            >
                                                Mark all as read
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <div
                                id="profile-dropdown-trigger"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <User size={18} className="text-gray-300" />
                                </div>
                                <ChevronDown size={14} className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                            </div>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 bg-[#020617] border border-white/10 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-3xl overflow-hidden"
                                    >
                                        <div className="px-4 py-2 border-b border-white/5 bg-white/5 mb-1">
                                            <p className={`text-[10px] font-bold ${theme.accentText} uppercase tracking-widest`}>Authority Access</p>
                                            <p className="text-xs text-white font-medium truncate">{authUser?.email || `${theme.short.toLowerCase()}_admin@rise.ops`}</p>
                                        </div>

                                        <div
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate(`/authority/${theme.short.toLowerCase()}/profile`);
                                            }}
                                        >
                                            <User size={16} />
                                            <span>My Profile</span>
                                        </div>

                                        {[
                                            { label: "Settings", icon: Settings, route: `/authority/${theme.short.toLowerCase()}/settings` },
                                            { label: "Help", icon: HelpCircle, route: `/authority/${theme.short.toLowerCase()}/help` }
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    navigate(item.route);
                                                }}
                                            >
                                                <item.icon size={16} />
                                                <span>{item.label}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-[1400px] mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AuthorityLayout;


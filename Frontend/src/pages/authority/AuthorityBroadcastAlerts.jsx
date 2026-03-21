import React, { useState, useEffect } from "react";
import {
    Megaphone,
    Send,
    MapPin,
    AlertTriangle,
    Clock,
    CheckCircle,
    Info,
    ChevronRight,
    Search,
    Filter,
    ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";

const CustomDropdown = ({ options, value, onChange, placeholder, theme, isUrgent = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`w-full bg-slate-50 dark:bg-[#020617]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none ${theme.ring} transition-all font-bold flex items-center justify-between group shadow-sm ${isUrgent ? 'text-red-500 dark:text-red-400' : ''}`}
            >
                <span className={!value ? "text-slate-400 font-medium" : ""}>
                    {value || placeholder}
                </span>
                <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 backdrop-blur-3xl"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${value === opt.value
                                    ? `${theme.bg} ${theme.text}`
                                    : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 hover:dark:bg-white/5"
                                    }`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AuthorityBroadcastAlerts = () => {
    const { user: authUser } = useAuth();
    const { refreshAlerts, alerts: allAlerts } = useAlerts();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        location: "",
        priority: "Normal",
        customTitle: "",
    });

    // Auto-set priority for Wildlife Alert
    useEffect(() => {
        if (formData.title === "Wildlife Alert") {
            setFormData(prev => ({ ...prev, priority: "Urgent" }));
        }
    }, [formData.title]);

    // Authority Type Determination
    const isPower = authUser?.department === "ELECTRICITY" || window.location.pathname.includes("/power");
    const isRoad = authUser?.department === "CIVIL" || window.location.pathname.includes("/road");
    const isWater = authUser?.department === "WATER" || (!isPower && !isRoad);

    const authorityName = isPower ? "Power Authority" : isRoad ? "Road Infrastructure Authority" : "Water Authority";
    const authorityShort = isPower ? "Power" : isRoad ? "Road" : "Water";

    // Theme object updated for glassmorphism
    const theme = isPower
        ? { accent: "amber", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", button: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25", ring: "focus:ring-amber-500/50 focus:border-amber-500/50" }
        : isRoad
            ? { accent: "orange", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20", button: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25", ring: "focus:ring-orange-500/50 focus:border-orange-500/50" }
            : { accent: "sky", text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-500/10", border: "border-sky-200 dark:border-sky-500/20", button: "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25", ring: "focus:ring-sky-500/50 focus:border-sky-500/50" };

    const suggestedTitles = isPower
        ? ["Power Outage Alert", "Transformer Maintenance", "Grid Failure Warning", "High Voltage Safety Alert"]
        : isRoad
            ? ["Road Blockage", "Road Repair Notice", "Traffic Diversion", "Fallen Tree", "Wildlife Alert"]
            : ["Water Supply Interruption", "Pipeline Repair", "Muddy Water Warning", "Water Shortage Alert"];

    const [locationLoading, setLocationLoading] = useState(false);

    const handleDetectLocation = () => {
        if ("geolocation" in navigator) {
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await response.json();

                    const address = data.address || {};
                    const place = address.amenity || address.building || address.shop || "";
                    const area = address.village || address.suburb || address.town || "";
                    const city = address.city || address.county || "";

                    const shortLocation = `${place}, ${area}, ${city}`
                        .replace(/^,|,$/g, "")
                        .replace(/,,+/g, ",");

                    setFormData(prev => ({ ...prev, location: shortLocation }));
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                } finally {
                    setLocationLoading(false);
                }
            }, (error) => {
                console.error("Error getting location:", error);
                setLocationLoading(false);
                alert("Unable to detect location. Please check permissions or enter manually.");
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const dataToPost = {
                title: formData.title === "Other" ? formData.customTitle : formData.title,
                type: formData.title,
                severity: formData.priority === "Urgent" ? "High" : formData.priority === "Important" ? "Medium" : "Low",
                location: formData.location || "Multiple Areas",
                message: formData.message,
                isAuthority: true
            };

            await axios.post("/api/v1/broadcasts", dataToPost, config);

            setSent(true);
            if (refreshAlerts) refreshAlerts();

            setTimeout(() => {
                setSent(false);
                setFormData({ title: "", message: "", location: "", priority: "Normal", customTitle: "" });
            }, 3000);

        } catch (error) {
            console.error("Failed to send broadcast:", error);
            alert(error.response?.data?.message || "Failed to send broadcast");
        } finally {
            setLoading(false);
        }
    };

    const historyAlerts = allAlerts.filter(a => {
        if (!a.isAuthority) return false;
        if (isPower && a.backendType === 'POWER_ALERT') return true;
        if (isRoad && (a.backendType === 'ROAD_ALERT' || a.backendType === 'ROAD_BLOCK' || a.backendType === 'WILDLIFE_ALERT')) return true;
        if (isWater && a.backendType === 'WATER_ALERT') return true;
        return false;
    });

    return (
        <div className="space-y-8 pb-16">
            {/* COMPONENT HEADER */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-white/[0.02] p-8 md:p-10 border border-slate-200 dark:border-white/5 shadow-sm"
            >
                <div className={`absolute top-0 right-0 w-80 h-80 ${theme.bg} blur-3xl -mx-20 -my-20 rounded-full opacity-50 dark:opacity-20`} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full ${theme.bg} ${theme.text} text-[10px] font-black uppercase tracking-widest border ${theme.border}`}>
                                Dispatch Center
                            </span>
                            <span className="text-slate-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldAlert size={14} /> {authorityName}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${theme.bg} ${theme.text}`}>
                                <Megaphone size={32} />
                            </div>
                            Broadcast Alerts
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium text-sm md:text-base max-w-lg mt-4">
                            Dispatch official notifications, emergency warnings, and priority bulletins instantly to the municipal population.
                        </p>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-end">
                        <div className={`flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-gray-300 text-xs font-black tracking-widest uppercase`}>
                            <div className={`w-2 h-2 ${theme.bg.split(' ')[0].replace('bg-', 'bg-').split('/')[0].replace('50', '500')} rounded-full animate-pulse`}></div>
                            Official Authorized System
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* BROADCAST FORM */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-12 xl:col-span-8"
                >
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Alert Title */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                                        Alert Title
                                    </label>
                                    <CustomDropdown
                                        options={[
                                            ...suggestedTitles.map(t => ({ label: t, value: t })),
                                            { label: "Other", value: "Other" }
                                        ]}
                                        value={formData.title}
                                        onChange={(val) => setFormData({ ...formData, title: val })}
                                        placeholder="Select Alert Type"
                                        theme={theme}
                                    />
                                </div>

                                {/* Custom Title Input */}
                                <AnimatePresence>
                                    {formData.title === "Other" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 overflow-hidden col-span-1 md:col-span-2"
                                        >
                                            <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1 mt-2">
                                                Custom Alert Title
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.customTitle}
                                                onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                                                className={`w-full bg-slate-50 dark:bg-[#020617]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none ${theme.ring} transition-all font-bold placeholder:text-slate-400 shadow-sm`}
                                                placeholder="Enter custom alert title"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Priority Level */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                                        Priority Level
                                    </label>
                                    <CustomDropdown
                                        options={[
                                            { label: "🟢 Normal", value: "Normal" },
                                            { label: "🟡 Important", value: "Important" },
                                            { label: "🔴 Urgent", value: "Urgent" }
                                        ]}
                                        value={formData.priority}
                                        onChange={(val) => setFormData({ ...formData, priority: val })}
                                        theme={theme}
                                        isUrgent={formData.priority === 'Urgent'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                                    Affected Area (Optional)
                                </label>
                                <div className="relative group/location">
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={locationLoading}
                                        className={`absolute left-3 top-3 p-1 text-slate-400 hover:${theme.text} hover:${theme.bg} rounded-lg transition-all z-20 group-hover/location:${theme.text} disabled:opacity-50`}
                                        title="Detect current location"
                                    >
                                        <MapPin size={20} className={locationLoading ? `animate-spin ${theme.text}` : ""} />
                                    </button>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={`w-full bg-slate-50 dark:bg-[#020617]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none ${theme.ring} transition-all font-medium placeholder:text-slate-400 shadow-sm`}
                                        placeholder="e.g. Sector B, Main Road Area"
                                    />
                                </div>
                            </div>

                            {/* Alert Message */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                                    Alert Message
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className={`w-full bg-slate-50 dark:bg-[#020617]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none ${theme.ring} transition-all font-medium placeholder:text-slate-400 resize-none leading-relaxed shadow-sm`}
                                    placeholder="Provide clear details about the situation..."
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-4 rounded-xl ${theme.button} font-black transition-all flex items-center justify-center gap-3 w-full md:w-auto min-w-[200px] group active:scale-95 disabled:opacity-50 tracking-wider shadow-lg`}
                                >
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    {loading ? "Dispatching Protocol..." : "Send Broadcast"}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* QUICK TIPS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-12 xl:col-span-4"
                >
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl h-full shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
                                <Info size={18} />
                            </div>
                            Broadcast Protocol
                        </h3>
                        <div className="space-y-5">
                            {[
                                { title: "Urgent Alerts", text: "Highlighted in Red on user feeds. Use for immediate danger or critical outages.", color: "bg-red-500" },
                                { title: "Targeted Areas", text: "Specify locations to help residents determine if they are affected.", color: theme.bg.split(' ')[0].replace('bg-', 'bg-').split('/')[0].replace('50', '500') },
                                { title: "Clarity", text: "Keep messages concise but include expected resolution times if known.", color: theme.bg.split(' ')[0].replace('bg-', 'bg-').split('/')[0].replace('50', '500') },
                                { title: "Reach", text: "Alerts are sent to all active users via the main dashboard banner instantly.", color: theme.bg.split(' ')[0].replace('bg-', 'bg-').split('/')[0].replace('50', '500') }
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tip.color} mt-2 flex-shrink-0 group-hover:scale-150 transition-transform`}></div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 dark:text-gray-200 uppercase tracking-tight mb-1">{tip.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">{tip.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* BROADCAST HISTORY GRID */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-12"
                >
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-sm">
                        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-xl">
                                    <Clock size={20} />
                                </div>
                                Broadcast History
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search alerts..."
                                    className={`w-full md:w-64 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none ${theme.ring} transition-colors text-slate-900 dark:text-white font-medium placeholder:text-slate-400 shadow-inner`}
                                />
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col gap-3">
                                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold">
                                    <div className="col-span-3">Alert Details</div>
                                    <div className="col-span-2">Authority</div>
                                    <div className="col-span-2">Priority</div>
                                    <div className="col-span-3">Affected Area</div>
                                    <div className="col-span-2 text-right">Date Sent</div>
                                </div>

                                {historyAlerts.length > 0 ? historyAlerts.map((alert, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={alert.id || i} 
                                        className={`group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 py-5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-${theme.accent}-500/30 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-default`}
                                    >
                                        <div className="col-span-3 flex flex-col">
                                            <span className={`text-sm font-black text-slate-900 dark:text-white group-hover:${theme.text} transition-colors uppercase truncate pr-4`}>
                                                {alert.title}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-gray-500 font-medium truncate">
                                                {alert.category || "General Broadcast"}
                                            </span>
                                        </div>
                                        
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${theme.bg.split(' ')[0].replace('bg-', 'bg-').split('/')[0].replace('50', '500')}`}></div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-gray-400">{authorityShort} Official</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-wider ${
                                                alert.type === 'critical' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                                alert.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                'bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20'
                                            }`}>
                                                {alert.type === 'critical' ? 'Urgent' : alert.type === 'warning' ? 'Important' : 'Normal'}
                                            </span>
                                        </div>

                                        <div className="col-span-3">
                                            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest line-clamp-1 pr-4">{alert.location}</p>
                                        </div>

                                        <div className="col-span-2 flex flex-col lg:items-end">
                                            <p className="text-xs font-bold text-slate-800 dark:text-gray-300 tabular-nums">
                                                {new Date(alert.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium uppercase mt-0.5 tabular-nums">
                                                {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl text-slate-500">
                                        <Megaphone size={32} className="mb-4 text-slate-300 dark:text-white/10" />
                                        <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">No Broadcast History Found</span>
                                        <p className="text-xs mt-2 text-slate-400 dark:text-gray-500">Alerts dispatched will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {sent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-white dark:bg-[#020617] border border-emerald-500/30 p-10 rounded-3xl text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100 dark:border-emerald-500/20">
                                <CheckCircle size={40} className="drop-shadow-md" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                Broadcast Dispatched
                            </h2>
                            <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium text-sm leading-relaxed">
                                Your official alert has been successfully broadcasted and pushed to citizens.
                            </p>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3, ease: "linear" }}
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthorityBroadcastAlerts;

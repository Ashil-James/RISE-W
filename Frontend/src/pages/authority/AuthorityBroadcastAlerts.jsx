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
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";

const CustomDropdown = ({ options, value, onChange, placeholder, isUrgent = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Close on click outside
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
                className={`w-full bg-[#020617] border border-white/10 text-white rounded-[10px] px-4 py-3 focus:outline-none focus:border-blue-400 transition-all font-bold flex items-center justify-between group ${isUrgent ? 'text-red-400' : ''}`}
            >
                <span className={!value ? "text-gray-700 font-bold" : ""}>
                    {value || placeholder}
                </span>
                <ChevronRight size={18} className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[60] left-0 right-0 mt-2 bg-[#020617] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 backdrop-blur-3xl"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${value === opt.value
                                    ? "bg-sky-400/15 text-white"
                                    : "text-[#e2e2e0] hover:bg-white/5 active:bg-white/10"
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

    const theme = isPower
        ? { accent: "amber", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
        : isRoad
            ? { accent: "orange", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }
            : { accent: "sky", text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" };

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

                    const place =
                        address.amenity ||
                        address.building ||
                        address.shop ||
                        "";

                    const area =
                        address.village ||
                        address.suburb ||
                        address.town ||
                        "";

                    const city =
                        address.city ||
                        address.county ||
                        "";

                    const shortLocation = `${place}, ${area}, ${city}`
                        .replace(/^,|,$/g, "")
                        .replace(/,,+/g, ",");

                    setFormData(prev => ({
                        ...prev,
                        location: shortLocation
                    }));

                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    setFormData(prev => ({
                        ...prev,
                        location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    }));
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
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

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

    // Filter alerts for history box
    const historyAlerts = allAlerts.filter(a => {
        // Must be an authority broadcast
        if (!a.isAuthority) return false;

        // Power Authority: show only power alerts
        if (isPower && a.backendType === 'POWER_ALERT') return true;

        // Road Authority: show road, block, and wildlife alerts
        if (isRoad && (a.backendType === 'ROAD_ALERT' || a.backendType === 'ROAD_BLOCK' || a.backendType === 'WILDLIFE_ALERT')) return true;

        // Water Authority: show only water alerts
        if (isWater && a.backendType === 'WATER_ALERT') return true;

        return false;
    });

    return (
        <div className="space-y-10 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                        <Megaphone className={theme.text} size={36} />
                        Broadcast Alerts
                    </h1>
                    <p className="text-gray-400 max-w-xl text-lg font-medium">
                        Dispatch official notifications and emergency warnings to all citizens.
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 ${theme.bg} border ${theme.border} rounded-full ${theme.text} text-xs font-black tracking-widest uppercase`}>
                    <div className={`w-2 h-2 ${isPower ? 'bg-amber-500' : isRoad ? 'bg-orange-500' : 'bg-sky-500'} rounded-full animate-pulse`}></div>
                    Official Authorized System
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* BROADCAST FORM */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-12 xl:col-span-8"
                >
                    <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
                        {/* Subtle background glow */}
                        <div className={`absolute -top-24 -right-24 w-64 h-64 ${theme.bg} rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity`}></div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Alert Title Custom Dropdown */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
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
                                        />
                                    </div>

                                    {/* Conditional Custom Title Input */}
                                    <AnimatePresence>
                                        {formData.title === "Other" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                                    Custom Alert Title
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.customTitle}
                                                    onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                                                    className="w-full bg-[#020617] border border-white/10 text-white rounded-[10px] px-4 py-3 focus:outline-none focus:border-blue-400 transition-all font-bold placeholder:text-gray-700"
                                                    placeholder="Enter custom alert title"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>


                                {/* Priority Level Custom Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
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
                                        isUrgent={formData.priority === 'Urgent'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Affected Area (Optional)
                                </label>
                                <div className="relative group/location">
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={locationLoading}
                                        className={`absolute left-3 top-2.5 p-1 text-gray-600 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-all z-20 group-hover/location:text-sky-400 disabled:opacity-50`}
                                        title="Detect current location"
                                    >
                                        <MapPin size={20} className={locationLoading ? "animate-spin text-sky-400" : ""} />
                                    </button>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-[#020617] border border-white/10 text-white rounded-[10px] pl-12 pr-4 py-3 focus:outline-none focus:border-blue-400 transition-all font-bold placeholder:text-gray-700"
                                        placeholder="e.g. Sector B, Main Road Area"
                                    />
                                </div>
                            </div>


                            {/* Alert Message */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Alert Message
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-[#020617] border border-white/10 text-white rounded-[10px] px-4 py-3 focus:outline-none focus:border-blue-400 transition-all font-bold placeholder:text-gray-700 resize-none leading-relaxed"
                                    placeholder="Provide clear details about the situation..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-4 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 font-black transition-all flex items-center justify-center gap-3 w-full md:w-auto min-w-[200px] group active:scale-95 disabled:opacity-50"
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                {loading ? "Dispatching..." : "Send Broadcast"}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* QUICK TIPS / STATS */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Info size={20} className="text-sky-400" />
                            Broadcast Protocol
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: "Urgent Alerts", text: "Highlighted in Red on user feeds. Use for immediate danger or critical outages." },
                                { title: "Targeted Areas", text: "Specify locations to help residents determine if they are affected." },
                                { title: "Clarity", text: "Keep messages concise but include expected resolution times if known." },
                                { title: "Reach", text: "Alerts are sent to all active users via the main dashboard banner." }
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 uppercase tracking-tight">{tip.title}</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tip.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BROADCAST HISTORY TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-12"
                >
                    <div className="bg-[#020617] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <Clock className="text-gray-400" size={24} />
                                Broadcast History
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search alerts..."
                                    className="bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-white font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                        <th className="px-6 py-4">Alert Title</th>
                                        <th className="px-6 py-4">Alert Type</th>
                                        <th className="px-6 py-4">Authority</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Affected Area</th>
                                        <th className="px-6 py-4 text-right">Date Sent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {historyAlerts.length > 0 ? historyAlerts.map((alert, i) => (
                                        <tr key={alert.id || i} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                                                    {alert.title}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-400">
                                                    {alert.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isPower ? 'bg-amber-500' : isRoad ? 'bg-orange-500' : 'bg-sky-500'}`}></div>
                                                    <span className="text-xs font-bold text-gray-400">{authorityShort} Official</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${alert.type === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                    alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-sky-500/10 text-sky-500'
                                                    }`}>
                                                    {alert.type === 'critical' ? 'Urgent' : alert.type === 'warning' ? 'Important' : 'Normal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{alert.location}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-xs font-mono text-gray-500">
                                                    {new Date(alert.time).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-gray-600">
                                                    {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                        </tr>

                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-20">
                                                    <Megaphone size={48} className="text-gray-400" />
                                                    <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">No broadcast history found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-[#020617] border border-emerald-500/30 p-10 rounded-[2.5rem] text-center max-w-sm w-full shadow-[0_0_80px_-10px_rgba(16,185,129,0.4)]"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                                Broadcast Dispatched!
                            </h2>
                            <p className="text-gray-400 mb-8 font-medium text-sm">
                                Your official alert has been successfully broadcasted to all citizens in the township.
                            </p>
                            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3 }}
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]"
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

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ListFilter, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const TABS = [
    "Registry",
    "New",
    "Accepted",
    "Active Ops",
    "Assessment",
    "Resolved",
    "Reopened",
    "Rejected",
    "Revoked",
];

const URGENCY_LEVELS = ["Any Urgency", "Critical (75+)", "High (50-74)", "Low (0-49)"];

const lifecycleColor = (status) => {
    const map = {
        New: "text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse",
        Accepted: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        "Active Ops": "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
        Assessment: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
        "Work Completed": "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
        Resolved: "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
        Reopened: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse",
        Rejected: "text-red-400 bg-red-500/10 border-red-500/20",
        Revoked: "text-gray-300 bg-gray-500/10 border-gray-500/20",
    };
    return map[status] || "text-gray-400 bg-white/5 border-white/10";
};

const AuthorityPowerMatrix = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Registry");
    const [search, setSearch] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("Any Urgency");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mapStatusToLifecycle = (backendStatus) => {
        switch (backendStatus) {
            case "OPEN": return "New";
            case "ACCEPTED": return "Accepted";
            case "IN_PROGRESS": return "Active Ops";
            case "VERIFIED": return "Assessment";
            case "RESOLVED": return "Resolved";
            case "CLOSED": return "Work Completed";
            case "REOPENED": return "Reopened";
            case "REJECTED": return "Rejected";
            case "REVOKED": return "Revoked";
            default: return "New";
        }
    };

    const getDuration = (dateString) => {
        if (!dateString) return "Just now";
        const start = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return `${diffDays} Days`;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours > 0) return `${diffHours} Hrs`;
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return `${diffMins} Mins`;
    };

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await fetch("/api/v1/authority/power/incidents", {
                    headers: authHeader,
                });

                if (!res.ok) throw new Error("Failed to fetch power incidents");
                const result = await res.json();

                if (result.success) {
                    const formatted = result.data.map(item => ({
                        id: item._id,
                        ref: item.reportId || `#POW-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                        category: item.category || "Power Issue",
                        subtype: item.title || "Undisclosed Issue",
                        loc: item.address || "Location Unavailable",
                        urg: item.urgencyScore || 10,
                        lifecycle: mapStatusToLifecycle(item.status),
                        duration: getDuration(item.createdAt),
                        protocol: "View Case"
                    }));
                    setIncidents(formatted);
                }
            } catch (err) {
                console.error("Error fetching power matrix data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, [user]);

    // Filtering
    const filteredData = incidents.filter((row) => {
        if (activeTab !== "Registry" && row.lifecycle !== activeTab && !(activeTab === "Resolved" && row.lifecycle === "Work Completed")) {
            return false;
        }
        if (search && !row.ref.toLowerCase().includes(search.toLowerCase())) return false;
        if (urgencyFilter === "Critical (75+)" && row.urg < 75) return false;
        if (urgencyFilter === "High (50-74)" && (row.urg < 50 || row.urg >= 75)) return false;
        if (urgencyFilter === "Low (0-49)" && row.urg >= 50) return false;
        return true;
    });

    return (
        <div className="space-y-8 pb-12">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-1">
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Complaint Matrix</h1>
                <p className="text-gray-400 font-medium">Power Infrastructure Registry</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">

                {/* ── TOP CONTROLS ── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl w-full lg:w-auto overflow-hidden">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab
                                    ? "text-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-glow" className="absolute inset-0 border border-amber-500/30 rounded-lg pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search & Urgency Bias */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search Report ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-gray-600 shadow-inner"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl text-sm font-bold transition-colors w-44 justify-between"
                            >
                                <div className="flex items-center gap-2 shrink-0">
                                    <ListFilter size={14} className="text-amber-400" />
                                    <span className="truncate">{urgencyFilter === "Any Urgency" ? "Urgency Bias" : urgencyFilter}</span>
                                </div>
                                <ChevronDown size={14} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-44 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
                                    >
                                        {URGENCY_LEVELS.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => { setUrgencyFilter(level); setIsDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-amber-500/20 hover:text-amber-300 ${urgencyFilter === level ? "text-amber-400 bg-amber-500/10 font-bold" : "text-gray-400"
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ── MATRIX TABLE ── */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                                    <th className="px-5 py-4">Ref ID</th>
                                    <th className="px-5 py-4">Operational Sector</th>
                                    <th className="px-5 py-4">Sub-Type</th>
                                    <th className="px-5 py-4">Location</th>
                                    <th className="px-5 py-4">Urgency</th>
                                    <th className="px-5 py-4">Lifecycle</th>
                                    <th className="px-5 py-4">Duration</th>
                                    <th className="px-5 py-4 text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-amber-500 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <Loader2 size={32} className="animate-spin" />
                                                <span className="text-sm font-bold tracking-widest uppercase">Fetching Diagnostics...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-red-400 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <AlertTriangle size={32} />
                                                <span className="text-sm font-bold uppercase">Failed to synchronize: {error}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((row) => (
                                        <tr key={row.ref} className="hover:bg-white/5 transition-colors group cursor-default">
                                            <td className="px-5 py-4 font-mono text-sm text-amber-400 font-bold">{row.ref}</td>
                                            <td className="px-5 py-4 text-sm text-gray-300">{row.category}</td>
                                            <td className="px-5 py-4 text-sm text-white font-medium">{row.subtype}</td>
                                            <td className="px-5 py-4 text-sm text-gray-400">{row.loc}</td>
                                            <td className="px-5 py-4 text-sm font-black text-white">{row.urg}</td>
                                            <td className="px-5 py-4">
                                                {row.urg >= 75 && !["Resolved", "Work Completed", "Rejected", "Revoked"].includes(row.lifecycle) ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 text-red-400 bg-red-500/10 animate-ping">
                                                        <AlertTriangle size={12} />
                                                        HIGH URGENCY
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${lifecycleColor(row.lifecycle)}`}>
                                                        {(row.lifecycle === "Resolved" || row.lifecycle === "Work Completed") && <CheckCircle size={12} />}
                                                        {row.lifecycle}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-gray-400">{row.duration}</td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/authority/power/case/${row.id}`)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/25 group/btn"
                                                >
                                                    {row.protocol}
                                                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-gray-500 font-medium">
                                            No records found in registry matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default AuthorityPowerMatrix;

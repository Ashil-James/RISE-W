import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ListFilter, ArrowRight, CheckCircle, AlertTriangle, Loader2, Layers, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
        New: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
        Accepted: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
        "Active Ops": "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20",
        Assessment: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
        "Work Completed": "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
        Resolved: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
        Reopened: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
        Rejected: "text-slate-600 bg-slate-100 border-slate-300 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700",
        Revoked: "text-slate-500 bg-slate-50 border-slate-200 dark:text-gray-500 dark:bg-white/5 dark:border-white/10",
    };
    return map[status] || "text-slate-500 bg-slate-50 border-slate-200 dark:text-gray-400 dark:bg-white/5 dark:border-white/10";
};

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

const AuthorityRoadMatrix = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Registry");
    const [search, setSearch] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("Any Urgency");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // API Data
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await fetch("/api/v1/authority/road/incidents", {
                    headers: authHeader,
                });

                if (!res.ok) throw new Error("Failed to fetch registry data");
                const result = await res.json();

                if (result.success) {
                    const formatted = result.data.map(item => ({
                        id: item._id,
                        ref: item.reportId || `#REQ-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                        category: item.category || "Road & Infrastructure",
                        subtype: item.title || "Undisclosed Issue",
                        loc: item.address || "Location Unavailable",
                        urg: Math.min(100, (item.urgencyScore || 10) + (item.upvotes || 0)),
                        lifecycle: mapStatusToLifecycle(item.status),
                        duration: getDuration(item.createdAt)
                    }));
                    setIncidents(formatted);
                }
            } catch (err) {
                console.error("Error fetching authority incidents:", err);
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
        <div className="space-y-6 pb-12">
            {/* HERO PANEL */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-white/[0.02] p-8 border border-slate-200 dark:border-white/5 shadow-sm"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 blur-3xl -mx-20 -my-20 rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-500/20">
                                Live Database
                            </span>
                            <span className="text-slate-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Server size={14} /> Road Authority
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Complaint Matrix
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium text-sm max-w-lg">
                            Operational case management registry and incident prioritization queue.
                        </p>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {filteredData.length}
                        </p>
                        <p className="text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest mt-1">
                            Records Found
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* CONTROLS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                
                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm w-full xl:w-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab
                                ? "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10 shadow-sm"
                                : "text-slate-500 dark:text-gray-400 hover:text-slate-900 hover:dark:text-white hover:bg-slate-50 hover:dark:bg-white/5"
                                }`}
                        >
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-64">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search Report ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-slate-400 shadow-sm font-medium"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-300 hover:dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors min-w-[160px] justify-between shadow-sm"
                        >
                            <div className="flex items-center gap-2 shrink-0">
                                <ListFilter size={14} className="text-orange-500 dark:text-orange-400" />
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
                                    className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 p-1"
                                >
                                    {URGENCY_LEVELS.map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => { setUrgencyFilter(level); setIsDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors font-medium ${urgencyFilter === level 
                                                ? "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10" 
                                                : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 hover:dark:bg-white/5"
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
            </motion.div>

            {/* LIST VIEW */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl text-orange-500">
                        <Loader2 size={32} className="animate-spin mb-4" />
                        <span className="text-sm font-bold tracking-widest uppercase">Syncing Registry...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl text-red-500">
                        <AlertTriangle size={32} className="mb-4" />
                        <span className="text-sm font-bold uppercase">Failed to synchronize: {error}</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold">
                            <div className="col-span-2">Ref ID</div>
                            <div className="col-span-2">Sub-Type</div>
                            <div className="col-span-3">Location</div>
                            <div className="col-span-2">Urgency</div>
                            <div className="col-span-2">Lifecycle</div>
                            <div className="col-span-1 text-right">Protocol</div>
                        </div>

                        {filteredData.length > 0 ? (
                            filteredData.map((row, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={row.id}
                                    onClick={() => navigate(`/authority/road/case/${row.id}`)}
                                    className="group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 py-5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-orange-500/30 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors uppercase">{row.ref}</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">{row.duration}</span>
                                    </div>
                                    
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 dark:text-gray-200 truncate">{row.subtype}</span>
                                        <span className="text-xs text-slate-400 dark:text-gray-500 truncate">{row.category}</span>
                                    </div>

                                    <div className="col-span-3">
                                        <span className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 pr-4">{row.loc}</span>
                                    </div>

                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-white/10 shadow-sm font-black text-slate-900 dark:text-white text-sm">
                                            {row.urg}
                                        </div>
                                        {row.urg >= 75 && row.lifecycle !== "Resolved" && row.lifecycle !== "Work Completed" && (
                                            <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Critical</span>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${lifecycleColor(row.lifecycle)}`}>
                                            {(row.lifecycle === "Resolved" || row.lifecycle === "Work Completed") && <CheckCircle size={14} />}
                                            {row.lifecycle}
                                        </span>
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-all">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl text-slate-500">
                                <Search size={32} className="mb-4 text-slate-300 dark:text-white/10" />
                                <span className="text-sm font-bold tracking-widest text-slate-400">No Records Found</span>
                                <p className="text-xs mt-2 text-slate-400 dark:text-gray-500">Adjust your filters to see more results.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AuthorityRoadMatrix;

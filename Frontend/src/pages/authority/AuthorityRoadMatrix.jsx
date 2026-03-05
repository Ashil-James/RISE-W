import React, { useState } from "react";
import { Search, ChevronDown, ListFilter, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TABS = [
    "Registry",
    "New",
    "Accepted",
    "Active Ops",
    "Assessment",
    "Resolved",
    "Reopened",
];

const URGENCY_LEVELS = ["Any Urgency", "Critical (75+)", "High (50-74)", "Low (0-49)"];

const MOCK_REGISTRY = [
    { ref: "#ROA-2041", category: "Surface Damage", subtype: "Major Pothole", loc: "Sector G Hwy", urg: 85, lifecycle: "New", duration: "1 Days", protocol: "View Case" },
    { ref: "#ROA-5502", category: "Traffic Signal", subtype: "Traffic Signal Damage", loc: "Avenue A", urg: 12, lifecycle: "Resolved", duration: "5 Days", protocol: "View Case" },
    { ref: "#ROA-8821", category: "Road Blockage", subtype: "Fallen Tree", loc: "Sector A", urg: 95, lifecycle: "Accepted", duration: "2 Hrs", protocol: "View Case" },
    { ref: "#ROA-3304", category: "Drainage", subtype: "Drainage Overflow on Road", loc: "Sector D", urg: 45, lifecycle: "Active Ops", duration: "3 Days", protocol: "View Case" },
    { ref: "#ROA-1992", category: "Signage", subtype: "Street Sign Damage", loc: "Sector F", urg: 28, lifecycle: "Assessment", duration: "4 Days", protocol: "View Case" },
];

const lifecycleColor = (status) => {
    const map = {
        New: "text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse",
        Accepted: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        "Active Ops": "text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
        Assessment: "text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
        Resolved: "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
        Reopened: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse",
    };
    return map[status] || "text-gray-400 bg-white/5 border-white/10";
};

const AuthorityRoadMatrix = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Registry");
    const [search, setSearch] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("Any Urgency");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filtering
    const filteredData = MOCK_REGISTRY.filter((row) => {
        if (activeTab !== "Registry" && row.lifecycle !== activeTab) return false;
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
                <p className="text-gray-400 font-medium">Road Infrastructure Registry</p>
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
                                    ? "text-orange-400 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-glow" className="absolute inset-0 border border-orange-500/30 rounded-lg pointer-events-none" />
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
                                className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-gray-600 shadow-inner"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl text-sm font-bold transition-colors w-44 justify-between"
                            >
                                <div className="flex items-center gap-2 shrink-0">
                                    <ListFilter size={14} className="text-orange-400" />
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
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-orange-500/20 hover:text-orange-300 ${urgencyFilter === level ? "text-orange-400 bg-orange-500/10 font-bold" : "text-gray-400"
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
                                {filteredData.length > 0 ? (
                                    filteredData.map((row) => (
                                        <tr key={row.ref} className="hover:bg-white/5 transition-colors group cursor-default">
                                            <td className="px-5 py-4 font-mono text-sm text-orange-400 font-bold">{row.ref}</td>
                                            <td className="px-5 py-4 text-sm text-gray-300">{row.category}</td>
                                            <td className="px-5 py-4 text-sm text-white font-medium">{row.subtype}</td>
                                            <td className="px-5 py-4 text-sm text-gray-400">{row.loc}</td>
                                            <td className="px-5 py-4 text-sm font-black text-white">{row.urg}</td>
                                            <td className="px-5 py-4">
                                                {row.urg >= 75 && row.lifecycle !== "Resolved" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 text-red-400 bg-red-500/10 animate-ping">
                                                        <AlertTriangle size={12} />
                                                        HIGH URGENCY
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${lifecycleColor(row.lifecycle)}`}>
                                                        {row.lifecycle === "Resolved" && <CheckCircle size={12} />}
                                                        {row.lifecycle}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-gray-400">{row.duration}</td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/authority/road/case/${row.ref.replace('#', '')}`)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-orange-500/25 group/btn"
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

export default AuthorityRoadMatrix;

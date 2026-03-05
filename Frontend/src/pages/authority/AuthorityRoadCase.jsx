import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Calendar,
    AlertTriangle,
    Users,
    CheckCircle,
    XCircle,
    Upload,
    UserCheck,
    Construction,
    ArrowLeft,
    Info
} from "lucide-react";

const AuthorityRoadCase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const caseId = id ? `#${id.toUpperCase()}` : "#ROA-2041";

    const [status, setStatus] = useState("New");
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [resolutionProof, setResolutionProof] = useState(null);

    const STATUS_STYLES = {
        New: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "Worker Assigned": "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "In Progress": "bg-orange-500/10 text-orange-400 border-orange-500/20",
        Resolved: "bg-green-500/10 text-green-400 border-green-500/20",
        Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const currentStatusStyle = STATUS_STYLES[status] || STATUS_STYLES["New"];

    const handleAccept = () => {
        setStatus("Worker Assigned");
    };

    const handleReject = () => {
        if (!rejectReason.trim()) return;
        setStatus("Rejected");
        setIsRejecting(false);
    };

    const handleUploadResolution = () => {
        if (!uploadFile) return;
        setResolutionProof(URL.createObjectURL(uploadFile));
    };

    return (
        <div className="space-y-6 pb-12 max-w-5xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold group w-fit"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Registry
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentStatusStyle} flex items-center gap-2 w-fit`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                            Status: {status}
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                        Case {caseId}
                    </h1>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-sm font-bold">Surface Damage</span>
                        <span className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-lg text-sm font-medium">Major Pothole</span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <MapPin className="text-orange-400" size={20} />
                            Location Information Registry
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location Registry</p>
                                <p className="text-white font-medium">Sector G Hwy</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Submission Date</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Calendar size={14} className="text-gray-400" />
                                    2024-03-24 <span className="text-gray-500 ml-1">11:15</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Info className="text-orange-400" size={20} />
                            Incident Narrative
                        </h3>
                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-5 text-gray-300 leading-relaxed font-medium">
                            "A massive pothole has formed in the middle lane of Sector G Highway causing severe traffic slowdowns and potential vehicle damage. The road surface has completely caved in."
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                        {status === "New" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">Primary Acceptance</h3>
                                <div className="flex gap-4">
                                    <button onClick={handleAccept} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle size={18} /> Accept Complaint
                                    </button>
                                    <button onClick={() => setIsRejecting(true)} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                        <XCircle size={18} /> Reject Case File
                                    </button>
                                </div>
                                {isRejecting && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                                        <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Provide mandatory operational reason for rejection*</label>
                                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-black/40 border border-red-500/20 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500 mb-3" rows={3} placeholder="State reason here..."></textarea>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white font-bold">Cancel</button>
                                            <button onClick={handleReject} disabled={!rejectReason.trim()} className="px-6 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/25">Confirm Reject</button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {(status !== "New" && status !== "Rejected") && (
                            <div className="pt-2">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <UserCheck className="text-orange-400" size={20} />
                                    Operational Protocol
                                </h3>

                                <div className="bg-black/20 border border-white/5 rounded-xl p-5 mb-6">
                                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Authority Status Update</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full appearance-none bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-orange-500 cursor-pointer"
                                    >
                                        <option value="Worker Assigned" className="bg-neutral-900">Worker Assigned</option>
                                        <option value="In Progress" className="bg-neutral-900">In Progress</option>
                                        <option value="Resolved" className="bg-neutral-900">Resolved</option>
                                    </select>
                                </div>

                                {status === "Resolved" && !resolutionProof && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mb-6">
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upload Resolution Proof</p>
                                            <p className="text-sm text-orange-400/80 mb-2">Please upload a photo showing the repaired road surface (.jpg, .jpeg, .png)</p>
                                            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-orange-500/30 hover:border-orange-500/50 bg-black/20 rounded-xl cursor-pointer transition-colors group">
                                                <Upload size={28} className="text-orange-400/50 group-hover:text-orange-400 mb-3 transition-colors" />
                                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                                    {uploadFile ? uploadFile.name : "Upload Image Button"}
                                                </span>
                                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => setUploadFile(e.target.files[0])} />
                                            </label>

                                            <button
                                                onClick={handleUploadResolution}
                                                disabled={!uploadFile}
                                                className="w-full py-3.5 mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex justify-center items-center gap-2"
                                            >
                                                Save Resolution Proof
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {resolutionProof && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-400 font-bold">
                                            <CheckCircle size={20} /> Case Resolved & Documented Successfully
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resolution Proof</p>
                                            <div className="aspect-video w-full rounded-lg overflow-hidden border border-emerald-500/30">
                                                <img src={resolutionProof} alt="Resolution" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {status === "Rejected" && (
                            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 font-bold">
                                <XCircle size={20} /> Case Rejected
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
                        <h3 className="text-lg font-bold text-white mb-6">Impact Analytics</h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Traffic Impact</p>
                                <div className="flex items-end gap-2">
                                    <Users size={28} className="text-orange-400" />
                                    <span className="text-3xl font-black text-white leading-none">High</span>
                                    <span className="text-gray-400 font-medium mb-1">Delay</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>Urgency Score</span>
                                    <span className="text-orange-400">Severe</span>
                                </p>
                                <div className="text-3xl font-black text-white mb-3">85<span className="text-lg text-gray-500">/100</span></div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-orange-500 to-orange-300 rounded-full" />
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400">
                                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                                <p className="text-sm font-bold leading-tight pt-0.5">Accident Hazard - Immediate Repair Required</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityRoadCase;

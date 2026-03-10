import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, MapPin, Calendar, AlertTriangle, User, Trash2 } from "lucide-react";
import { useReports } from "../context/ReportContext";
import { motion, AnimatePresence } from "framer-motion";

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports, updateReportStatus } = useReports();
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

    const report = reports.find((r) => r.id.toString() === id || r.id === `#${id}` || r.id.includes(id));

    if (!report) {
        return (
            <div className="w-full max-w-2xl mx-auto pt-20 text-center">
                <div className="glass-card p-8 rounded-2xl">
                    <AlertTriangle size={48} className="mx-auto text-wayanad-muted mb-4 opacity-40" />
                    <h2 className="text-xl font-bold text-wayanad-text mb-2">Report Not Found</h2>
                    <p className="text-wayanad-muted mb-6">The report you are looking for does not exist or has been removed.</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/my-reports")}
                        className="px-6 py-2.5 text-white rounded-xl font-bold"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}
                    >
                        Back to My Reports
                    </motion.button>
                </div>
            </div>
        );
    }

    const handleVerify = () => { updateReportStatus(report.id, "Closed"); navigate("/my-reports"); };
    const handleReopen = () => { updateReportStatus(report.id, "Open"); };
    const handleRevoke = () => { updateReportStatus(report.id, "Revoked"); navigate("/my-reports"); };

    const statusAccents = {
        Resolved: { bg: "rgba(59,130,246,0.06)", color: "#3b82f6", border: "rgba(59,130,246,0.12)", badge: "rgba(59,130,246,0.1)" },
        Closed: { bg: "rgba(16,185,129,0.06)", color: "#10b981", border: "rgba(16,185,129,0.12)", badge: "rgba(16,185,129,0.1)" },
        Revoked: { bg: "rgba(107,114,128,0.06)", color: "#6b7280", border: "rgba(107,114,128,0.12)", badge: "rgba(107,114,128,0.1)" },
        Open: { bg: "rgba(249,115,22,0.06)", color: "#f97316", border: "rgba(249,115,22,0.12)", badge: "rgba(249,115,22,0.1)" },
    };
    const accent = statusAccents[report.status] || statusAccents.Open;

    return (
        <motion.div className="w-full max-w-2xl mx-auto pb-20"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <motion.button
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 className="text-xl font-bold text-wayanad-text">Report Details</h1>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                {/* Status Banner */}
                <div className="px-6 py-3.5 flex justify-between items-center"
                    style={{ background: accent.bg, borderBottom: `1px solid ${accent.border}` }}>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-wayanad-muted/70">{report.id}</span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl uppercase tracking-wide"
                            style={{ color: accent.color, background: accent.badge, border: `1px solid ${accent.border}` }}>
                            {report.status}
                        </span>
                    </div>
                    <span className="text-xs text-wayanad-muted flex items-center gap-1">
                        <Calendar size={12} /> {report.date}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Main Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-wayanad-text mb-2">{report.issue}</h2>
                        {report.description && (
                            <p className="text-wayanad-text/80 mb-4 leading-relaxed">{report.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-wayanad-muted">
                            <MapPin size={16} className="text-emerald-500" />
                            <span className="text-sm">{report.location}</span>
                        </div>
                    </div>

                    {/* User Image */}
                    {report.image && (
                        <div>
                            <p className="text-xs font-bold text-wayanad-muted uppercase mb-2 flex items-center gap-2">
                                <User size={12} /> Your Upload
                            </p>
                            <div className="relative rounded-xl overflow-hidden glass-card cursor-pointer group"
                                onClick={() => window.open(report.image, "_blank")}>
                                <img src={report.image} alt="Reported Issue"
                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <span className="backdrop-blur-sm bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <ExternalLink size={14} /> View Full Image
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-wayanad-border w-full"></div>

                    {/* Authority Response / Actions */}
                    {report.status === "Resolved" || report.status === "Closed" ? (
                        <div>
                            <h3 className="text-sm font-bold text-wayanad-muted uppercase mb-3">Authority Response</h3>
                            <div className="rounded-xl p-4 mb-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <p className="text-wayanad-text italic">"{report.authorityMessage || "No message provided."}"</p>
                                {report.authorityProof && (
                                    <div className="relative rounded-xl overflow-hidden mt-4 glass-card cursor-pointer group"
                                        onClick={() => window.open(report.authorityProof, "_blank")}>
                                        <img src={report.authorityProof} alt="Proof of fix"
                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="backdrop-blur-sm bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                <ExternalLink size={14} /> View Full Image
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {report.status === "Resolved" && (
                                <div className="flex gap-3">
                                    <motion.button onClick={handleVerify}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 25px -5px rgba(16,185,129,0.4)" }}>
                                        <CheckCircle2 size={18} /> Verify & Close
                                    </motion.button>
                                    <motion.button onClick={handleReopen}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 glass-card py-3 rounded-xl text-sm font-bold text-wayanad-text hover:text-red-500 flex items-center justify-center gap-2 transition-colors">
                                        <XCircle size={18} /> Not Fixed
                                    </motion.button>
                                </div>
                            )}

                            {report.status === "Closed" && (
                                <div className="text-center p-4 rounded-xl font-bold flex items-center justify-center gap-2"
                                    style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", color: "#10b981" }}>
                                    <CheckCircle2 size={18} /> This report has been verified and closed.
                                </div>
                            )}
                        </div>
                    ) : report.status === "Revoked" ? (
                        <div className="text-center py-8 text-wayanad-muted rounded-xl glass-card">
                            <p>You have revoked this report.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center py-8 text-wayanad-muted rounded-xl" style={{ background: "var(--glass-bg)", border: "1px dashed var(--glass-border)" }}>
                                <p>This report is currently being processed by the authorities.</p>
                                <p className="text-xs mt-1 opacity-70">You will be notified once a resolution is posted.</p>
                            </div>

                            <div className="border-t border-wayanad-border pt-6">
                                <AnimatePresence mode="wait">
                                    {!showRevokeConfirm ? (
                                        <motion.button key="revokeBtn"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            onClick={() => setShowRevokeConfirm(true)}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full py-3 rounded-xl text-sm font-bold text-red-500 flex items-center justify-center gap-2 transition-all"
                                            style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
                                            <Trash2 size={16} /> Revoke Report
                                        </motion.button>
                                    ) : (
                                        <motion.div key="revokeConfirm"
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                            className="rounded-xl p-4" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
                                            <p className="text-sm text-center text-wayanad-text mb-3 font-medium">Are you sure you want to revoke this report?</p>
                                            <div className="flex gap-3">
                                                <motion.button onClick={handleRevoke}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold"
                                                    style={{ background: "#ef4444" }}>
                                                    Yes, Revoke
                                                </motion.button>
                                                <motion.button onClick={() => setShowRevokeConfirm(false)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex-1 glass-card text-wayanad-text py-2.5 rounded-xl text-sm font-bold">
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ReportDetails;

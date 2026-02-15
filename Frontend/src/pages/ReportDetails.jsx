import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, MapPin, Calendar, AlertTriangle, User, Trash2 } from "lucide-react";
import { useReports } from "../context/ReportContext";

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports, updateReportStatus } = useReports();
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

    // Find report by ID
    const report = reports.find((r) => r.id.toString() === id || r.id === `#${id}` || r.id.includes(id));

    if (!report) {
        return (
            <div className="w-full max-w-2xl mx-auto pt-20 text-center animate-fade-in">
                <div className="bg-wayanad-panel p-8 rounded-2xl border border-wayanad-border">
                    <AlertTriangle size={48} className="mx-auto text-wayanad-muted mb-4" />
                    <h2 className="text-xl font-bold text-wayanad-text mb-2">Report Not Found</h2>
                    <p className="text-wayanad-muted mb-6">The report you are looking for does not exist or has been removed.</p>
                    <button
                        onClick={() => navigate("/my-reports")}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition-colors"
                    >
                        Back to My Reports
                    </button>
                </div>
            </div>
        );
    }

    const handleVerify = () => {
        updateReportStatus(report.id, "Closed");
        navigate("/my-reports");
    };

    const handleReopen = () => {
        updateReportStatus(report.id, "Open");
    };

    const handleRevoke = () => {
        updateReportStatus(report.id, "Revoked");
        navigate("/my-reports");
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-wayanad-panel transition-colors text-wayanad-muted hover:text-wayanad-text"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-wayanad-text">Report Details</h1>
            </div>

            <div className="bg-wayanad-panel border border-wayanad-border rounded-2xl overflow-hidden shadow-sm">
                {/* Status Banner */}
                <div className={`px-6 py-3 border-b border-wayanad-border flex justify-between items-center ${report.status === "Resolved" ? "bg-blue-500/10" :
                        report.status === "Closed" ? "bg-emerald-500/10" :
                            report.status === "Revoked" ? "bg-gray-500/10" : "bg-wayanad-panel"
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-wayanad-muted/70">
                            {report.id}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${report.status === "Resolved" ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30" :
                                report.status === "Closed" ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" :
                                    report.status === "Revoked" ? "text-gray-600 bg-gray-100 dark:bg-gray-800" :
                                        "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                            }`}>
                            {report.status}
                        </span>
                    </div>
                    <span className="text-xs text-wayanad-muted flex items-center gap-1">
                        <Calendar size={12} /> {report.date}
                    </span>
                </div>

                <div className="p-6">
                    {/* Main Info */}
                    <h2 className="text-2xl font-bold text-wayanad-text mb-2">{report.issue}</h2>

                    {/* Description / Prompt */}
                    {report.description && (
                        <p className="text-wayanad-text/80 mb-4 leading-relaxed">
                            {report.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 text-wayanad-muted mb-6">
                        <MapPin size={16} className="text-emerald-500" />
                        <span className="text-sm">{report.location}</span>
                    </div>

                    {/* User Uploaded Image */}
                    {report.image && (
                        <div className="mb-8">
                            <p className="text-xs font-bold text-wayanad-muted uppercase mb-2 flex items-center gap-2">
                                <User size={12} /> Your Upload
                            </p>
                            <div className="relative rounded-lg overflow-hidden border border-wayanad-border cursor-pointer group"
                                onClick={() => window.open(report.image, "_blank")}
                            >
                                <img
                                    src={report.image}
                                    alt="Reported Issue"
                                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 backdrop-blur-sm">
                                        <ExternalLink size={14} /> View Full Image
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-wayanad-border w-full mb-6"></div>

                    {/* Authority Response */}
                    {report.status === "Resolved" || report.status === "Closed" ? (
                        <div className="animate-fade-up">
                            <h3 className="text-sm font-bold text-wayanad-muted uppercase mb-3">
                                Authority Response
                            </h3>

                            <div className="bg-wayanad-bg p-4 rounded-xl border border-wayanad-border mb-6">
                                <p className="text-wayanad-text mb-4 italic">"{report.authorityMessage || "No message provided."}"</p>

                                {report.authorityProof && (
                                    <div className="relative rounded-lg overflow-hidden border border-wayanad-border cursor-pointer group"
                                        onClick={() => window.open(report.authorityProof, "_blank")}
                                    >
                                        <img
                                            src={report.authorityProof}
                                            alt="Proof of fix"
                                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 backdrop-blur-sm">
                                                <ExternalLink size={14} /> View Full Image
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons - Only show if Resolved (not Closed) */}
                            {report.status === "Resolved" && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleVerify}
                                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircle2 size={18} /> Verify & Close
                                    </button>
                                    <button
                                        onClick={handleReopen}
                                        className="flex-1 bg-wayanad-bg border border-wayanad-border text-wayanad-text py-3 rounded-xl text-sm font-bold hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/30 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Not Fixed
                                    </button>
                                </div>
                            )}

                            {report.status === "Closed" && (
                                <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} /> This report has been verified and closed.
                                </div>
                            )}
                        </div>
                    ) : report.status === "Revoked" ? (
                        <div className="text-center py-8 text-wayanad-muted bg-wayanad-bg rounded-xl border border-dashed border-wayanad-border">
                            <p>You have revoked this report.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center py-8 text-wayanad-muted bg-wayanad-bg rounded-xl border border-dashed border-wayanad-border">
                                <p>This report is currently being processed by the authorities.</p>
                                <p className="text-xs mt-1 opacity-70">You will be notified once a resolution is posted.</p>
                            </div>

                            {/* Revoke Option */}
                            <div className="border-t border-wayanad-border pt-6">
                                {!showRevokeConfirm ? (
                                    <button
                                        onClick={() => setShowRevokeConfirm(true)}
                                        className="w-full py-3 border border-red-500/30 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Revoke Report
                                    </button>
                                ) : (
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 animate-fade-in">
                                        <p className="text-sm text-center text-wayanad-text mb-3 font-medium">Are you sure you want to revoke this report?</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleRevoke}
                                                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                                            >
                                                Yes, Revoke
                                            </button>
                                            <button
                                                onClick={() => setShowRevokeConfirm(false)}
                                                className="flex-1 bg-wayanad-bg text-wayanad-text border border-wayanad-border py-2 rounded-lg text-sm font-bold hover:bg-wayanad-panel transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetails;

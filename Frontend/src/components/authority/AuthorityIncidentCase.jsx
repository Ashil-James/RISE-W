import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Info,
    Loader2,
    MapPin,
    Upload,
    UserCheck,
    Users,
    XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DB_STATUS_TO_UI = {
    OPEN: "New",
    ACCEPTED: "Accepted",
    IN_PROGRESS: "In Progress",
    VERIFIED: "Assessment",
    RESOLVED: "Resolved",
    CLOSED: "Work Completed",
    REOPENED: "Reopened",
    REJECTED: "Rejected",
    REVOKED: "Revoked",
};

const UI_STATUS_TO_DB = {
    New: "OPEN",
    Accepted: "ACCEPTED",
    "In Progress": "IN_PROGRESS",
    Resolved: "RESOLVED",
    Rejected: "REJECTED",
    Reopened: "REOPENED",
};

const THEMES = {
    sky: {
        accentText: "text-sky-400",
        accentSoft: "bg-sky-500/10",
        accentBorder: "border-sky-500/20",
        accentSubtle: "bg-sky-500/5",
        accentSubtleBorder: "border-sky-500/10",
        accentHover: "hover:bg-sky-400",
        accentBg: "bg-sky-500",
        accentGlow: "shadow-sky-500/25",
        heroGlow: "bg-sky-500/10",
        selectFocus: "focus:border-sky-500",
        uploadBorder: "border-sky-500/30 hover:border-sky-500/50",
        uploadText: "text-sky-400/80",
        moderateText: "text-sky-400",
        moderateBar: "bg-gradient-to-r from-sky-500 to-sky-300",
        protocolBadge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    orange: {
        accentText: "text-orange-400",
        accentSoft: "bg-orange-500/10",
        accentBorder: "border-orange-500/20",
        accentSubtle: "bg-orange-500/5",
        accentSubtleBorder: "border-orange-500/10",
        accentHover: "hover:bg-orange-400",
        accentBg: "bg-orange-500",
        accentGlow: "shadow-orange-500/25",
        heroGlow: "bg-orange-500/10",
        selectFocus: "focus:border-orange-500",
        uploadBorder: "border-orange-500/30 hover:border-orange-500/50",
        uploadText: "text-orange-400/80",
        moderateText: "text-orange-400",
        moderateBar: "bg-gradient-to-r from-orange-500 to-orange-300",
        protocolBadge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    amber: {
        accentText: "text-amber-400",
        accentSoft: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        accentSubtle: "bg-amber-500/5",
        accentSubtleBorder: "border-amber-500/10",
        accentHover: "hover:bg-amber-400",
        accentBg: "bg-amber-500",
        accentGlow: "shadow-amber-500/25",
        heroGlow: "bg-amber-500/10",
        selectFocus: "focus:border-amber-500",
        uploadBorder: "border-amber-500/30 hover:border-amber-500/50",
        uploadText: "text-amber-400/80",
        moderateText: "text-amber-400",
        moderateBar: "bg-gradient-to-r from-amber-500 to-amber-300",
        protocolBadge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
};

const getAuthToken = (user) =>
    user?.token || localStorage.getItem("token") || user?.accessToken || null;

const mapDBStatusToUI = (dbStatus) => DB_STATUS_TO_UI[dbStatus] || "New";
const mapUIToDBStatus = (uiStatus) => UI_STATUS_TO_DB[uiStatus] || "OPEN";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning, Officer";
    if (hour >= 12 && hour < 17) return "Good Afternoon, Officer";
    if (hour >= 17 && hour < 21) return "Good Evening, Officer";
    return "System Monitoring Active";
};

const uploadAuthorityProof = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.data?.url) {
        throw new Error(result?.message || "Failed to upload resolution proof");
    }

    return result.data.url;
};

const AuthorityIncidentCase = ({
    authorityPath,
    tone = "sky",
    reportPrefix,
    defaultCategory,
    portalLabel,
    criticalNotice,
    affectedUsersMultiplier = 5,
    affectedUsersFallback = 50,
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const theme = THEMES[tone] || THEMES.sky;
    const [incident, setIncident] = useState(null);
    const [status, setStatus] = useState("New");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState("");
    const [saving, setSaving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [resolutionProof, setResolutionProof] = useState(null);

    const statusStyles = useMemo(
        () => ({
            New: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            Accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            "In Progress": theme.protocolBadge,
            Assessment: theme.protocolBadge,
            Resolved: "bg-green-500/10 text-green-400 border-green-500/20",
            "Work Completed": "bg-green-500/10 text-green-400 border-green-500/20",
            Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
            Reopened: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
            Revoked: "bg-gray-500/10 text-gray-300 border-gray-500/20",
        }),
        [theme.protocolBadge],
    );

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = getAuthToken(user);
                if (!token) {
                    throw new Error("Authentication required");
                }

                const response = await fetch(`/api/v1/incidents/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json().catch(() => null);

                if (!response.ok || !result?.data) {
                    throw new Error(result?.message || "Failed to fetch incident details");
                }

                setIncident(result.data);
                setStatus(mapDBStatusToUI(result.data.status));
                setResolutionProof(
                    ["Resolved", "Work Completed", "Assessment"].includes(mapDBStatusToUI(result.data.status))
                        ? (result.data.resolutionImage || null)
                        : null
                );
            } catch (fetchError) {
                console.error(fetchError);
                setError(fetchError.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchIncident();
        }
    }, [id, user]);

    const updateDBStatus = async (nextUiStatus, options = {}) => {
        const { authorityMessage = undefined, nextResolutionProof = undefined } = options;

        try {
            setSaving(true);
            setActionError("");

            const token = getAuthToken(user);
            if (!token) {
                throw new Error("Authentication required");
            }

            const payload = { status: mapUIToDBStatus(nextUiStatus) };
            if (authorityMessage !== undefined) {
                payload.authorityMessage = authorityMessage;
            }
            if (nextResolutionProof) {
                payload.resolutionImage = nextResolutionProof;
            }

            const response = await fetch(`/api/v1/authority/${authorityPath}/incidents/${id}/status`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.data) {
                throw new Error(result?.message || "Failed to update incident status");
            }

            setIncident(result.data);
            setStatus(mapDBStatusToUI(result.data.status));
            setResolutionProof(
                ["Resolved", "Work Completed", "Assessment"].includes(mapDBStatusToUI(result.data.status))
                    ? (result.data.resolutionImage || nextResolutionProof || null)
                    : null
            );
            return true;
        } catch (updateError) {
            console.error(updateError);
            setActionError(updateError.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleAccept = () => {
        updateDBStatus("Accepted");
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;

        const didUpdate = await updateDBStatus("Rejected", {
            authorityMessage: rejectReason.trim(),
        });

        if (didUpdate) {
            setIsRejecting(false);
        }
    };

    const handleStatusSelectChange = (event) => {
        const selected = event.target.value;
        if (selected === "Reopened") return;
        if (selected === "Resolved") {
            // Show upload UI locally — backend update happens only after proof is uploaded
            setStatus("Resolved");
            setResolutionProof(null);
            setUploadFile(null);
            return;
        }
        // For Accepted or In Progress, clear the resolution proof locally too
        setResolutionProof(null);
        updateDBStatus(selected);
    };

    const handleUploadResolution = async () => {
        if (!uploadFile) return;

        try {
            setSaving(true);
            setActionError("");
            const uploadedUrl = await uploadAuthorityProof(uploadFile);
            const didUpdate = await updateDBStatus("Resolved", {
                nextResolutionProof: uploadedUrl,
            });

            if (didUpdate) {
                setUploadFile(null);
            }
        } catch (uploadError) {
            console.error(uploadError);
            setActionError(uploadError.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-[50vh] flex justify-center items-center ${theme.accentText}`}>
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    if (error || !incident) {
        return (
            <div className="min-h-[50vh] flex justify-center items-center text-red-400">
                <AlertTriangle size={40} className="mr-3" />
                {error || "Failed to load case details."}
            </div>
        );
    }

    const currentStatusStyle = statusStyles[status] || statusStyles.New;
    const caseIdLabel = incident.reportId || `#${reportPrefix}-${incident._id.substring(incident._id.length - 4).toUpperCase()}`;
    const formattedDate = new Date(incident.createdAt).toLocaleDateString();
    const formattedTime = new Date(incident.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const urgencyScore = Math.max(0, Math.min(100, incident.urgencyScore || 0));
    const affectedUsers = urgencyScore > 20
        ? Math.round(urgencyScore * affectedUsersMultiplier)
        : affectedUsersFallback;
    const evidenceImages = Array.isArray(incident.images)
        ? incident.images
        : incident.image
            ? [incident.image]
            : [];
    const showOperationalProtocol = ["Accepted", "In Progress", "Resolved", "Reopened"].includes(status);
    const showReopenBanner = status === "Reopened";
    const selectValue = status === "Reopened" ? "Reopened" : status;
    const severityText = urgencyScore >= 75 ? "Critical" : urgencyScore >= 50 ? "High" : "Moderate";
    const severityClass = urgencyScore >= 75 ? "text-red-400" : urgencyScore >= 50 ? theme.moderateText : theme.accentText;
    const progressBarClass = urgencyScore >= 75
        ? "bg-red-500"
        : urgencyScore >= 50
            ? theme.accentBg
            : theme.moderateBar;

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden"
            >
                <div className={`absolute right-0 top-0 w-64 h-64 ${theme.heroGlow} blur-[100px] rounded-full pointer-events-none`} />

                <div className="relative z-10">
                    <div className="flex flex-col mb-4">
                        <span className={`text-xs uppercase tracking-[0.3em] ${theme.accentText} font-bold mb-1`}>
                            {getGreeting()}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                            {portalLabel}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 w-fit ${currentStatusStyle}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                            Status: {status.toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                        Case {caseIdLabel}
                    </h1>
                    <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 ${theme.accentSoft} ${theme.accentText} border ${theme.accentBorder} rounded-lg text-sm font-bold`}>
                            {incident.category || defaultCategory}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-lg text-sm font-medium">
                            {incident.title || "Undisclosed Issue"}
                        </span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                    >
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <MapPin className={theme.accentText} size={20} />
                            Location Information Registry
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location Registry</p>
                                <p className="text-white font-medium">{incident.address || "Location Unavailable"}</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Submission Date</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Calendar size={14} className="text-gray-400" />
                                    {formattedDate} <span className="text-gray-500 ml-1">{formattedTime}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Info className={theme.accentText} size={20} />
                            Incident Narrative
                        </h3>
                        <div className={`${theme.accentSubtle} border ${theme.accentSubtleBorder} rounded-xl p-4`}>
                            <p className="text-gray-300 leading-relaxed font-medium mb-4">
                                "{incident.description || "No detailed narrative provided by the reporter."}"
                            </p>
                            {evidenceImages.length > 0 && (
                                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                                    {evidenceImages.map((imageUrl, index) => (
                                        <img
                                            key={`${imageUrl}-${index}`}
                                            src={imageUrl}
                                            alt={`Incident evidence ${index + 1}`}
                                            className="h-32 rounded-lg border border-white/10 object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6"
                    >
                        {actionError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 font-medium">
                                {actionError}
                            </div>
                        )}

                        {status === "New" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Primary Acceptance</h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAccept}
                                        disabled={saving}
                                        className={`flex-1 py-3 ${theme.accentBg} ${theme.accentHover} disabled:opacity-60 text-white rounded-xl font-bold shadow-lg ${theme.accentGlow} transition-all flex items-center justify-center gap-2`}
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        Accept Complaint
                                    </button>
                                    <button
                                        onClick={() => setIsRejecting(true)}
                                        disabled={saving}
                                        className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-60 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject Case File
                                    </button>
                                </div>

                                {isRejecting && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                                        <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                                            Provide mandatory operational reason for rejection*
                                        </label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(event) => setRejectReason(event.target.value)}
                                            className="w-full bg-black/40 border border-red-500/20 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500 mb-3"
                                            rows={3}
                                            placeholder="State reason here..."
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setIsRejecting(false)}
                                                className="px-4 py-2 text-sm text-gray-400 hover:text-white font-bold"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                disabled={!rejectReason.trim() || saving}
                                                className="px-6 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/25"
                                            >
                                                {saving ? "Saving..." : "Confirm Reject"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {showReopenBanner && (
                            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-bold">
                                <AlertTriangle size={20} />
                                The citizen marked this issue as still unresolved. Please resume the case workflow.
                            </div>
                        )}

                        {showOperationalProtocol && (
                            <div className="pt-2">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <UserCheck className={theme.accentText} size={20} />
                                    Operational Protocol
                                </h3>

                                <div className="bg-black/20 border border-white/5 rounded-xl p-5 mb-6">
                                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">
                                        Authority Status Update
                                    </label>
                                    <select
                                        value={selectValue}
                                        onChange={handleStatusSelectChange}
                                        disabled={saving}
                                        className={`w-full appearance-none bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-3 pr-8 focus:outline-none ${theme.selectFocus} cursor-pointer disabled:opacity-60`}
                                    >
                                        {status === "Reopened" && <option value="Reopened" className="bg-neutral-900">Reopened</option>}
                                        <option value="Accepted" className="bg-neutral-900">Accepted</option>
                                        <option value="In Progress" className="bg-neutral-900">In Progress</option>
                                        <option value="Resolved" className="bg-neutral-900">Resolved</option>
                                    </select>
                                </div>

                                {status === "Resolved" && !resolutionProof && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`${theme.accentSoft} border ${theme.accentBorder} rounded-xl p-5 mb-6`}
                                    >
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upload Resolution Proof</p>
                                            <p className={`text-sm ${theme.uploadText}`}>
                                                Please upload a photo showing the resolved issue (.jpg, .jpeg, .png)
                                            </p>
                                            <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${theme.uploadBorder} bg-black/20 rounded-xl cursor-pointer transition-colors group`}>
                                                <Upload size={28} className={`${theme.accentText} opacity-50 group-hover:opacity-100 mb-3 transition-opacity`} />
                                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                                    {uploadFile ? uploadFile.name : "Upload Image Button"}
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".jpg,.jpeg,.png"
                                                    onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                                                />
                                            </label>

                                            <button
                                                onClick={handleUploadResolution}
                                                disabled={!uploadFile || saving}
                                                className="w-full py-3.5 mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex justify-center items-center gap-2"
                                            >
                                                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                                                Send Resolution Proof
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {resolutionProof && ["Resolved", "Work Completed", "Assessment"].includes(status) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4"
                            >
                                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                                    <CheckCircle size={20} />
                                    Resolution Proof Attached
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resolution Proof</p>
                                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-emerald-500/30">
                                        <img src={resolutionProof} alt="Resolution proof" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {status === "Rejected" && (
                            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 font-bold">
                                <XCircle size={20} />
                                Case Rejected Operations: {incident.authorityMessage || incident.rejectionReason || "N/A"}
                            </div>
                        )}

                        {status === "Revoked" && (
                            <div className="p-5 bg-gray-500/10 border border-gray-500/20 rounded-xl flex items-center gap-3 text-gray-300 font-bold">
                                <XCircle size={20} />
                                Reporter revoked this case before authority acceptance.
                            </div>
                        )}

                        {status === "Assessment" && (
                            <div className={`p-5 ${theme.accentSoft} border ${theme.accentBorder} rounded-xl flex items-center gap-3 text-white font-medium`}>
                                <Info size={20} className={theme.accentText} />
                                The case is awaiting final citizen confirmation.
                            </div>
                        )}

                        {status === "Work Completed" && (
                            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-300 font-medium">
                                <CheckCircle size={20} />
                                The citizen has confirmed that the issue is resolved.
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group"
                    >
                        <h3 className="text-lg font-bold text-white mb-6">Impact Analytics</h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Impact Estimator</p>
                                <div className="flex items-end gap-2">
                                    <Users size={28} className={theme.accentText} />
                                    <span className="text-3xl font-black text-white leading-none">{affectedUsers}</span>
                                    <span className="text-gray-400 font-medium mb-1">Users Affected</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>Urgency Score</span>
                                    <span className={`font-bold ${severityClass}`}>{severityText}</span>
                                </p>
                                <div className="text-3xl font-black text-white mb-3">
                                    {urgencyScore}
                                    <span className="text-lg text-gray-500">/100</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${urgencyScore}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${progressBarClass}`}
                                    />
                                </div>
                            </div>

                            {urgencyScore >= 75 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400">
                                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold leading-tight pt-0.5">{criticalNotice}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityIncidentCase;

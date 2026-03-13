import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, User, Users, AlertTriangle,
  ExternalLink, CheckCircle, Clock, ThumbsUp, Tag, Shield, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../../context/UserContext";

const AdminIncidentDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const response = await axios.get(`/api/v1/admin/incident/${reportId}`, config);
        if (response.data.success) {
          setIncident(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching incident:", err);
        setError("Incident not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token && reportId) fetchIncident();
  }, [user?.token, reportId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={32} className="animate-spin text-emerald-500" />
    </div>
  );

  if (error || !incident) return (
    <div className="max-w-2xl mx-auto pt-10 text-center">
      <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <AlertTriangle size={48} className="mx-auto text-gray-500 mb-4 opacity-40" />
        <h2 className="text-xl font-bold text-white mb-2">Incident Not Found</h2>
        <p className="text-gray-400 mb-6">{error || "The incident you are looking for does not exist."}</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 text-white rounded-xl font-bold"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}>
          Go Back
        </motion.button>
      </div>
    </div>
  );

  const statusStyles = {
    OPEN: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.15)" },
    ACCEPTED: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.15)" },
    IN_PROGRESS: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.15)" },
    RESOLVED: { bg: "rgba(16,185,129,0.08)", color: "#10b981", border: "rgba(16,185,129,0.15)" },
    VERIFIED: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.15)" },
    CLOSED: { bg: "rgba(107,114,128,0.08)", color: "#6b7280", border: "rgba(107,114,128,0.15)" },
    REJECTED: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.15)" },
  };
  const ss = statusStyles[incident.status] || statusStyles.OPEN;

  const urgencyScore = (incident.upvotes || 0) + (incident.urgencyScore || 1);
  const urgencyLevel = urgencyScore >= 10 ? "CRITICAL" : urgencyScore >= 5 ? "HIGH" : urgencyScore >= 2 ? "MEDIUM" : "LOW";
  const urgencyColors = {
    CRITICAL: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
    HIGH: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
    MEDIUM: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.15)" },
    LOW: { bg: "rgba(107,114,128,0.08)", color: "#6b7280", border: "rgba(107,114,128,0.15)" },
  };
  const uc = urgencyColors[urgencyLevel];

  const authorityLabels = { WATER: "Water Supply", ELECTRICITY: "Power Sector", CIVIL: "Civil & Roads" };

  return (
    <motion.div className="max-w-4xl mx-auto pb-12 space-y-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>

      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-white">Incident Details</h1>
          <span className="text-sm text-gray-500 font-mono">{incident.reportId}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-[2rem] overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" }}>

        {/* Status Banner */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
          style={{ background: ss.bg, borderBottom: `1px solid ${ss.border}` }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5"
              style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
              <span className={`w-1.5 h-1.5 rounded-full ${incident.status === "OPEN" ? "animate-pulse" : ""}`}
                style={{ background: ss.color }}></span>
              {incident.status.replace("_", " ")}
            </span>

            {/* Urgency Badge */}
            <span className="px-3 py-1.5 rounded-xl text-xs font-black tracking-wider flex items-center gap-1.5"
              style={{ background: uc.bg, color: uc.color, border: `1px solid ${uc.border}` }}>
              {(urgencyLevel === "CRITICAL" || urgencyLevel === "HIGH") && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ background: uc.color }}></span>
                  <span className="relative rounded-full h-1.5 w-1.5" style={{ background: uc.color }}></span>
                </span>
              )}
              {urgencyLevel} URGENCY
            </span>

            {incident.assignedAuthority && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Shield size={10} className="inline mr-1" />
                {authorityLabels[incident.assignedAuthority] || incident.assignedAuthority}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} /> {new Date(incident.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">

          {/* Title & Description */}
          <div>
            <h2 className="text-2xl font-black text-white mb-3">{incident.title}</h2>
            {incident.description && (
              <p className="text-gray-300 leading-relaxed">{incident.description}</p>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reporter */}
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                <User size={14} />
                <span className="text-[10px] font-bold uppercase">Reporter</span>
              </div>
              <p className="text-white font-bold text-sm">{incident.reportedBy?.name || "Anonymous"}</p>
              <p className="text-gray-500 text-xs">{incident.reportedBy?.email || "—"}</p>
            </div>

            {/* Category */}
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                <Tag size={14} />
                <span className="text-[10px] font-bold uppercase">Category</span>
              </div>
              <p className="text-white font-bold text-sm">{incident.category}</p>
              {incident.subCategory && <p className="text-gray-500 text-xs">{incident.subCategory}</p>}
            </div>

            {/* Upvotes */}
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                <ThumbsUp size={14} />
                <span className="text-[10px] font-bold uppercase">Community Impact</span>
              </div>
              <p className="text-white font-black text-2xl tabular-nums">{incident.upvotes || 0}</p>
              <p className="text-gray-500 text-xs">citizens affected</p>
            </div>

            {/* Location */}
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                <MapPin size={14} />
                <span className="text-[10px] font-bold uppercase">Location</span>
              </div>
              <p className="text-white font-bold text-sm line-clamp-2">{incident.address || "Not provided"}</p>
              {incident.location?.coordinates && (
                <p className="text-gray-500 text-[10px] font-mono mt-1">
                  {incident.location.coordinates[1]?.toFixed(5)}, {incident.location.coordinates[0]?.toFixed(5)}
                </p>
              )}
            </div>
          </div>

          {/* User Image */}
          {incident.image && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <User size={12} /> Reported Image
              </p>
              <div className="relative rounded-xl overflow-hidden cursor-pointer group"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                onClick={() => window.open(incident.image, "_blank")}>
                <img src={incident.image} alt="Reported issue"
                  className="w-full max-h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="backdrop-blur-sm bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <ExternalLink size={14} /> View Full Image
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Section */}
          {(incident.resolutionImage || incident.authorityMessage) && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-500" /> Authority Response
              </p>
              {incident.authorityMessage && (
                <div className="rounded-xl p-4 mb-4"
                  style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <p className="text-gray-300 italic">"{incident.authorityMessage}"</p>
                </div>
              )}
              {incident.resolutionImage && (
                <div className="relative rounded-xl overflow-hidden cursor-pointer group"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => window.open(incident.resolutionImage, "_blank")}>
                  <img src={incident.resolutionImage} alt="Resolution proof"
                    className="w-full max-h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="backdrop-blur-sm bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <ExternalLink size={14} /> View Full Image
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {incident.rejectionReason && (
            <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
              <p className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
                <AlertTriangle size={12} /> Rejection Reason
              </p>
              <p className="text-gray-300">"{incident.rejectionReason}"</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminIncidentDetail;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReports } from "../context/ReportContext";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    reports,
    loading,
    respondToResolution,
    revokeReport,
    fetchReportById,
  } = useReports();

  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const report = useMemo(
    () =>
      reports.find(
        (item) =>
          item.id?.toString() === id ||
          item.reportId === id ||
          item.displayId === id ||
          item.displayId?.replace("#", "") === id,
      ) || null,
    [id, reports],
  );

  useEffect(() => {
    if (report || loading || !id) {
      return undefined;
    }

    let isMounted = true;
    setIsFetchingDetails(true);
    setDetailsError("");

    fetchReportById(id).then((result) => {
      if (!isMounted) return;
      if (!result.success) {
        setDetailsError(result.message || "Failed to load report details.");
      }
      setIsFetchingDetails(false);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchReportById, id, loading, report]);

  const handleVerify = async () => {
    if (!report) return;

    setFeedbackError("");
    setIsSubmittingFeedback(true);
    const result = await respondToResolution(report.id, "confirm_resolved");
    setIsSubmittingFeedback(false);

    if (!result.success) {
      setFeedbackError(result.message || "Failed to close this case.");
    }
  };

  const handleReopen = async () => {
    if (!report) return;

    setFeedbackError("");
    setIsSubmittingFeedback(true);
    const result = await respondToResolution(report.id, "reject_resolution");
    setIsSubmittingFeedback(false);

    if (!result.success) {
      setFeedbackError(result.message || "Failed to reopen this case.");
    }
  };

  const handleRevoke = async () => {
    if (!report) return;

    setRevokeError("");
    setIsRevoking(true);
    const result = await revokeReport(report.id);
    setIsRevoking(false);

    if (!result.success) {
      setRevokeError(result.message || "Failed to revoke this case.");
      return;
    }

    setShowRevokeConfirm(false);
  };

  if (loading || isFetchingDetails) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card rounded-[2rem] min-h-[180px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full max-w-2xl mx-auto pt-20 text-center">
        <div className="glass-card p-8 rounded-[2rem]">
          <AlertTriangle size={48} className="mx-auto text-wayanad-muted mb-4 opacity-40" />
          <h2 className="text-xl font-bold text-wayanad-text mb-2">Case Not Found</h2>
          <p className="text-wayanad-muted mb-6">
            {detailsError || "This case could not be loaded, or you no longer have access to it."}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/my-reports")}
            className="px-6 py-2.5 text-white rounded-xl font-bold"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            Back to Case Tracker
          </motion.button>
        </div>
      </div>
    );
  }

  const latestAuthorityUpdate = report.latestAuthorityUpdate;
  const readOnlyMessage = report.rawStatus === "CLOSED"
    ? "You confirmed the authority's fix, so this case is fully closed."
    : report.rawStatus === "REJECTED"
      ? report.rejectionReason || report.authorityMessage || "The authority rejected this issue."
      : "You revoked this issue before the authority accepted it.";

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto pb-16 space-y-6 pt-2 md:pt-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div className="text-sm font-medium mb-2 hidden md:flex items-center">
        <span className="text-wayanad-muted hover:text-wayanad-text cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
        <span className="mx-2 text-wayanad-muted/40">›</span>
        <span className="text-wayanad-muted hover:text-wayanad-text cursor-pointer" onClick={() => navigate('/my-reports')}>Reports</span>
        <span className="mx-2 text-wayanad-muted/40">›</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{report.displayId}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-wayanad-text"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </motion.button>
          <h1 className="text-3xl md:text-4xl font-black text-wayanad-text tracking-tight">Case Tracker</h1>
        </div>


      </div>

      <div className="grid lg:grid-cols-[1.8fr_1fr] gap-6 xl:gap-8 relative z-10">
        <div className="space-y-6">
          <div className="glass-card relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 border border-white/10 group">
            {/* Cinematic Background Glows */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <span className="text-[11px] font-black px-4 py-2 rounded-2xl bg-white/5 text-wayanad-muted border border-white/10 uppercase tracking-[0.2em] shadow-inner backdrop-blur-md">
                  CASE ID: {report.displayId}
                </span>
                <span className={`text-[11px] font-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner backdrop-blur-md ${report.statusColor}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {report.status}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-50 to-emerald-200 tracking-tight mb-4 drop-shadow-sm leading-tight">
                {report.issue}
              </h2>
              <p className="text-emerald-100/70 text-lg leading-relaxed max-w-2xl mb-10 font-medium">
                {report.description || "No additional description was provided for this case."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 relative">
                <div className="absolute top-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-emerald-500/50 to-transparent" />
                
                <div className="group/stat">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-black mb-2 group-hover/stat:text-emerald-400 transition-colors">Submitted</p>
                  <p className="text-base font-black text-emerald-50 drop-shadow-md">{report.submittedDateTime.split(',')[0]}</p>
                </div>
                <div className="group/stat">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/60 font-black mb-2 group-hover/stat:text-cyan-400 transition-colors">Last Update</p>
                  <p className="text-base font-black text-emerald-50 drop-shadow-md">{report.lastUpdatedDateTime.split(',')[0]}</p>
                </div>
                <div className="group/stat">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-purple-500/60 font-black mb-2 group-hover/stat:text-purple-400 transition-colors">Assigned Authority</p>
                  <p className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-md">{report.authorityLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-6 md:p-10 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-10 relative z-10">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Clock3 size={22} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Case Progress</h3>
            </div>

            <div className="relative pl-8 border-l-2 border-dashed border-white/10 space-y-12 ml-4">
              {report.statusHistory.map((entry, index) => {
                const isLatest = index === report.statusHistory.length - 1;
                const isCompleted = !isLatest || report.rawStatus === "CLOSED" || report.rawStatus === "REJECTED";

                return (
                  <motion.div 
                    key={entry.id} 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                  >
                    <div className={`absolute -left-[43px] top-1 w-6 h-6 rounded-full flex items-center justify-center 
                      ${isCompleted ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-[#0f172a] border-2 border-emerald-500 text-emerald-400"} 
                      ring-4 ring-[#0f172a] transition-all duration-500 hover:scale-110`}>
                      {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                    </div>

                    <div className="pl-6 group/item">
                      <h4 className={`text-lg font-black mb-1 flex items-center gap-2 ${isLatest && !isCompleted ? "text-emerald-300" : "text-emerald-50"}`}>
                        {entry.status}
                      </h4>
                      <div className="text-[11px] font-bold text-wayanad-muted/60 uppercase tracking-[0.1em] mb-3">
                        {entry.changedAtLabel}
                      </div>

                      {entry.note ? (
                        <div className={`p-5 rounded-2xl mt-4 text-sm ${isLatest && !isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-white/5 border border-white/5 text-emerald-100/70 hover:bg-white/10 transition-colors'}`}>
                          {entry.note}
                          {entry.proofImage && (
                            <button
                              onClick={() => window.open(entry.proofImage, "_blank")}
                              className="mt-3 text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                              <ExternalLink size={12} /> View attached evidence
                            </button>
                          )}
                        </div>
                      ) : (
                        isLatest && !isCompleted && (
                          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 mt-2 text-sm italic text-wayanad-muted animate-pulse">
                            Processing update...
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0f4d36] dark:bg-[#0b3324] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <ShieldCheck size={22} className="text-emerald-300" strokeWidth={2.5} />
              <h3 className="text-lg font-black uppercase tracking-widest text-white">Authority Update</h3>
            </div>

            <div className="bg-black/20 dark:bg-black/30 rounded-2xl p-6 mb-6 relative z-10 border border-white/5">
              <p className="text-[17px] font-medium leading-relaxed italic text-emerald-50">
                {latestAuthorityUpdate ? `"${latestAuthorityUpdate.note || 'Authority action pending - The authority still needs to pick up and review this issue.'}"` : '"Authority action pending - The authority still needs to pick up and review this issue."'}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-black/10 dark:bg-black/20 rounded-xl px-4 py-3 w-max relative z-10 border border-white/5">
              <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-[#0f4d36] font-bold text-xs italic">i</div>
              <span className="text-sm text-emerald-100">Typical response time for this category is 48 hours.</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-[#1c1212] border border-red-100 dark:border-red-900/40 rounded-3xl p-6 shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-red-800 dark:text-red-400/80 font-black mb-4">Case Management</p>

            {report.canRevoke ? (
              <>
                <p className="text-[13px] text-red-900/80 dark:text-red-200/60 mb-6 leading-relaxed">
                  You can revoke this case if the issue has been resolved independently or was reported in error.
                </p>

                <AnimatePresence mode="wait">
                  {!showRevokeConfirm ? (
                    <motion.button
                      key="revoke-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowRevokeConfirm(true)}
                      className="w-full py-3.5 rounded-xl bg-red-100 dark:bg-red-900/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-800 dark:text-red-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-red-200 dark:border-red-900/80 shadow-sm"
                    >
                      <XCircle size={18} strokeWidth={2.5} />
                      Revoke Case
                    </motion.button>
                  ) : (
                    <motion.div
                      key="revoke-confirm"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="space-y-4"
                    >
                      <p className="text-[13px] font-bold text-red-900 dark:text-red-200">Are you absolutely sure?</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleRevoke} disabled={isRevoking} className="py-2.5 rounded-xl bg-red-600 dark:bg-red-700 text-white text-sm font-bold hover:bg-red-700 dark:hover:bg-red-600 shadow-sm">
                          {isRevoking ? "Revoking..." : "Confirm"}
                        </button>
                        <button onClick={() => setShowRevokeConfirm(false)} className="py-2.5 rounded-xl bg-red-200/60 dark:bg-red-900/40 text-red-900 dark:text-red-200 text-sm font-bold border border-red-200 dark:border-red-900/50 hover:bg-red-300/50 dark:hover:bg-red-900/60">
                          Cancel
                        </button>
                      </div>
                      {revokeError && <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-2">{revokeError}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : report.canRespondToResolution ? (
              <>
                <p className="text-[13px] text-emerald-900/80 dark:text-emerald-200/60 mb-6 leading-relaxed">
                  The authority considers this issue resolved. Please verify the fix or reopen the case.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleVerify} disabled={isSubmittingFeedback} className="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors flex justify-center items-center">Verify</button>
                  <button onClick={handleReopen} disabled={isSubmittingFeedback} className="py-3 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 text-sm font-bold transition-colors flex justify-center items-center">Reopen</button>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-wayanad-muted dark:text-wayanad-muted/80 leading-relaxed">
                {readOnlyMessage || "No direct actions available at this stage."}
              </p>
            )}
          </div>

          <div className="glass-card border border-white/5 rounded-3xl p-6 shadow-sm group">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <AlertTriangle size={16} className="text-emerald-500" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-wayanad-text font-black">Original Evidence</p>
            </div>

            {report.image ? (
              <div className="space-y-4">
                <div
                  className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl cursor-pointer group/image"
                  onClick={() => window.open(report.image, '_blank')}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 pointer-events-none group-hover/image:border-emerald-500/50 transition-colors duration-500"></div>
                  <img src={report.image} alt="Evidence" className="w-full h-full object-cover relative z-0 group-hover/image:scale-105 transition-transform duration-[800ms] ease-out" />
                  
                  <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover/image:translate-y-0">
                    <div className="bg-emerald-500/80 backdrop-blur-md text-white p-2 rounded-xl shadow-lg flex items-center gap-2">
                       <span className="text-xs font-bold tracking-wider">VIEW FULL</span>
                       <ExternalLink size={14} />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-mono font-bold text-emerald-500/60 flex items-center gap-2 pt-2 px-1 uppercase">
                  <div className="w-3 h-4 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-sm flex items-center justify-center border border-emerald-500/30">
                    <div className="w-1.5 h-[2px] bg-emerald-600 dark:bg-emerald-400"></div>
                  </div>
                  IMG_2026{(report.id || "1214").toString().padStart(4, '0')}.jpg
                </p>
              </div>
            ) : (
              <div className="aspect-[4/3] w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-wayanad-muted gap-3 bg-slate-100/50 dark:bg-black/20">
                <AlertTriangle size={24} className="opacity-40" />
                <p className="text-sm font-medium">No original evidence</p>
              </div>
            )}
          </div>

          <div className="glass-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <MapPin size={16} className="text-cyan-500" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-wayanad-text font-black">Categorization</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                  <MapPin size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-black mb-1.5">Location</p>
                  <p className="text-base font-black text-wayanad-text group-hover:text-emerald-50 transition-colors">{report.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                  <div className="w-4 h-4 rounded bg-cyan-400 group-hover:rotate-45 transition-transform duration-500"></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/60 font-black mb-1.5">Category</p>
                  <p className="text-base font-black text-wayanad-text group-hover:text-cyan-50 transition-colors">{report.category}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card border border-emerald-500/20 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700"></div>

            {(report.supportCount || 0) > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-900/50 shadow-md"></div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-900/50 shadow-md"></div>
                    <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-emerald-900/50 shadow-md"></div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-[11px] font-black text-emerald-400 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      +{report.supportCount}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-500/80">Community Power</span>
                </div>

                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-300 leading-snug mb-4 relative z-10">
                  {report.supportCount} other {report.supportCount === 1 ? 'citizen stands' : 'citizens stand'} with you.
                </p>

                <p className="text-sm text-emerald-400/70 font-medium leading-relaxed relative z-10">
                  High community volume forces automated priority escalation in the authority queue.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="text-sm uppercase tracking-[0.2em] font-black text-emerald-500/80">Community Support</h3>
                </div>
                
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-300 leading-snug mb-4 relative z-10">
                  Be the first to stand behind this case.
                </p>
                
                <p className="text-sm text-emerald-400/70 font-medium leading-relaxed relative z-10">
                  Community support drives faster authority response times and builds public pressure.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportDetails;

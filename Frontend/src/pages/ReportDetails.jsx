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
          <div className="bg-white dark:bg-[#111c1c] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-wayanad-muted border border-slate-200 dark:border-white/10 uppercase tracking-wider">
                CASE ID: {report.displayId}
              </span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${report.statusColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {report.status}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-wayanad-text tracking-tight mb-3">
              {report.issue}
            </h2>
            <p className="text-wayanad-text/80 text-base leading-relaxed max-w-2xl mb-8">
              {report.description || "No additional description was provided for this case."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-wayanad-muted font-bold mb-1.5">Submitted</p>
                <p className="text-sm font-bold text-wayanad-text">{report.submittedDateTime.split(',')[0]}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-wayanad-muted font-bold mb-1.5">Last Update</p>
                <p className="text-sm font-bold text-wayanad-text">{report.lastUpdatedDateTime.split(',')[0]}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-wayanad-muted font-bold mb-1.5">Assigned Authority</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{report.authorityLabel}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#111c1c] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Clock3 size={20} className="text-wayanad-text" strokeWidth={2.5} />
              <h3 className="text-xl font-black text-wayanad-text">Case Progress</h3>
            </div>

            <div className="relative pl-6 border-l-[1.5px] border-slate-300 dark:border-slate-800 space-y-10 ml-2">
              {report.statusHistory.map((entry, index) => {
                const isLatest = index === report.statusHistory.length - 1;
                const isCompleted = !isLatest || report.rawStatus === "CLOSED" || report.rawStatus === "REJECTED";

                return (
                  <div key={entry.id} className="relative">
                    <div className={`absolute -left-[35px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center 
                      ${isCompleted ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-[#111c1c] border-[3px] border-emerald-500 text-emerald-500"} 
                      shadow-[0_0_0_8px_rgb(248,250,252)] dark:shadow-[0_0_0_8px_#111c1c]`}>
                      {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    </div>

                    <div className="pl-6">
                      <h4 className={`text-[15px] font-bold mb-1 flex items-center gap-2 ${isLatest && !isCompleted ? "text-wayanad-text" : "text-wayanad-text"}`}>
                        {entry.status}
                      </h4>
                      <div className="text-xs text-wayanad-muted/80 mb-2">
                        {entry.changedAtLabel}
                      </div>

                      {entry.note ? (
                        <div className={`p-4 rounded-xl mt-3 text-sm ${isLatest && !isCompleted ? 'italic text-wayanad-muted' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-wayanad-text/90 shadow-sm leading-relaxed'}`}>
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
                          <div className="mt-2 text-sm italic text-wayanad-muted">
                            In progress... expected within 48h
                          </div>
                        )
                      )}
                    </div>
                  </div>
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

          <div className="bg-slate-50 dark:bg-[#111c1c] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-wayanad-muted font-black mb-5">Original Evidence</p>

            {report.image ? (
              <div className="space-y-4">
                <div
                  className="relative aspect-[4/3] w-full bg-[#1b433b] dark:bg-[#183932] rounded-3xl p-4 overflow-hidden shadow-inner cursor-pointer group"
                  onClick={() => window.open(report.image, '_blank')}
                >
                  <div className="absolute inset-0 m-4 border-2 border-emerald-500/20 dark:border-white/10 rounded-2xl z-20 pointer-events-none"></div>
                  <img src={report.image} alt="Evidence" className="w-full h-full object-cover rounded-2xl shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-[600ms] ease-out" />
                </div>
                <p className="text-xs font-mono text-wayanad-muted flex items-center gap-2 pt-1 pl-1">
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

          <div className="bg-slate-50 dark:bg-[#111c1c] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-7 shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-wayanad-muted font-black mb-6">Categorization</p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-300/50 dark:border-white/5">
                  <MapPin size={16} className="text-wayanad-text" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-wayanad-muted font-bold mb-1">Location</p>
                  <p className="text-sm font-black text-wayanad-text">{report.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-300/50 dark:border-white/5">
                  <div className="w-3 h-3.5 bg-wayanad-text rounded-t-full rounded-bl-full rotate-45"></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-wayanad-muted font-bold mb-1">Category</p>
                  <p className="text-sm font-black text-wayanad-text">{report.category}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-[#112722] border border-emerald-100 dark:border-[#173a32] rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl rounded-tl-[100px] pointer-events-none"></div>

            {(report.supportCount || 0) > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="flex -space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#111c1c] border-2 border-emerald-50 dark:border-[#112722]"></div>
                    <div className="w-9 h-9 rounded-full bg-[#1a2f2b] border-2 border-emerald-50 dark:border-[#112722]"></div>
                    <div className="w-9 h-9 rounded-full bg-[#2a4540] border-2 border-emerald-50 dark:border-[#112722]"></div>
                    <div className="w-9 h-9 rounded-full bg-emerald-200 dark:bg-white/10 border-2 border-emerald-50 dark:border-[#112722] flex items-center justify-center text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      +{report.supportCount}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-emerald-800 dark:text-emerald-400/80 ml-2">Community Support</span>
                </div>

                <p className="text-[15px] font-black text-emerald-950 dark:text-emerald-100 leading-snug mb-4 relative z-10 pr-2">
                  {report.supportCount} other {report.supportCount === 1 ? 'citizen' : 'citizens'} reported similar issues in this area.
                </p>

                <p className="text-[13px] text-emerald-800/80 dark:text-emerald-300/70 leading-relaxed relative z-10">
                  High community volume increases the priority of this case in the authority's automated queue.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <span className="text-emerald-900 dark:text-emerald-100"><Users size={18} strokeWidth={2.5} /></span>
                  <h3 className="text-[15px] font-black text-emerald-950 dark:text-emerald-100 tracking-tight">Community Support</h3>
                </div>
                
                <p className="text-[14px] text-emerald-900/90 dark:text-emerald-100/90 font-medium leading-snug mb-3 relative z-10">
                  No additional citizen support is attached to this case yet.
                </p>
                
                <p className="text-[13px] text-emerald-800/80 dark:text-emerald-300/70 leading-relaxed relative z-10">
                  Supporters can track progress here, but only the original reporter can revoke or verify the case.
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

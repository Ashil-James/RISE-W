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
      className="w-full max-w-5xl mx-auto pb-16 space-y-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-wayanad-text tracking-tight">Case Tracker</h1>
          <p className="text-sm text-wayanad-muted">Follow every step of this report from submission to closure.</p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6 md:p-7 relative overflow-hidden">
        <div
          className="absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl"
          style={{ background: "rgba(16,185,129,0.12)" }}
        />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {report.displayId}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${report.statusColor}`}>
                {report.status}
              </span>
              {report.isSupporter && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                  Supporting this case
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-wayanad-text tracking-tight mb-3">
              {report.issue}
            </h2>
            <p className="text-wayanad-text/80 text-base leading-relaxed max-w-3xl">
              {report.description || "No additional description was provided for this case."}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 min-w-[280px]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-wayanad-muted font-black mb-3">
              Next Step
            </p>
            <p className="text-lg font-black text-wayanad-text">{report.nextActionLabel}</p>
            <p className="text-sm text-wayanad-muted mt-2">{report.nextActionDescription}</p>
          </div>
        </div>

        <div className="relative z-10 grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">Submitted</p>
            <p className="text-sm font-bold text-wayanad-text flex items-center gap-2">
              <Calendar size={14} className="text-emerald-500" />
              {report.submittedDateTime}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">Last Update</p>
            <p className="text-sm font-bold text-wayanad-text flex items-center gap-2">
              <Clock3 size={14} className="text-emerald-500" />
              {report.lastUpdatedDateTime}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">Assigned Authority</p>
            <p className="text-sm font-bold text-wayanad-text flex items-center gap-2">
              <Building2 size={14} className="text-emerald-500" />
              {report.authorityLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">Community Support</p>
            <p className="text-sm font-bold text-wayanad-text flex items-center gap-2">
              <Users size={14} className="text-emerald-500" />
              {report.supportCount > 0 ? `${report.supportCount} supporters` : "Only your report"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.95fr] gap-6">
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-wayanad-muted font-black mb-3">What This Means</p>
            <p className="text-lg font-bold text-wayanad-text mb-2">{report.statusMeaning}</p>
            <p className="text-sm text-wayanad-muted">
              {report.latestUpdate?.note || report.nextActionDescription}
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-emerald-500" />
              <h3 className="text-lg font-black text-wayanad-text">Authority Update</h3>
            </div>

            {latestAuthorityUpdate ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${latestAuthorityUpdate.badgeClass}`}>
                      {latestAuthorityUpdate.status}
                    </span>
                    <span className="text-xs text-wayanad-muted">
                      {latestAuthorityUpdate.actorLabel} · {latestAuthorityUpdate.changedAtLabel}
                    </span>
                  </div>
                  <p className="text-sm text-wayanad-text leading-relaxed">
                    {latestAuthorityUpdate.note || "No detailed note was attached to this update."}
                  </p>
                </div>

                {(report.authorityProof || latestAuthorityUpdate.proofImage) && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-wayanad-muted mb-3">
                      Resolution Proof
                    </p>
                    <button
                      onClick={() => window.open(report.authorityProof || latestAuthorityUpdate.proofImage, "_blank")}
                      className="w-full rounded-[1.4rem] overflow-hidden border border-white/10 group text-left"
                    >
                      <img
                        src={report.authorityProof || latestAuthorityUpdate.proofImage}
                        alt="Authority proof"
                        className="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="px-4 py-3 flex items-center justify-between bg-black/20 text-sm text-wayanad-text">
                        <span>Open full proof image</span>
                        <ExternalLink size={14} />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-wayanad-muted">
                No authority update is attached to this case yet.
              </div>
            )}
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-emerald-500" />
              <h3 className="text-lg font-black text-wayanad-text">Community Support</h3>
            </div>
            <p className="text-sm text-wayanad-text mb-2">
              {report.communitySummary}
            </p>
            <p className="text-sm text-wayanad-muted">
              Supporters can track progress here, but only the original reporter can revoke or verify the case.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-emerald-500" />
              <h3 className="text-lg font-black text-wayanad-text">Case Details</h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">Location</p>
                <p className="text-sm text-wayanad-text">{report.location}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">Category</p>
                <p className="text-sm text-wayanad-text">{report.category}</p>
              </div>

              {report.image && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-3">Your Upload</p>
                  <button
                    onClick={() => window.open(report.image, "_blank")}
                    className="w-full rounded-[1.4rem] overflow-hidden border border-white/10 group text-left"
                  >
                    <img
                      src={report.image}
                      alt="Reported issue"
                      className="w-full h-56 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="px-4 py-3 flex items-center justify-between bg-black/20 text-sm text-wayanad-text">
                      <span>Open full image</span>
                      <ExternalLink size={14} />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-emerald-500" />
              <h3 className="text-lg font-black text-wayanad-text">Your Actions</h3>
            </div>

            {report.isSupporter ? (
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                You are tracking this case as a supporter. Only the original reporter can revoke it or confirm the resolution.
              </div>
            ) : report.canRespondToResolution ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-wayanad-muted">
                  The authority says this issue is resolved. Confirm the fix if it is real, or reopen the case if the problem remains.
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <motion.button
                    onClick={handleVerify}
                    disabled={isSubmittingFeedback}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  >
                    <CheckCircle2 size={18} />
                    {isSubmittingFeedback ? "Saving..." : "Verify & Close"}
                  </motion.button>
                  <motion.button
                    onClick={handleReopen}
                    disabled={isSubmittingFeedback}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-3 rounded-2xl text-sm font-bold border border-red-500/20 bg-red-500/10 text-red-400 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <XCircle size={18} />
                    {isSubmittingFeedback ? "Saving..." : "Not Fixed"}
                  </motion.button>
                </div>
                {feedbackError && <p className="text-sm text-red-400 font-medium">{feedbackError}</p>}
              </div>
            ) : report.canRevoke ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-wayanad-muted">
                  You can revoke this case only while it is still open and no other resident has supported it yet.
                </div>

                <AnimatePresence mode="wait">
                  {!showRevokeConfirm ? (
                    <motion.button
                      key="revoke-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowRevokeConfirm(true)}
                      className="w-full py-3 rounded-2xl text-sm font-bold border border-red-500/20 bg-red-500/10 text-red-400 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Revoke Case
                    </motion.button>
                  ) : (
                    <motion.div
                      key="revoke-confirmation"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
                    >
                      <p className="text-sm font-bold text-wayanad-text mb-2">Revoke this case?</p>
                      <p className="text-xs text-wayanad-muted mb-4">
                        This action is only available before authority acceptance and before other users support the case.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleRevoke}
                          disabled={isRevoking}
                          className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-60"
                        >
                          {isRevoking ? "Revoking..." : "Yes, revoke"}
                        </button>
                        <button
                          onClick={() => setShowRevokeConfirm(false)}
                          disabled={isRevoking}
                          className="py-2.5 rounded-xl glass-card text-sm font-bold text-wayanad-text disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                      {revokeError && <p className="text-sm text-red-300 mt-3">{revokeError}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : ["CLOSED", "REJECTED", "REVOKED"].includes(report.rawStatus) ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-wayanad-muted">
                {readOnlyMessage}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-wayanad-muted">
                No direct action is required from you right now. You will see updates here as the authority progresses the case.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <h3 className="text-xl font-black text-wayanad-text tracking-tight mb-5">Status Timeline</h3>
        <div className="space-y-4">
          {report.statusHistory.map((entry, index) => {
            const isLatest = index === report.statusHistory.length - 1;

            return (
              <div
                key={entry.id}
                className={`rounded-[1.6rem] border p-5 relative overflow-hidden ${
                  isLatest
                    ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${entry.badgeClass}`}>
                        {entry.status}
                      </span>
                      {isLatest && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-wayanad-text mb-2">{entry.note}</p>
                    <p className="text-sm text-wayanad-muted">
                      {entry.actorLabel} · {entry.changedAtLabel}
                    </p>
                  </div>

                  <div className="text-sm text-wayanad-muted lg:text-right">
                    <p>{entry.changedAgo}</p>
                  </div>
                </div>

                {entry.proofImage && (
                  <button
                    onClick={() => window.open(entry.proofImage, "_blank")}
                    className="mt-4 rounded-[1.2rem] overflow-hidden border border-white/10 group text-left block"
                  >
                    <img
                      src={entry.proofImage}
                      alt={`${entry.status} proof`}
                      className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="px-4 py-3 flex items-center justify-between bg-black/20 text-sm text-wayanad-text">
                      <span>Open attached proof</span>
                      <ExternalLink size={14} />
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportDetails;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, MapPin, Clock } from "lucide-react";
import { useReports } from "../context/ReportContext";
import { motion, AnimatePresence } from "framer-motion";

const MyReports = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");
  const { reports } = useReports();

  const filteredReports = reports.filter((r) => {
    const status = r.status.toLowerCase();
    return filter === "active"
      ? ["open", "in progress", "resolved", "pending"].includes(status)
      : ["closed", "revoked"].includes(status);
  });

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
  const fadeUp = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18 } } };

  return (
    <motion.div className="w-full max-w-3xl mx-auto" variants={stagger} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div className="flex items-center gap-4 mb-8" variants={fadeUp}>
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-wayanad-text">My Reports</h1>
          <p className="text-sm text-wayanad-muted">Track your submitted incidents</p>
        </div>
      </motion.div>

      {/* Glass Tabs */}
      <motion.div className="flex p-1.5 glass-card rounded-2xl mb-6 gap-1" variants={fadeUp}>
        {["active", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === tab
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                : "text-wayanad-muted hover:text-wayanad-text"
              }`}
            style={filter === tab ? { boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" } : {}}
          >
            {tab === "active" ? "Active Issues" : "History"}
          </button>
        ))}
      </motion.div>

      {/* Report Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredReports.length === 0 ? (
            <motion.div
              key="empty"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-20 glass-card rounded-2xl"
            >
              <FileText size={40} className="mx-auto mb-3 text-wayanad-muted opacity-30" />
              <p className="text-wayanad-muted font-medium">No reports found.</p>
            </motion.div>
          ) : (
            filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                variants={fadeUp}
                onClick={() => navigate(`/my-reports/${report.id.replace("#", "")}`)}
                className="glass-card p-5 rounded-2xl cursor-pointer group relative overflow-hidden"
                whileHover={{ y: -3, scale: 1.01 }}
              >
                {/* Hover glow */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 blur-2xl group-hover:opacity-20 transition-opacity duration-500 bg-emerald-500"></div>

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(16,185,129,0.1)" }}>
                        {report.id}
                      </span>
                      <span className="text-xs text-wayanad-muted flex items-center gap-1">
                        <Clock size={10} /> {report.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-wayanad-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {report.issue}
                    </h3>
                    <p className="text-sm text-wayanad-muted mt-0.5 flex items-center gap-1">
                      <MapPin size={12} /> {report.location}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex-shrink-0 ${report.statusColor}`}>
                    {report.status}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MyReports;

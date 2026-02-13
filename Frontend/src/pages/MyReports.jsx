import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useReports } from "../context/ReportContext"; // <--- IMPORT THIS

const MyReports = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");

  // CHANGE 1: Get data from the "Shared Brain" instead of fake local state
  const { reports, updateReportStatus } = useReports();



  const filteredReports = reports.filter((r) => {
    const status = r.status.toLowerCase();
    return filter === "active"
      ? ["open", "in progress", "resolved", "pending"].includes(status)
      : ["closed", "revoked"].includes(status);
  });

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-wayanad-panel transition-colors text-wayanad-muted hover:text-wayanad-text"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-wayanad-text">My Reports</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-wayanad-panel border border-wayanad-border rounded-xl mb-6">
        <button
          onClick={() => setFilter("active")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${filter === "active" ? "bg-emerald-500 text-white shadow-sm" : "text-wayanad-muted hover:text-wayanad-text"}`}
        >
          Active Issues
        </button>
        <button
          onClick={() => setFilter("history")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${filter === "history" ? "bg-emerald-500 text-white shadow-sm" : "text-wayanad-muted hover:text-wayanad-text"}`}
        >
          History
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 text-wayanad-muted border-2 border-dashed border-wayanad-border rounded-2xl">
            <p>No reports found.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate(`/my-reports/${report.id.replace("#", "")}`)}
              className="bg-wayanad-panel border border-wayanad-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      {report.id}
                    </span>
                    <span className="text-xs text-wayanad-muted">
                      • {report.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-wayanad-text group-hover:text-emerald-600 transition-colors">
                    {report.issue}
                  </h3>
                  <p className="text-sm text-wayanad-muted">
                    {report.location}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${report.statusColor}`}
                >
                  {report.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReports;

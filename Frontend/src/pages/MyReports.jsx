import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";

const MyReports = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active"); // 'active' | 'history'

  // Mock Data (Simulating Backend)
  const [reports, setReports] = useState([
    {
      id: "#343387",
      category: "Water Supply",
      issue: "Muddy Water",
      location: "Sector A",
      date: "2 hours ago",
      status: "In Progress", // Open, In Progress, Resolved, Closed
      statusColor: "text-orange-500 bg-orange-500/10",
    },
    {
      id: "#99281",
      category: "Power Issue",
      issue: "Streetlight Failure",
      location: "Main St, Sector B",
      date: "1 day ago",
      status: "Resolved", // Authority marked as fixed
      statusColor: "text-blue-500 bg-blue-500/10",
    },
    {
      id: "#11029",
      category: "Wildlife",
      issue: "Elephant Sighting",
      location: "Forest Edge",
      date: "3 days ago",
      status: "Closed", // User verified & closed
      statusColor: "text-emerald-500 bg-emerald-500/10",
    },
  ]);

  // Handle User Verification
  const handleVerify = (id) => {
    // In real app: API call to update status to 'Closed'
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Closed",
              statusColor: "text-emerald-500 bg-emerald-500/10",
            }
          : r,
      ),
    );
  };

  const handleReopen = (id) => {
    // User unsatisfied -> Reopen ticket
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Open", statusColor: "text-red-500 bg-red-500/10" }
          : r,
      ),
    );
  };

  // Filter Logic
  const filteredReports = reports.filter((r) =>
    filter === "active"
      ? ["Open", "In Progress", "Resolved"].includes(r.status)
      : r.status === "Closed",
  );

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-wayanad-muted hover:text-wayanad-text transition-colors"
        >
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-wayanad-text">My Reports</h1>
        <div className="w-8" /> {/* Spacer for balance */}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-wayanad-panel border border-wayanad-border rounded-xl mb-6">
        <button
          onClick={() => setFilter("active")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${filter === "active" ? "bg-emerald-500 text-white shadow-lg" : "text-wayanad-muted hover:text-wayanad-text"}`}
        >
          Active Issues
        </button>
        <button
          onClick={() => setFilter("history")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${filter === "history" ? "bg-emerald-500 text-white shadow-lg" : "text-wayanad-muted hover:text-wayanad-text"}`}
        >
          History
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 text-wayanad-muted">
            <p>No reports found.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-wayanad-panel border border-wayanad-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded mr-2">
                    {report.id}
                  </span>
                  <span className="text-xs text-wayanad-muted">
                    {report.date}
                  </span>
                  <h3 className="text-lg font-bold text-wayanad-text mt-1">
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

              {/* ACTION AREA - The "Closed Loop" Logic */}
              {report.status === "Resolved" && (
                <div className="mt-4 pt-4 border-t border-wayanad-border animate-fade-up">
                  <p className="text-sm text-wayanad-text mb-3">
                    <span className="font-bold">Authority Update:</span> "Fixed
                    by maintenance team. Please verify."
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerify(report.id)}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Verify & Close
                    </button>
                    <button
                      onClick={() => handleReopen(report.id)}
                      className="flex-1 bg-wayanad-bg border border-wayanad-border text-wayanad-text py-2 rounded-lg text-sm font-bold hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
                    >
                      Not Fixed
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReports;

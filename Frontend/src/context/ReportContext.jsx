import React, { createContext, useState, useContext } from "react";

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  // Initialize with some dummy data for demo purposes
  const [reports, setReports] = useState([
    {
      id: "#99281",
      category: "Power Issue",
      issue: "Streetlight Failure",
      location: "Sector B",
      date: "2 hours ago",
      status: "Resolved",
      statusColor: "text-blue-500 bg-blue-500/10",
      authorityMessage: "Bulb replaced.",
      authorityProof:
        "https://images.unsplash.com/photo-1563245372-f21724e3a899?auto=format&fit=crop&w=600&q=80",
    },
  ]);

  const addReport = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const updateReportStatus = (id, newStatus) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          let color = "text-orange-500 bg-orange-500/10";
          if (newStatus === "Resolved") color = "text-blue-500 bg-blue-500/10";
          if (newStatus === "Closed")
            color = "text-emerald-500 bg-emerald-500/10";

          return { ...r, status: newStatus, statusColor: color };
        }
        return r;
      }),
    );
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReportStatus }}>
      {children}
    </ReportContext.Provider>
  );
};

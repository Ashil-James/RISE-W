import React, { createContext, useState, useContext } from "react";

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reports from backend on mount
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/incidents');
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        // Map backend data to frontend structure if necessary
        // Backend: { _id, title, description, date }
        // Frontend expects: { id, issue, description, date, status, category, etc... }
        // For now, we'll map what we have and provide defaults for others
        const mappedReports = data.map(item => ({
          id: item._id,
          issue: item.title,
          description: item.description,
          date: item.date,
          category: "General", // Default as backend doesn't save this yet
          location: "Unknown", // Default
          status: "Open", // Default
          statusColor: "text-orange-500 bg-orange-500/10",
        }));
        setReports(mappedReports);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const addReport = async (newReport) => {
    try {
      // Optimistic update
      setReports((prev) => [newReport, ...prev]);

      const response = await fetch('http://localhost:5000/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newReport.issue, // Mapping 'issue' to 'title'
          description: newReport.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save report');
      }

      const savedReport = await response.json();

      // Update the local state with the real ID from backend
      setReports((prev) =>
        prev.map(r => r.id === newReport.id ? { ...r, id: savedReport._id } : r)
      );

    } catch (err) {
      console.error("Error saving report:", err);
      // Optionally rollback optimistic update here
      alert("Failed to save report to server. It may not persist on reload.");
    }
  };

  const updateReportStatus = (id, newStatus) => {
    // Note: Backend implementation for status update is pending.
    // This currently only updates local state.
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          let color = "text-orange-500 bg-orange-500/10";
          if (newStatus === "Resolved") color = "text-blue-500 bg-blue-500/10";
          if (newStatus === "Closed")
            color = "text-emerald-500 bg-emerald-500/10";
          if (newStatus === "Revoked")
            color = "text-gray-500 bg-gray-500/10";

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

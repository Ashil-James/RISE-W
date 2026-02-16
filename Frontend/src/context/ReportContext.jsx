import React, { createContext, useState, useContext } from "react";
import { useUser } from "./UserContext";

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, refreshUser } = useUser();

  // Fetch reports from backend on mount
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = user?.token;
        if (!token) {
          setReports([]);
          setLoading(false);
          return;
        }

        // Using proxy /api/v1/incidents
        const response = await fetch('/api/v1/incidents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          console.error("Authentication failed (401). Token might be invalid.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        
        const mappedReports = data.map(item => ({
          id: item._id,
          issue: item.title,
          description: item.description,
          date: item.date,
          category: item.category || "General",
          location: item.location || "Unknown",
          status: item.status || "Open",
          image: item.image,
          statusColor: item.status === 'Resolved' ? "text-blue-500 bg-blue-500/10" : "text-orange-500 bg-orange-500/10",
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
  }, [user?.token]);

  const addReport = async (newReport) => {
    try {
      // Optimistic update
      setReports((prev) => [newReport, ...prev]);

      const token = user?.token;
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Using proxy /api/v1/incidents
      const response = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newReport.issue, // Mapping 'issue' to 'title'
          description: newReport.description,
          category: newReport.category,
          location: newReport.location,
          image: newReport.userImage, // Base64 image
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
      console.error(err);
      alert("Failed to save report to server. It may not persist on reload.");
    } finally {
      if (refreshUser) refreshUser();
    }
  };

  const updateReportStatus = (id, newStatus) => {
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

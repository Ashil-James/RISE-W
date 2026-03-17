import React, { createContext, useState, useContext } from "react";
import { useUser } from "./UserContext";

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

const mapIncidentToReport = (item) => {
  let status = "Open";
  let statusColor = "text-orange-500 bg-orange-500/10";

  switch (item.status) {
    case "ACCEPTED":
      status = "Accepted";
      statusColor = "text-blue-400 bg-blue-500/10";
      break;
    case "IN_PROGRESS":
      status = "In Progress";
      statusColor = "text-amber-500 bg-amber-500/10";
      break;
    case "RESOLVED":
      status = "Resolved";
      statusColor = "text-blue-500 bg-blue-500/10";
      break;
    case "VERIFIED":
    case "CLOSED":
      status = "Closed";
      statusColor = "text-emerald-500 bg-emerald-500/10";
      break;
    case "REOPENED":
      status = "Reopened";
      statusColor = "text-red-500 bg-red-500/10";
      break;
    case "REJECTED":
      status = "Rejected";
      statusColor = "text-red-500 bg-red-500/10";
      break;
    case "REVOKED":
      status = "Revoked";
      statusColor = "text-gray-500 bg-gray-500/10";
      break;
    default:
      break;
  }

  return {
    id: item._id,
    issue: item.title,
    description: item.description,
    date: item.createdAt || item.date,
    category: item.category || "General",
    location: item.address || "Unknown",
    status,
    image: item.image,
    upvotes: item.upvotes || 0,
    statusColor,
    authorityMessage: item.authorityMessage || null,
    authorityProof: item.resolutionImage || null,
    rejectionReason: item.rejectionReason || null,
    verifiedByUser: Boolean(item.verifiedByUser),
    rawStatus: item.status,
  };
};

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, refreshUser, logout } = useUser();

  const fetchReports = async (tokenOverride = user?.token) => {
    try {
      const token = tokenOverride;
      if (!token) {
        setReports([]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/v1/incidents", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.error("Authentication failed (401). Token might be invalid.");
        if (logout) logout();
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const result = await response.json();
      const incidents = result.data || [];
      setReports(incidents.map(mapIncidentToReport));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports from backend on mount
  React.useEffect(() => {
    setLoading(true);
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
          title: newReport.issue,
          description: newReport.description,
          category: newReport.category,
          latitude: newReport.latitude,
          longitude: newReport.longitude,
          address: newReport.address,
          image: newReport.image, // Updated from userImage to image
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save report');
      }

      const result = await response.json();
      const savedReport = result.data;

      // Update the local state with the real ID from backend
      setReports((prev) =>
        prev.map((r) => (r.id === newReport.id ? mapIncidentToReport(savedReport) : r))
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

  const respondToResolution = async (id, action) => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/v1/incidents/${id}/resolution-response`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update incident status");
      }

      const updatedReport = mapIncidentToReport(result.data);
      setReports((prev) =>
        prev.map((report) => (report.id === id ? updatedReport : report))
      );

      if (refreshUser) {
        await refreshUser();
      }

      return { success: true, data: updatedReport };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const revokeReport = async (id) => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/v1/incidents/${id}/revoke`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to revoke incident");
      }

      const updatedReport = mapIncidentToReport(result.data);
      setReports((prev) =>
        prev.map((report) => (report.id === id ? updatedReport : report))
      );

      if (refreshUser) {
        await refreshUser();
      }

      return { success: true, data: updatedReport };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReportStatus, respondToResolution, revokeReport, loading, error, refreshReports: fetchReports }}>
      {children}
    </ReportContext.Provider>
  );
};

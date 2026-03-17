import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";
import { mapIncidentToReport } from "../utils/reportTracking";

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

const sortReportsByLatestUpdate = (items) =>
  [...items].sort(
    (left, right) =>
      new Date(right.lastUpdatedAt || right.updatedAt || right.submittedAt || 0).getTime() -
      new Date(left.lastUpdatedAt || left.updatedAt || left.submittedAt || 0).getTime(),
  );

const mergeReport = (previousReports, nextReport) => {
  const filtered = previousReports.filter((report) => report.id !== nextReport.id);
  return sortReportsByLatestUpdate([nextReport, ...filtered]);
};

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();
    return payload?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, refreshUser, logout } = useUser();

  const refreshReports = useCallback(
    async (tokenOverride = user?.token, { showLoading = true } = {}) => {
      const token = tokenOverride;

      if (showLoading) {
        setLoading(true);
      }

      if (!token) {
        setReports([]);
        setError(null);
        setLoading(false);
        return { success: true, data: [] };
      }

      try {
        const response = await fetch("/api/v1/incidents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          if (logout) logout();
          setReports([]);
          setLoading(false);
          return { success: false, message: "Session expired" };
        }

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, "Failed to fetch reports"));
        }

        const result = await response.json();
        const mappedReports = sortReportsByLatestUpdate((result.data || []).map(mapIncidentToReport));
        setReports(mappedReports);
        setError(null);
        return { success: true, data: mappedReports };
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.message);
        return { success: false, message: fetchError.message };
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [logout, user?.token],
  );

  useEffect(() => {
    refreshReports(user?.token, { showLoading: true });
  }, [refreshReports, user?.token]);

  const fetchReportById = useCallback(
    async (id, tokenOverride = user?.token) => {
      const token = tokenOverride;
      if (!token || !id) {
        return { success: false, message: "Missing report context" };
      }

      try {
        const response = await fetch(`/api/v1/incidents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          if (logout) logout();
          return { success: false, message: "Session expired" };
        }

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.data) {
          throw new Error(result?.message || "Failed to fetch report details");
        }

        const mappedReport = mapIncidentToReport(result.data);
        setReports((previousReports) => mergeReport(previousReports, mappedReport));
        return { success: true, data: mappedReport };
      } catch (fetchError) {
        console.error(fetchError);
        return { success: false, message: fetchError.message };
      }
    },
    [logout, user?.token],
  );

  const addReport = useCallback(
    async (newReport) => {
      try {
        const token = user?.token;
        if (!token) {
          throw new Error("User not authenticated");
        }

        const response = await fetch("/api/v1/incidents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newReport.issue,
            description: newReport.description,
            category: newReport.category,
            latitude: newReport.latitude,
            longitude: newReport.longitude,
            address: newReport.address,
            image: newReport.image,
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.data) {
          throw new Error(result?.message || "Failed to save report");
        }

        const mappedReport = mapIncidentToReport(result.data);
        setReports((previousReports) => mergeReport(previousReports, mappedReport));

        if (refreshUser) {
          await refreshUser();
        }

        return { success: true, data: mappedReport };
      } catch (saveError) {
        console.error(saveError);
        alert(saveError.message || "Failed to save report to server.");
        return { success: false, message: saveError.message };
      }
    },
    [refreshUser, user?.token],
  );

  const respondToResolution = useCallback(
    async (id, action) => {
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

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.data) {
          throw new Error(result?.message || "Failed to update incident status");
        }

        const mappedReport = mapIncidentToReport(result.data);
        setReports((previousReports) => mergeReport(previousReports, mappedReport));

        if (refreshUser) {
          await refreshUser();
        }

        return { success: true, data: mappedReport };
      } catch (requestError) {
        console.error(requestError);
        return { success: false, message: requestError.message };
      }
    },
    [refreshUser, user?.token],
  );

  const revokeReport = useCallback(
    async (id) => {
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

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.data) {
          throw new Error(result?.message || "Failed to revoke incident");
        }

        const mappedReport = mapIncidentToReport(result.data);
        setReports((previousReports) => mergeReport(previousReports, mappedReport));

        if (refreshUser) {
          await refreshUser();
        }

        return { success: true, data: mappedReport };
      } catch (requestError) {
        console.error(requestError);
        return { success: false, message: requestError.message };
      }
    },
    [refreshUser, user?.token],
  );

  const reportedReports = useMemo(
    () => reports.filter((report) => report.viewerRelation === "REPORTER"),
    [reports],
  );

  const supportedReports = useMemo(
    () => reports.filter((report) => report.viewerRelation === "SUPPORTER"),
    [reports],
  );

  const caseSummary = useMemo(() => {
    const cases = reportedReports;

    return {
      actionNeeded: cases.filter((report) => report.bucket === "ACTION_NEEDED").length,
      inProgress: cases.filter((report) => ["ACCEPTED", "IN_PROGRESS", "REOPENED"].includes(report.rawStatus)).length,
      awaitingVerification: cases.filter((report) => report.bucket === "AWAITING_VERIFICATION").length,
      closed: cases.filter((report) => report.bucket === "CLOSED").length,
      mostRecentlyUpdated: cases[0] || null,
    };
  }, [reportedReports]);

  return (
    <ReportContext.Provider
      value={{
        reports,
        reportedReports,
        supportedReports,
        caseSummary,
        loading,
        error,
        addReport,
        respondToResolution,
        revokeReport,
        refreshReports,
        fetchReportById,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * DepartmentGuard — prevents an authority user from accessing
 * another department's pages by changing the URL manually.
 *
 * Usage: <DepartmentGuard allowed={["WATER"]}> ... </DepartmentGuard>
 *
 * If the logged-in user's department doesn't match, they are
 * redirected back to their own department's dashboard.
 */

const DEPARTMENT_DASHBOARD_MAP = {
  WATER: "/authority/water/dashboard",
  ELECTRICITY: "/authority/power/dashboard",
  CIVIL: "/authority/road/dashboard",
};

const DepartmentGuard = ({ allowed, children }) => {
  const { user } = useAuth();
  const department = user?.department?.toUpperCase();

  // If the user's department isn't in the allowed list, redirect them
  if (department && !allowed.includes(department)) {
    const correctDashboard =
      DEPARTMENT_DASHBOARD_MAP[department] || "/authority";
    return <Navigate to={correctDashboard} replace />;
  }

  return children ? children : <Outlet />;
};

export default DepartmentGuard;

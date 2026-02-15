import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. If still loading user data, show nothing (or a spinner)
  if (loading) return null;

  // 2. If not logged in, kick to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Use 'user' as default role if missing
  const userRole = user.role || 'user';

  // 3. Check Roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "user") return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  // 4. THE FIX: Render 'children' (AdminLayout) if it exists, otherwise render 'Outlet' (User Layout)
  return children ? children : <Outlet />;
};

export default PrivateRoute;

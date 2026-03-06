import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthorityRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userRole = user.role || "user";
      const department = user.department?.toUpperCase();

      if (userRole === "authority" || userRole.includes("authority")) {
        if (department === "WATER") {
          navigate("/authority/water/dashboard", { replace: true });
        } else if (department === "ELECTRICITY" || userRole === "power_authority") {
          navigate("/authority/power/dashboard", { replace: true });
        } else if (department === "CIVIL" || userRole === "road_authority") {
          navigate("/authority/road/dashboard", { replace: true });
        } else {
          navigate("/authority/water/dashboard", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default AuthorityRedirect;

import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "../context/UserContext";

const Layout = () => {
  const { user } = useUser();

  // Safety check
  if (!user) return <div className="min-h-screen bg-wayanad-bg flex items-center justify-center text-wayanad-text">Loading session...</div>;

  return (
    <div className="min-h-screen bg-wayanad-bg text-wayanad-text font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] animate-blob delay-200"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-teal-500/10 rounded-full blur-[110px] animate-blob delay-400"></div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-wayanad-panel/70 backdrop-blur-xl border-b border-wayanad-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* LOGO: WAYANAD CONNECT */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
            <span className="text-xl font-bold tracking-wide text-gray-200 group-hover:text-white transition-colors">
              WAYANAD <span className="text-emerald-400">CONNECT</span>
            </span>
          </Link>

          {/* RIGHT SIDE ICONS */}
          <div className="flex items-center gap-6">
            <ThemeToggle />

            {/* AVATAR - Matches screenshot (Green Circle with Initial) */}
            <Link to="/profile">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                {user.name ? user.name.charAt(0).toUpperCase() : "D"}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Radio,
  Shield,
  Settings,
  Menu,
  X,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.includes(to);
    return (
      <li>
        <Link
          to={to}
          className={`
            relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group overflow-hidden
            ${
              isActive
                ? "bg-gradient-to-r from-emerald-600/20 to-cyan-600/10 text-emerald-300 font-bold border border-emerald-500/20 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]"
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            }
          `}
        >
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            />
          )}
          <Icon
            size={22}
            className={`z-10 transition-all duration-300 ${isActive ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "group-hover:text-emerald-300"}`}
          />
          <span className="z-10 text-sm tracking-wide">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[130px] animate-blob delay-200"></div>
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] animate-pulse"></div>
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* MOBILE TOGGLE */}
      <button
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-neutral-900/80 backdrop-blur-md rounded-xl border border-white/10"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-neutral-900/60 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 fixed h-full z-40 shadow-2xl lg:shadow-none lg:relative"
          >
            {/* Brand Logo */}
            <div className="flex items-center gap-4 mb-12 px-2 mt-2">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-12 h-12 rounded-xl bg-neutral-950 flex items-center justify-center text-emerald-400 font-black text-xl border border-white/10 shadow-2xl">
                  R
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-cyan-200">
                  RISE<span className="text-emerald-400">.ADMIN</span>
                </h2>
                <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                  Control Center
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-8">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
                  Menu
                </p>
                <ul className="space-y-3">
                  <NavItem
                    to="/admin/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                  />
                  <NavItem
                    to="/admin/broadcasts"
                    icon={Radio}
                    label="Broadcasts"
                  />
                  <NavItem to="/admin/users" icon={Users} label="Users" />
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
                  System
                </p>
                <ul className="space-y-3">
                  {/* Placeholder for future features */}
                  {/*
                  <NavItem to="#" icon={Shield} label="Security Logs" />
                  */}
                  {/*<NavItem to="#" icon={Settings} label="Settings" />*/}
                </ul>
              </div>
            </nav>

            {/* Logout Button */}
            <div className="pt-6 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all font-bold group"
              >
                <LogOut
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WRAPPER */}
      <main
        className={`flex-1 p-6 lg:p-10 overflow-y-auto relative z-10 transition-all duration-300 ${isSidebarOpen ? "" : "lg:ml-0"}`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

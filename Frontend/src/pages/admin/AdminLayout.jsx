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
  Building,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useUser();
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
            relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
            ${isActive
              ? "bg-gradient-to-r from-emerald-600/20 to-cyan-600/10 text-emerald-300 font-bold border border-emerald-500/20 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]"
              : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5"
            }
          `}
        >
          {/* Active indicator pill with neon glow */}
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full"
              style={{
                boxShadow: "0 0 12px rgba(52,211,153,0.8), 0 0 25px rgba(52,211,153,0.4)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Hover shimmer */}
          {!isActive && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </div>
          )}

          <Icon
            size={20}
            className={`z-10 transition-all duration-300 ${isActive ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "group-hover:text-emerald-300"}`}
          />
          <span className="z-10 text-sm tracking-wide flex-1">{label}</span>

          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="z-10"
            >
              <ChevronRight size={14} className="text-emerald-500" />
            </motion.div>
          )}
        </Link>
      </li>
    );
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 25 },
    },
    closed: {
      x: -300,
      opacity: 0,
      transition: { type: "spring", stiffness: 200, damping: 25 },
    },
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
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-neutral-900/80 backdrop-blur-md rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Menu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="w-72 bg-neutral-900/60 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 fixed h-full z-40 shadow-2xl lg:shadow-none lg:relative"
          >
            {/* Brand Logo */}
            <div className="flex items-center gap-4 mb-10 px-2 mt-2">
              <div className="relative group cursor-pointer">
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur"
                ></motion.div>
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
            <nav className="flex-1 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.25em] mb-3 px-4">
                  Menu
                </p>
                <ul className="space-y-1.5">
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
                  <NavItem to="/admin/authorities" icon={Building} label="Authorities" />
                </ul>
              </div>

              {/* Gradient separator */}
              <div className="mx-4">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.25em] mb-3 px-4">
                  System
                </p>
                <ul className="space-y-1.5">
                  {/* Placeholder for future features */}
                </ul>
              </div>
            </nav>

            {/* User Info Section */}
            <div className="mb-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Administrator</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-white/5">
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all font-bold group"
              >
                <LogOut
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform duration-300"
                />
                Sign Out
              </motion.button>
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

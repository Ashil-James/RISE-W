import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Radio,
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
            ${isActive ? "text-white font-bold" : "text-gray-400 hover:text-white border border-transparent"}
          `}
        >
          {isActive && (
            <motion.div
              layoutId="active-nav-bg"
              className="absolute inset-0 rounded-2xl border border-emerald-500/20"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.08), rgba(99,102,241,0.05))",
                boxShadow: "0 0 30px -5px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
              style={{
                background: "linear-gradient(to bottom, #34d399, #06b6d4)",
                boxShadow: "0 0 12px rgba(52,211,153,0.9), 0 0 30px rgba(52,211,153,0.4)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          <Icon
            size={20}
            className={`z-10 transition-all duration-300 ${isActive ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]" : "group-hover:text-emerald-300"}`}
          />
          <span className="z-10 text-sm tracking-wide flex-1">{label}</span>

          {isActive && <ChevronRight size={14} className="z-10 text-emerald-400/70" />}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#060a10] text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative">

      {/* ========= AURORA (CSS-only, GPU composited) ========= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="admin-aurora-1 absolute top-[-25%] left-[-15%] w-[900px] h-[900px] rounded-full blur-[180px] will-change-transform"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12), rgba(6,182,212,0.05), transparent 70%)" }} />
        <div className="admin-aurora-2 absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[160px] will-change-transform"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1), rgba(139,92,246,0.05), transparent 70%)" }} />
        <div className="admin-aurora-3 absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full blur-[140px] will-change-transform"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08), rgba(16,185,129,0.03), transparent 70%)" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>
      </div>

      <style>{`
        @keyframes auroraFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,-40px) scale(1.05)} 66%{transform:translate(-30px,20px) scale(0.97)} }
        @keyframes auroraFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,30px) scale(0.93)} 66%{transform:translate(30px,-50px) scale(1.05)} }
        @keyframes auroraFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        .admin-aurora-1{animation:auroraFloat1 25s ease-in-out infinite}
        .admin-aurora-2{animation:auroraFloat2 30s ease-in-out infinite}
        .admin-aurora-3{animation:auroraFloat3 20s ease-in-out infinite}
      `}</style>

      {/* MOBILE TOGGLE */}
      <button
        className="lg:hidden fixed top-6 right-6 z-50 p-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all"
        style={{ background: "rgba(10,15,25,0.7)", backdropFilter: "blur(20px)" }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ========= LIQUID GLASS SIDEBAR ========= */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-72 flex flex-col p-6 fixed h-full z-40 lg:relative"
            style={{
              background: "linear-gradient(180deg, rgba(10,15,25,0.75) 0%, rgba(10,15,25,0.6) 100%)",
              backdropFilter: "blur(40px) saturate(1.8)",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "20px 0 60px -15px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

            {/* Brand */}
            <div className="flex items-center gap-4 mb-10 px-2 mt-2">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl border border-white/10"
                  style={{ background: "linear-gradient(135deg, rgba(10,15,25,0.9), rgba(16,185,129,0.05))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
                >R</div>
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

            {/* Nav */}
            <nav className="flex-1 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.25em] mb-3 px-4">Menu</p>
                <ul className="space-y-1">
                  <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem to="/admin/broadcasts" icon={Radio} label="Broadcasts" />
                  <NavItem to="/admin/users" icon={Users} label="Users" />
                  <NavItem to="/admin/authorities" icon={Building} label="Authorities" />
                </ul>
              </div>
              <div className="mx-4"><div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></div>
            </nav>

            {/* User Info */}
            <div className="mb-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(16,185,129,0.02))" }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0f19]" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.6)" }}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Administrator</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-red-400 border border-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all font-bold group"
                style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.02))" }}
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
};

export default AdminLayout;

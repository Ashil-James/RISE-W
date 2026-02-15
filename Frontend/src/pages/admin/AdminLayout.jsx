import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Radio, Shield, Settings, Menu, X, Users } from "lucide-react";
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
                ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-emerald-400 font-bold border border-emerald-500/10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            }
          `}
        >
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"
            />
          )}
          <Icon size={22} className={`z-10 transition-colors ${isActive ? "text-emerald-400" : "group-hover:text-emerald-300"}`} />
          <span className="z-10 text-sm tracking-wide">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[100px] animate-blob delay-200"></div>
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
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-emerald-500 font-black text-xl border border-white/10 shadow-2xl">
                  R
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  RISE<span className="text-emerald-500">.ADMIN</span>
                </h2>
                <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-[0.2em]">
                  Control Center
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-8">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Menu</p>
                <ul className="space-y-3">
                  <NavItem
                    to="/admin/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                  />
                  <NavItem to="/admin/broadcasts" icon={Radio} label="Broadcasts" />
                  <NavItem to="/admin/users" icon={Users} label="Users" />
                </ul>
              </div>
              
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">System</p>
                 <ul className="space-y-3">
                  {/* Placeholder for future features */}
                  <NavItem to="#" icon={Shield} label="Security Logs" />
                  <NavItem to="#" icon={Settings} label="Settings" />
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
      <main className={`flex-1 p-6 lg:p-10 overflow-y-auto relative z-10 transition-all duration-300 ${isSidebarOpen ? '' : 'lg:ml-0'}`}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
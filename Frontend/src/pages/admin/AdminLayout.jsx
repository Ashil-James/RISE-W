import React, { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  FileStack,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/incidents", label: "Incidents", icon: FileStack },
  { to: "/admin/broadcasts", label: "Broadcasts", icon: Radio },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/authorities", label: "Authorities", icon: Building2 },
];

const isNavActive = (pathname, to) =>
  pathname.startsWith(to) || (to === "/admin/incidents" && pathname.startsWith("/admin/incident/"));

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => isNavActive(location.pathname, item.to)),
    [location.pathname],
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-wayanad-bg text-wayanad-text font-sans selection:bg-emerald-500/20">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="user-aurora-1 absolute top-[-20%] left-[-12%] w-[700px] h-[700px] rounded-full blur-[160px] will-change-transform bg-emerald-500/[0.08]" />
        <div className="user-aurora-2 absolute bottom-[-12%] right-[-8%] w-[550px] h-[550px] rounded-full blur-[140px] will-change-transform bg-cyan-500/[0.06]" />
        <div className="user-aurora-3 absolute top-[35%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] will-change-transform bg-teal-500/[0.05]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <button
        type="button"
        onClick={() => setIsSidebarOpen((value) => !value)}
        className="fixed right-4 top-4 z-50 rounded-2xl border border-white/10 bg-black/35 p-3 text-white backdrop-blur-xl lg:hidden"
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="relative z-10 flex min-h-screen">
        <AnimatePresence>
          {isSidebarOpen ? (
            <>
              <motion.div
                className="fixed inset-0 z-30 bg-black/45 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-wayanad-bg/40 p-6 backdrop-blur-[40px] lg:static lg:z-10 lg:border-r-0 lg:bg-transparent lg:pr-4"
              >
                <div className="flex items-center gap-4 px-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-emerald-500/10 text-xl font-black text-emerald-300">
                    R
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      RISE.ADMIN
                    </h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-300/75">
                      Control Center
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Signed in as
                  </p>
                  <p className="mt-3 text-lg font-bold text-white">{user?.name || "Admin"}</p>
                  <p className="text-sm text-slate-400">
                    {activeItem?.label || "Dashboard"} workspace
                  </p>
                </div>

                <nav className="mt-8 space-y-2">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavActive(location.pathname, item.to);

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => {
                          if (typeof window !== "undefined" && window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.95rem] font-bold transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.2)]"
                            : "border border-transparent text-wayanad-muted hover:text-white hover:bg-white/[0.03] hover:border-white/5"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-emerald-400" : "text-wayanad-muted"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition-all hover:border-red-400/30"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1 px-4 pb-10 pt-20 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

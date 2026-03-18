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
    <div className="relative min-h-screen overflow-hidden bg-[#060a10] text-white selection:bg-emerald-500/20">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-24 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-[160px]" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
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
                className="fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,15,25,0.92),rgba(10,15,25,0.82))] p-6 backdrop-blur-3xl lg:static lg:z-10"
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
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                          isActive
                            ? "border border-emerald-400/20 bg-emerald-500/10 text-white"
                            : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-emerald-300" : "text-slate-400"} />
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

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Bell, FileText, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home", exact: true },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/my-reports", icon: FileText, label: "Reports" },
];

const Layout = () => {
  const { user } = useUser();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = useCallback((item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }, [location.pathname]);

  if (!user) return <div className="min-h-screen bg-wayanad-bg flex items-center justify-center text-wayanad-text">Loading session...</div>;

  return (
    <div className="min-h-screen bg-wayanad-bg text-wayanad-text font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="user-aurora-1 absolute top-[-20%] left-[-12%] w-[700px] h-[700px] rounded-full blur-[160px] will-change-transform bg-emerald-500/[0.08] dark:bg-emerald-500/[0.10]"></div>
        <div className="user-aurora-2 absolute bottom-[-12%] right-[-8%] w-[550px] h-[550px] rounded-full blur-[140px] will-change-transform bg-cyan-500/[0.06] dark:bg-indigo-500/[0.08]"></div>
        <div className="user-aurora-3 absolute top-[35%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] will-change-transform bg-teal-500/[0.05] dark:bg-cyan-500/[0.06]"></div>
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          backdropFilter: scrolled ? "blur(40px) saturate(1.8)" : "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: scrolled ? "blur(40px) saturate(1.8)" : "blur(20px) saturate(1.4)",
          background: scrolled ? "var(--glass-bg)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.06)" : "none",
        }}>

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}></div>
            <span className="text-lg font-bold tracking-wide text-wayanad-text">
              RISE
            </span>
          </Link>

          {/* Center Nav — Glass Pill */}
          <div className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-2xl"
            style={{
              backdropFilter: "blur(20px) saturate(1.5)",
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              boxShadow: "inset 0 1px 0 var(--glass-highlight)",
            }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link key={item.to} to={item.to}
                  className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${active ? "text-white" : "text-wayanad-muted hover:text-wayanad-text"}`}>
                  {active && (
                    <motion.div layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 2px 12px rgba(16,185,129,0.35)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <item.icon size={16} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/profile" className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-500"></div>
              <div className="relative w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 2px 10px rgba(16,185,129,0.3)" }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile bottom nav */}
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="flex items-center justify-around py-2 rounded-2xl"
          style={{
            backdropFilter: "blur(40px) saturate(1.8)",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.1)",
          }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${active ? "text-emerald-500" : "text-wayanad-muted"}`}>
                <item.icon size={20} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
          <Link to="/profile"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${location.pathname === "/profile" ? "text-emerald-500" : "text-wayanad-muted"}`}>
            <User size={20} />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main */}
      <main className="pt-20 pb-24 md:pb-12 px-6 max-w-7xl mx-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

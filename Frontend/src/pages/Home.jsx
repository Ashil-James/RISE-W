import React from "react";
import { Link } from "react-router-dom";
import { Bell, Clock, ChevronRight, Zap } from "lucide-react";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useUser();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[80vh] relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. HERO TEXT */}
      <motion.div className="text-center mb-12 space-y-4" variants={itemVariants}>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tight drop-shadow-sm">
          Township Portal
        </h1>
        <p className="text-wayanad-muted text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Report and track critical issues in your sector instantly.
        </p>
      </motion.div>

      {/* 2. BIG RED REPORT BUTTON */}
      <motion.div variants={itemVariants} className="w-full max-w-md">
        <Link to="/report">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full bg-gradient-to-r from-[#ff0f39] to-[#ff4b6e] hover:from-[#ff224a] hover:to-[#ff5c7c] text-white h-20 rounded-2xl font-bold text-xl shadow-[0_10px_40px_-10px_rgba(255,15,57,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(255,15,57,0.6)] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out skew-y-12"></div>
            <span className="relative z-10">Report Incident</span>
            <ChevronRight className="group-hover:translate-x-1 transition-transform relative z-10" />
          </motion.button>
        </Link>
      </motion.div>

      {/* 3. SUBTEXT */}
      <motion.div className="mt-8 mb-12" variants={itemVariants}>
        <p className="text-[10px] font-bold tracking-[0.3em] text-emerald-500/80 uppercase">
          Maintenance • Utilities • Safety
        </p>
      </motion.div>

      {/* 4. NAVIGATION CARDS (Alerts & History) */}
      <motion.div
        className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-12"
        variants={itemVariants}
      >
        <Link to="/alerts" className="block">
          <motion.div
            className="glass-card p-6 rounded-3xl group cursor-pointer h-full"
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                <Bell size={24} />
              </div>
              <ChevronRight
                size={16}
                className="text-wayanad-muted group-hover:text-emerald-500 transition-colors"
              />
            </div>
            <h3 className="text-wayanad-text font-bold text-xl">Alerts</h3>
            <p className="text-sm text-wayanad-muted mt-1">View active alerts</p>
          </motion.div>
        </Link>

        <Link to="/my-reports" className="block">
          <motion.div
            className="glass-card p-6 rounded-3xl group cursor-pointer h-full"
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                <Clock size={24} />
              </div>
              <ChevronRight
                size={16}
                className="text-wayanad-muted group-hover:text-cyan-500 transition-colors"
              />
            </div>
            <h3 className="text-wayanad-text font-bold text-xl">History</h3>
            <p className="text-sm text-wayanad-muted mt-1">Check report status</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* 5. BOTTOM ALERT TICKER */}
      <motion.div
        className="w-full max-w-3xl glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-wayanad-panel/80 transition-colors cursor-pointer"
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
      >
        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
          <Zap size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-0.5">
            Test Alert
          </h4>
          <p className="text-wayanad-muted text-sm">
            Just a test alert for the system.
          </p>
        </div>
        <span className="text-wayanad-muted text-xs font-medium">Just now</span>
        <ChevronRight size={14} className="text-wayanad-muted" />
      </motion.div>
    </motion.div>
  );
};

export default Home;

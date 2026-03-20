import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CloudRain,
  Navigation,
  PhoneCall,
  FileText,
  Wrench,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAlerts } from "../context/AlertContext";
import { useReports } from "../context/ReportContext";
import { useUser } from "../context/UserContext";
import WeatherWidget from "../components/WeatherWidget";
import axios from "axios";

const Home = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { caseSummary, loading: reportsLoading } = useReports();
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const [activeSurvey, setActiveSurvey] = useState(false);

  useEffect(() => {
    const checkSurvey = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(
          "/api/v1/weather/active-survey",
          config,
        );
        if (data.success && data.data) setActiveSurvey(true);
      } catch {}
    };
    checkSurvey();
  }, [user?.token]);

  // Stark animations
  const fadeUp = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-12 md:py-24 max-w-5xl mx-auto font-sans">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-10">
        
        {/* Header Block */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-black/10 dark:border-white/10">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white">
              {t("home.title") || "RISE"}
            </h1>
            <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
              {t("home.subtitle") || "Resilience & Incident System"}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#111] border border-black/5 dark:border-white/5">
                <WeatherWidget />
             </div>
          </div>
        </motion.div>

        {/* Global Alert Bar (Stark) */}
        {latestAlert && !alertsLoading && (
          <motion.div variants={fadeUp}>
            <Link to="/alerts" className="block w-full">
              <div className="flex items-center justify-between p-5 rounded-[1.25rem] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:bg-neutral-50 dark:hover:bg-[#111] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${latestAlert.type === 'critical' ? 'bg-red-500' : latestAlert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-[0.15em]">{latestAlert.sourceLabel || "System"}</span>
                    <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">/</span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium truncate max-w-xl">{latestAlert.title}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Main Action Map/Report Block */}
          <motion.div variants={fadeUp} className="md:col-span-2 row-span-2 group">
            <div className="h-full flex flex-col justify-between p-8 md:p-10 rounded-[1.5rem] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:border-black/20 dark:hover:border-white/20 transition-colors">
              <div className="space-y-6 max-w-md">
                <div className="w-14 h-14 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-4">
                   <AlertTriangle size={24} />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
                  Report Incident
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                  Log a new emergency, request assistance, or flag infrastructure damage immediately to the authorities. Avoid duplicate reports.
                </p>
              </div>
              <div className="mt-12">
                <Link to="/report" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity w-full sm:w-auto">
                  Create Report <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stat Block 1 */}
          <motion.div variants={fadeUp} className="p-8 rounded-[1.5rem] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-colors min-h-[200px]">
            <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
              <FileText size={18} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Action Needed</span>
            </div>
            <div className="mt-8">
              <span className="text-6xl font-light tracking-tighter text-black dark:text-white">{caseSummary?.actionNeeded || 0}</span>
            </div>
          </motion.div>

          {/* Stat Block 2 */}
          <motion.div variants={fadeUp} className="p-8 rounded-[1.5rem] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-colors min-h-[200px]">
            <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
              <Wrench size={18} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">In Progress</span>
            </div>
            <div className="mt-8">
              <span className="text-6xl font-light tracking-tighter text-black dark:text-white">{caseSummary?.inProgress || 0}</span>
            </div>
          </motion.div>

          {/* Quick Nav: Live Alerts */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <Link to="/alerts" className="block h-full p-6 md:p-8 rounded-[1.5rem] border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-[#111] hover:bg-zinc-100 dark:hover:bg-[#161616] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-black dark:text-white shadow-sm">
                     <Navigation size={20} />
                   </div>
                   <div>
                     <h3 className="text-base font-semibold text-black dark:text-white group-hover:underline decoration-neutral-500 underline-offset-4">Live Alerts Map</h3>
                     <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">View real-time community danger zones.</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
            </Link>
          </motion.div>

          {/* Quick Nav: Authorities */}
          <motion.div variants={fadeUp}>
             <Link to="/directory" className="block h-full p-6 rounded-[1.5rem] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:border-black/20 dark:hover:border-white/20 transition-colors group flex flex-col justify-center items-center text-center">
                <div className="mb-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <PhoneCall size={28} />
                </div>
                <h3 className="text-sm font-semibold text-black dark:text-white">Authorities</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400 mt-1.5">Directory</p>
             </Link>
          </motion.div>

        </div>

        {/* Survey Banner (Enterprise style) */}
        {activeSurvey && (
          <motion.div variants={fadeUp} className="pt-8">
            <Link to="/survey">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 rounded-[1.5rem] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:bg-neutral-50 dark:hover:bg-[#111] transition-colors group">
                <div className="flex items-center gap-5 mb-5 md:mb-0">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl border border-black/5 dark:border-white/5">
                    <CloudRain size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black dark:text-white tracking-tight">Post-Storm Survey Required</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Help authorities accurately track recent area damages.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white group-hover:translate-x-1 transition-transform bg-neutral-100 dark:bg-neutral-800 px-5 py-2.5 rounded-lg border border-black/5 dark:border-white/5">
                  Complete Survey <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};

export default Home;

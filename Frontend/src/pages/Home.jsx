import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Plus, History, Bell } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Text */}
      <div className="mt-4 space-y-1">
        <h2 className="text-3xl font-light text-white/90">Township</h2>
        <h2 className="text-3xl font-bold text-emerald-400">Incident Portal</h2>
        <p className="text-wayanad-muted text-sm mt-2">
          Report and track critical issues in your sector.
        </p>
      </div>

      {/* Giant Action Button */}
      <div className="flex justify-center py-4">
        <button
          onClick={() => navigate("/report")}
          className="relative group w-36 h-36 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex flex-col items-center justify-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          {/* Ping Animation Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse-slow"></div>

          <Plus size={40} className="text-white mb-1 drop-shadow-md" />
          <span className="font-bold text-white tracking-widest text-xs">
            REPORT
          </span>
        </button>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/alerts")}
          className="bg-wayanad-panel/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col items-start gap-3 hover:bg-white/10 transition cursor-pointer active:scale-95"
        >
          <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
            <Bell size={24} />
          </div>
          <span className="font-medium text-lg">Alerts</span>
        </div>

        <div
          onClick={() => navigate("/my-reports")}
          className="bg-wayanad-panel/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col items-start gap-3 hover:bg-white/10 transition cursor-pointer active:scale-95"
        >
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <History size={24} />
          </div>
          <span className="font-medium text-lg">My Reports</span>
        </div>
      </div>

      {/* Live Alert Ticker */}
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
        <AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} />
        <div>
          <h4 className="text-red-400 font-bold text-sm tracking-wide uppercase">
            Wildlife Alert
          </h4>
          <p className="text-xs text-red-100/80 mt-1 leading-relaxed">
            Elephant sighted near Sector B (10 mins ago). Please stay indoors
            and avoid the forest edge road.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

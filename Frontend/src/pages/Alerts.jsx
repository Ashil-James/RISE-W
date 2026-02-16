import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CloudRain, Zap, Info, Plus } from "lucide-react";
import { useAlerts } from "../context/AlertContext";

// Icon mapping helper
const getIconComponent = (iconName) => {
  const icons = { AlertTriangle, Zap, CloudRain, Info };
  return icons[iconName] || Info;
};

const Alerts = () => {
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  // Helper to get colors based on severity
  const getStyles = (type) => {
    switch (type) {
      case "critical":
        return "border-l-4 border-l-red-500 bg-red-500/5";
      case "warning":
        return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
      case "info":
        return "border-l-4 border-l-blue-500 bg-blue-500/5";
      default:
        return "border-l-4 border-l-gray-500 bg-gray-500/5";
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in relative pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-wayanad-panel transition-colors text-wayanad-muted hover:text-wayanad-text"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-wayanad-text">
              Safety Alerts
            </h1>
            <p className="text-sm text-wayanad-muted">
              Live updates from Township & Community
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Creating Alert */}
      <button
        onClick={() => navigate("/create-alert")}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.6)] hover:scale-110 active:scale-90 transition-all z-20 flex items-center justify-center group"
        aria-label="Broadcast Alert"
      >
        <Plus size={28} className="drop-shadow-sm group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-20 text-wayanad-muted border-2 border-dashed border-wayanad-border rounded-2xl">
            <p>No active alerts.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = getIconComponent(alert.icon);
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-r-xl bg-wayanad-panel border border-wayanad-border shadow-sm transform transition-all hover:translate-x-1 ${getStyles(alert.type)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`mt-1 p-2 rounded-lg bg-wayanad-bg ${getIconColor(alert.type)}`}
                  >
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-wayanad-text">
                            {alert.title}
                          </h3>
                          {alert.isAuthority ? (
                            <span className="bg-emerald-500/20 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight">Official</span>
                          ) : (
                            <span className="bg-blue-500/20 text-blue-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight">Community</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-wayanad-muted bg-wayanad-bg px-2 py-1 rounded">
                        {getTimeAgo(alert.time)}
                      </span>
                    </div>
                    <p className="text-wayanad-text/80 mt-1 text-sm leading-relaxed">
                      {alert.message}
                    </p>
                    {alert.location && (
                      <p className="mt-2 text-xs font-bold text-wayanad-muted flex items-center gap-1">
                        <Zap size={10} className="text-current" /> {alert.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* End of list */}
        {alerts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-wayanad-muted uppercase tracking-widest">
              End of Updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CloudRain, Zap, Info } from "lucide-react";

const Alerts = () => {
  const navigate = useNavigate();

  // Mock Data for UI demonstration
  const alerts = [
    {
      id: 1,
      type: "critical", // red
      title: "Wildlife Alert: Elephant Sighted",
      message:
        "Wild elephant spotted near Sector B market area. Residents are advised to stay indoors and avoid the forest edge road.",
      time: "10 mins ago",
      icon: AlertTriangle,
    },
    {
      id: 2,
      type: "warning", // yellow
      title: "Power Outage Scheduled",
      message:
        "Maintenance work on Main St. Power will be down from 2:00 PM to 5:00 PM today.",
      time: "2 hours ago",
      icon: Zap,
    },
    {
      id: 3,
      type: "info", // blue
      title: "Heavy Rain Forecast",
      message:
        "Yellow alert issued for Wayanad district. Drive carefully on ghat roads due to potential slippery conditions.",
      time: "5 hours ago",
      icon: CloudRain,
    },
  ];

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

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-wayanad-panel transition-colors text-wayanad-muted hover:text-wayanad-text"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-wayanad-text">
            Safety Alerts
          </h1>
          <p className="text-sm text-wayanad-muted">
            Live updates from Township Authority
          </p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-r-xl bg-wayanad-panel border border-wayanad-border shadow-sm ${getStyles(alert.type)}`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`mt-1 p-2 rounded-lg bg-wayanad-bg ${getIconColor(alert.type)}`}
              >
                <alert.icon size={24} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-wayanad-text">
                    {alert.title}
                  </h3>
                  <span className="text-xs font-mono text-wayanad-muted bg-wayanad-bg px-2 py-1 rounded">
                    {alert.time}
                  </span>
                </div>
                <p className="text-wayanad-muted mt-1 text-sm leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* End of list */}
        <div className="text-center py-8">
          <p className="text-xs text-wayanad-muted uppercase tracking-widest">
            No older alerts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Alerts;

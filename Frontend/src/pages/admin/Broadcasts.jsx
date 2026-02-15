import React, { useState } from "react";
import { AlertTriangle, Send, MapPin, Radio, CheckCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Broadcasts = () => {
  const [formData, setFormData] = useState({
    type: "Wildlife Alert",
    severity: "High",
    location: "",
    message: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
        setSent(false);
        setFormData({ ...formData, location: "", message: "" });
    }, 3000);
  };

  const severityColors = {
    High: "bg-red-500 text-white shadow-red-500/50",
    Medium: "bg-orange-500 text-white shadow-orange-500/50",
    Low: "bg-blue-500 text-white shadow-blue-500/50",
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
        
      {/* HEADER */}
      <div className="mb-12 flex items-end justify-between">
        <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Broadcast Center</h1>
            <p className="text-gray-400 max-w-xl text-lg">
            Dispatch critical alerts to residents in real-time. Use with caution.
            </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-bold animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            LIVE SYSTEM
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: COMPOSER */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* Type & Severity */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Alert Category
                </label>
                <div className="relative group">
                    <select
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-medium transition-all group-hover:border-emerald-500/30"
                    value={formData.type}
                    onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                    }
                    >
                    <option>Wildlife Alert</option>
                    <option>Road Blockage</option>
                    <option>Power Outage</option>
                    <option>Water Supply</option>
                    <option>Public Safety</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-emerald-500">
                    <Radio size={20} />
                    </div>
                </div>
                </div>

                <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Severity Level
                </label>
                <div className="relative">
                    <select
                    className={`w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-${formData.severity === 'High' ? 'red' : formData.severity === 'Medium' ? 'orange' : 'blue'}-500 appearance-none font-bold`}
                    value={formData.severity}
                    onChange={(e) =>
                        setFormData({ ...formData, severity: e.target.value })
                    }
                    >
                    <option value="High">🔴 Critical</option>
                    <option value="Medium">🟠 Moderate</option>
                    <option value="Low">🔵 Info</option>
                    </select>
                </div>
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Target Sector / Location
                </label>
                <div className="relative group">
                <MapPin
                    className="absolute left-4 top-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                    size={20}
                />
                <input
                    type="text"
                    required
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-600 transition-all font-medium group-hover:border-white/20"
                    placeholder="e.g. Sector B, Main Market Area"
                    value={formData.location}
                    onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                    }
                />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Alert Message
                </label>
                <textarea
                required
                rows="5"
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-600 transition-all resize-none font-medium leading-relaxed group-hover:border-white/20"
                placeholder="Describe the incident details clearly..."
                value={formData.message}
                onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                }
                />
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-4">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    <Send size={20} />
                    Broadcast Alert
                </button>
            </div>
            </form>
        </motion.div>

        {/* RIGHT: LIVE PREVIEW */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
             <div className="bg-neutral-900/30 border border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center h-full relative">
                <div className="absolute top-6 left-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Device Preview
                </div>
                
                {/* Mobile Mockup */}
                <div className="w-[300px] bg-black border-[8px] border-neutral-800 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-xl z-20"></div>
                    
                    {/* Screen Content */}
                    <div className="bg-wayanad-bg h-[550px] w-full rounded-[2rem] overflow-hidden relative pt-12 px-4">
                        <div className="flex justify-between items-center mb-6 opacity-50">
                            <span className="text-[10px] text-white font-bold">9:41</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>

                        {/* The Notification Card */}
                        <AnimatePresence>
                            {(formData.location || formData.message) && (
                                <motion.div 
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg mb-4"
                                >
                                    <div className="flex gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${formData.severity === 'High' ? 'bg-red-500' : formData.severity === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                            <AlertTriangle size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{formData.type}</h4>
                                            <p className="text-[10px] text-gray-300 uppercase font-bold tracking-wider">{formData.severity} Severity</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 text-xs mb-2 leading-relaxed">
                                        {formData.message || "Alert description will appear here..."}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                        <MapPin size={10} /> {formData.location || "Location..."}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {!formData.location && !formData.message && (
                            <div className="text-center mt-20 opacity-30">
                                <Radio size={48} className="mx-auto text-white mb-4" />
                                <p className="text-xs text-white">Waiting for input...</p>
                            </div>
                        )}

                    </div>
                </div>
             </div>
        </motion.div>

      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {sent && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 20 }}
                    className="bg-neutral-900 border border-emerald-500/30 p-8 rounded-3xl text-center max-w-sm w-full shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Broadcast Sent!</h2>
                    <p className="text-gray-400 mb-6">The alert has been dispatched to all residents in the target sector.</p>
                    <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Broadcasts;
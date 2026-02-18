import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Info, Zap, MapPin, Check, Loader2 } from "lucide-react";
import { useAlerts } from "../context/AlertContext";

const CreateAlert = () => {
    const navigate = useNavigate();
    const { addAlert } = useAlerts();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        type: "info",
        message: "",
        location: "",
    });

    const severityOptions = [
        { id: "info", label: "General Info", color: "bg-blue-500", icon: Info },
        { id: "warning", label: "Warning", color: "bg-yellow-500", icon: Zap },
        { id: "critical", label: "Critical Danger", color: "bg-red-500", icon: AlertTriangle },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return;

        setLoading(true);

        try {
            await addAlert(formData);
            navigate("/alerts");
        } catch (error) {
            alert("Failed to broadcast alert. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-wayanad-panel transition-colors text-wayanad-muted hover:text-wayanad-text"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-wayanad-text">Broadcast Alert</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-wayanad-panel border border-wayanad-border rounded-2xl p-6 shadow-sm space-y-6">

                {/* Severity Selection */}
                <div>
                    <label className="text-xs font-bold text-wayanad-muted uppercase mb-3 block">Alert Severity</label>
                    <div className="grid grid-cols-3 gap-3">
                        {severityOptions.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => setFormData({ ...formData, type: option.id })}
                                className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.type === option.id
                                    ? `border-${option.color.replace("bg-", "")} bg-${option.color.replace("bg-", "")}/10`
                                    : "border-wayanad-border bg-wayanad-bg hover:border-wayanad-muted"
                                    }`}
                            >
                                <div className={`p-2 rounded-full text-white ${option.color} shadow-sm`}>
                                    <option.icon size={16} />
                                </div>
                                <span className={`text-xs font-bold ${formData.type === option.id ? "text-wayanad-text" : "text-wayanad-muted"}`}>
                                    {option.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Alert Title</label>
                    <input
                        type="text"
                        className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 font-bold"
                        placeholder="e.g., Wild Elephant Sighted"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>


                {/* Location (Optional) */}
                <div>
                    <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Location (Optional)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-wayanad-muted" />
                            <input
                                type="text"
                                className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 pl-11 text-wayanad-text outline-none focus:border-emerald-500"
                                placeholder="e.g., Near Sector B Market"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (!navigator.geolocation) {
                                    alert("Geolocation is not supported by your browser");
                                    return;
                                }

                                // Show temporary loading state if needed, or just rely on async update
                                const originalText = formData.location;
                                setFormData(prev => ({ ...prev, location: "Fetching location..." }));

                                navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                        try {
                                            const { latitude, longitude } = position.coords;
                                            const response = await fetch(
                                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                                            );
                                            const data = await response.json();

                                            if (data.display_name) {
                                                // Simplify address: take first 3 parts for brevity or full display_name
                                                // Taking a cleaner approach for UI
                                                const addressParts = data.display_name.split(',').slice(0, 3).join(', ');
                                                setFormData(prev => ({ ...prev, location: addressParts }));
                                            } else {
                                                setFormData(prev => ({ ...prev, location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
                                            }
                                        } catch (error) {
                                            console.error("Geocoding failed", error);
                                            setFormData(prev => ({ ...prev, location: originalText || "Location error" }));
                                            alert("Could not fetch address details.");
                                        }
                                    },
                                    () => {
                                        alert("Unable to retrieve your location");
                                        setFormData(prev => ({ ...prev, location: originalText }));
                                    }
                                );
                            }}
                            className="bg-wayanad-panel border border-wayanad-border text-emerald-600 p-4 rounded-xl hover:bg-emerald-500/10 transition-colors"
                            title="Get My Location"
                        >
                            <MapPin size={20} />
                        </button>
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Details</label>
                    <textarea
                        rows="4"
                        className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 resize-none"
                        placeholder="Describe the situation clearly..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-red-600 font-bold text-white shadow-lg hover:bg-red-500 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><AlertTriangle size={20} /> Broadcast Alert</>}
                </button>

            </form>
        </div>
    );
};

export default CreateAlert;

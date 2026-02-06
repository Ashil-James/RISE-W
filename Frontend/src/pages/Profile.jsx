import React, { useState, useRef, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit2,
    FileText,
    CheckCircle,
    Clock,
    ArrowLeft,
    Camera,
    Loader2,
    Check,
    LogOut,
    Save,
    X,
    Lock,
    Shield,
    Eye,
    EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { useUser } from "../context/UserContext";

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { user, updateProfile, logout } = useUser();

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);

    // Password Change State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [passwordStatus, setPasswordStatus] = useState("idle"); // idle | loading | success | error
    const [passwordError, setPasswordError] = useState("");

    // Password Visibility State
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Local state for editing, synced with user context on mount/change
    const [formData, setFormData] = useState(user);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | success | error

    // Handle Input Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(user); // Reset to original
        setIsEditing(false);
    };

    // Handle Avatar Change
    const handleImagePick = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            // Immediately update profile for avatar
            updateProfile({ avatar: imageUrl });
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Password Change Handlers
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordError(""); // Clear error on typing
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const submitPasswordChange = (e) => {
        e.preventDefault();
        setPasswordStatus("loading");

        // Basic Validation
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            setPasswordStatus("idle");
            setPasswordError("All fields are required");
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            setPasswordStatus("idle");
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordData.new.length < 6) {
            setPasswordStatus("idle");
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        // Simulate API Call
        setTimeout(() => {
            setPasswordStatus("success");
            // Reset after success
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordStatus("idle");
                setPasswordData({ current: "", new: "", confirm: "" });
                setShowPassword({ current: false, new: false, confirm: false });
            }, 1500);
        }, 1500);
    };

    // Handle Location Auto-Detect
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocationStatus("loading");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse Geocode
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    let newLocation = "";
                    if (data.display_name) {
                        newLocation = data.display_name.split(',').slice(0, 3).join(', '); // Shorten address
                    } else {
                        newLocation = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                    }

                    // Update form data directly
                    setFormData(prev => ({ ...prev, location: newLocation }));
                    // Also update global state if not in edit mode (optional, but good UX to just save it)
                    if (!isEditing) {
                        updateProfile({ location: newLocation });
                    }

                } catch (e) {
                    console.error("Geocoding failed", e);
                    const newLocation = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                    setFormData(prev => ({ ...prev, location: newLocation }));
                    if (!isEditing) updateProfile({ location: newLocation });
                }

                setLocationStatus("success");
                setTimeout(() => setLocationStatus("idle"), 3000); // Reset success state after 3s
            },
            () => {
                setLocationStatus("error");
                alert("Unable to retrieve your location");
                setTimeout(() => setLocationStatus("idle"), 3000);
            },
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-enter pb-10">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-wayanad-muted hover:text-wayanad-text transition-colors"
                >
                    <ArrowLeft size={20} /> <span className="font-medium">Back</span>
                </button>
            </div>

            {/* Main Profile Card */}
            <div className="bg-wayanad-panel border border-wayanad-border rounded-3xl overflow-hidden shadow-lg">

                {/* Banner */}
                <div className="h-48 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-8 relative">

                    {/* Avatar Section */}
                    <div className="flex justify-between items-end -mt-16 mb-6">
                        <div className="relative group">
                            <div className="rounded-full border-4 border-wayanad-panel bg-wayanad-bg p-1 shadow-xl relative overflow-hidden">
                                <Avatar
                                    src={user.avatar}
                                    name={user.name}
                                    size="xl"
                                    className="bg-gray-100"
                                />
                                {/* Upload Overlay */}
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                                >
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImagePick}
                                accept="image/*. .jpg, .jpeg, .png"
                                className="hidden"
                            />

                            <div className="absolute bottom-4 right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-wayanad-panel flex items-center justify-center pointer-events-none">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-wayanad-bg border border-wayanad-border text-wayanad-muted font-medium hover:bg-red-500/5 hover:text-red-500 transition-all shadow-sm"
                                    >
                                        <X size={16} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 border border-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all shadow-sm"
                                    >
                                        <Save size={16} />
                                        <span>Save Changes</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-wayanad-bg border border-wayanad-border text-wayanad-text font-medium hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
                                >
                                    <Edit2 size={16} />
                                    <span>Edit Profile</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-8">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="text-3xl font-bold text-wayanad-text bg-transparent border-b border-emerald-500 outline-none w-full max-w-md pb-1"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-wayanad-text">{user.name}</h1>
                        )}
                        <p className="text-emerald-500 font-medium mt-1">Community Member</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-wayanad-muted uppercase tracking-wider mb-4">Contact Information</h3>

                            {/* Email */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-wayanad-bg/50 border border-wayanad-border">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-wayanad-muted">Email Address</p>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent border-b border-blue-500/50 outline-none text-wayanad-text font-medium pt-1"
                                        />
                                    ) : (
                                        <p className="text-wayanad-text font-medium truncate">{user.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-wayanad-bg/50 border border-wayanad-border">
                                <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-wayanad-muted">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent border-b border-violet-500/50 outline-none text-wayanad-text font-medium pt-1"
                                        />
                                    ) : (
                                        <p className="text-wayanad-text font-medium">{user.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-wayanad-bg/50 border border-wayanad-border">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs text-wayanad-muted">Location</p>
                                        <p className="text-wayanad-text font-medium truncate">{user.location}</p>
                                    </div>
                                </div>

                                {/* Geolocation Button */}
                                <button
                                    onClick={handleGetLocation}
                                    disabled={locationStatus === 'loading' || locationStatus === 'success'}
                                    className={`p-2 rounded-lg transition-all ${locationStatus === 'success'
                                        ? 'bg-emerald-500 text-white'
                                        : locationStatus === 'error'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-wayanad-bg border border-wayanad-border text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                    title="Update Location"
                                >
                                    {locationStatus === 'loading' ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : locationStatus === 'success' ? (
                                        <Check size={18} />
                                    ) : (
                                        <MapPin size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Stats & Security for mobile/desktop layout balance */}
                        <div className="space-y-6">
                            {/* Security Section (New) */}
                            <div>
                                <h3 className="text-sm font-bold text-wayanad-muted uppercase tracking-wider mb-4">Security</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-wayanad-bg border border-wayanad-border hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="text-wayanad-text font-medium">Change Password</p>
                                                <p className="text-xs text-wayanad-muted">Update your account security</p>
                                            </div>
                                        </div>
                                        <ArrowLeft size={16} className="rotate-180 text-wayanad-muted group-hover:text-emerald-500 transition-colors" />
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-wayanad-bg border border-wayanad-border hover:border-red-500 hover:bg-red-500/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                <LogOut size={20} />
                                            </div>
                                            <div>
                                                <p className="text-wayanad-text font-medium">Log Out</p>
                                                <p className="text-xs text-wayanad-muted">Sign out of your account</p>
                                            </div>
                                        </div>
                                        <ArrowLeft size={16} className="rotate-180 text-wayanad-muted group-hover:text-red-500 transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div>
                                <h3 className="text-sm font-bold text-wayanad-muted uppercase tracking-wider mb-4">Impact Overview</h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Total Reports */}
                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-wayanad-text font-bold text-lg">{user.stats.total}</p>
                                                <p className="text-xs text-emerald-600 font-medium uppercase">Total Reports</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Resolved */}
                                        <div className="p-4 rounded-2xl bg-wayanad-bg border border-wayanad-border flex flex-col items-center justify-center text-center gap-2">
                                            <div className="text-emerald-500">
                                                <CheckCircle size={24} />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-wayanad-text">{user.stats.resolved}</p>
                                                <p className="text-xs text-wayanad-muted">Resolved</p>
                                            </div>
                                        </div>

                                        {/* Pending */}
                                        <div className="p-4 rounded-2xl bg-wayanad-bg border border-wayanad-border flex flex-col items-center justify-center text-center gap-2">
                                            <div className="text-orange-500">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-wayanad-text">{user.stats.pending}</p>
                                                <p className="text-xs text-wayanad-muted">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-enter">
                    <div className="w-full max-w-md bg-wayanad-panel border border-wayanad-border rounded-3xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="absolute top-4 right-4 text-wayanad-muted hover:text-wayanad-text"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-wayanad-text">Change Password</h2>
                            <p className="text-wayanad-muted text-sm">Ensure your new password is at least 6 characters long.</p>
                        </div>

                        {passwordStatus === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center animate-enter">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                    <Check size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-wayanad-text">Success!</h3>
                                <p className="text-wayanad-muted">Your password has been updated securely.</p>
                            </div>
                        ) : (
                            <form onSubmit={submitPasswordChange} className="space-y-4">
                                {passwordError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                                        {passwordError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-wayanad-muted uppercase tracking-wider mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            name="current"
                                            value={passwordData.current}
                                            onChange={handlePasswordChange}
                                            className="w-full p-4 pr-12 rounded-xl bg-wayanad-bg border border-wayanad-border text-wayanad-text outline-none focus:border-emerald-500 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-wayanad-muted hover:text-wayanad-text transition-colors"
                                        >
                                            {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-wayanad-muted uppercase tracking-wider mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            name="new"
                                            value={passwordData.new}
                                            onChange={handlePasswordChange}
                                            className="w-full p-4 pr-12 rounded-xl bg-wayanad-bg border border-wayanad-border text-wayanad-text outline-none focus:border-emerald-500 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-wayanad-muted hover:text-wayanad-text transition-colors"
                                        >
                                            {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-wayanad-muted uppercase tracking-wider mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            name="confirm"
                                            value={passwordData.confirm}
                                            onChange={handlePasswordChange}
                                            className="w-full p-4 pr-12 rounded-xl bg-wayanad-bg border border-wayanad-border text-wayanad-text outline-none focus:border-emerald-500 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-wayanad-muted hover:text-wayanad-text transition-colors"
                                        >
                                            {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordStatus === 'loading'}
                                    className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mt-4"
                                >
                                    {passwordStatus === 'loading' ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <span>Update Password</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

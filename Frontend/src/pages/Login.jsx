import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, ShieldCheck, Leaf, Droplets, Zap, Construction } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { authorityType } = useParams();

  const { user, login: authLogin } = useAuth();
  const { login: userLogin } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const getTheme = () => {
    switch (authorityType?.toLowerCase()) {
      case "water":
        return { name: "Water Authority", icon: Droplets, gradient: "from-sky-500 to-blue-600", accent: "text-sky-600 dark:text-sky-400", ring: "focus:ring-sky-500", glow: "shadow-sky-500/40" };
      case "power":
        return { name: "Power Authority", icon: Zap, gradient: "from-amber-400 to-orange-600", accent: "text-amber-600 dark:text-amber-400", ring: "focus:ring-amber-500", glow: "shadow-amber-500/40" };
      case "road":
        return { name: "Road Authority", icon: Construction, gradient: "from-orange-400 to-red-600", accent: "text-orange-600 dark:text-orange-400", ring: "focus:ring-orange-500", glow: "shadow-orange-500/40" };
      default:
        return { name: "RISE System", icon: Leaf, gradient: "from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600", accent: "text-emerald-600 dark:text-emerald-400", ring: "focus:ring-emerald-500", glow: "shadow-emerald-500/40 dark:shadow-emerald-500/20" };
    }
  };

  const theme = getTheme();

  useEffect(() => {
    if (user) {
      const userRole = user.role || "user";
      const department = user.department?.toUpperCase();

      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "authority" || userRole.includes("authority")) {
        if (department === "WATER") navigate("/authority/water/dashboard");
        else if (department === "ELECTRICITY" || userRole === "power_authority") navigate("/authority/power/dashboard");
        else if (department === "CIVIL" || userRole === "road_authority") navigate("/authority/road/dashboard");
        else navigate("/authority/water/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: response } = await axios.post(
        "/api/v1/auth/login",
        { email: formData.email, password: formData.password }
      );

      const userData = response.data;
      if (!userData.token) throw new Error("No token received from server");

      authLogin(userData);
      userLogin(userData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#020907] p-4 sm:p-6 lg:p-8 transition-colors duration-500 font-sans">
      
      {/* MAGNIFICENT SOFT MESH GRADIENT BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left Organic Glow - INCREASED OPACITY */}
        <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] max-h-[800px] max-w-[800px] rounded-full bg-emerald-400/30 dark:bg-emerald-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        {/* Bottom Right organic glow - INCREASED OPACITY */}
        <div className="absolute -bottom-[20%] -right-[10%] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full bg-teal-400/30 dark:bg-teal-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-200" />
        {/* Center subtle bridge */}
        <div className="absolute top-[20%] left-[20%] h-[50vw] w-[50vw] max-h-[500px] max-w-[500px] rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-500" />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* CENTRAL GLASS CONTAINER - ENHANCED BLUR & BORDERS */}
      <div className="relative z-10 flex w-full max-w-[1050px] flex-col overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/10 bg-white/50 dark:bg-[#03150e]/40 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-[40px] lg:flex-row animate-fade-up ring-1 ring-white/50 dark:ring-white/5">

        {/* LEFT PANE: Info & Branding */}
        <div className="relative flex flex-col justify-between p-10 lg:w-[45%] lg:p-14 border-b lg:border-b-0 lg:border-r border-white/40 dark:border-white/5 bg-gradient-to-br from-white/40 to-white/10 dark:from-emerald-950/20 dark:to-transparent">
          {/* Subtle inside glow for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 dark:opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg ${theme.glow} ring-1 ring-white/20`}>
                <theme.icon className="h-7 w-7" />
              </div>
              <span className="text-2xl font-black tracking-widest text-emerald-950 dark:text-white uppercase mt-1">
                {theme.name === "RISE System" ? "RISE" : theme.name}
              </span>
            </div>
            
            <h1 className="mt-8 text-4xl font-black tracking-tight text-emerald-950 dark:text-white lg:text-[3.25rem] leading-[1.05]">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 drop-shadow-sm">
                Communities.
              </span>
            </h1>
            <p className="mt-6 text-lg font-medium leading-relaxed text-emerald-800 dark:text-emerald-100/70 max-w-sm">
              A unified, deeply integrated ecosystem designed to connect citizens with authorities for faster, more transparent incident resolution.
            </p>
          </div>

          <div className="mt-12 hidden lg:block relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#02100b] bg-emerald-200 dark:bg-emerald-800 ring-2 ring-emerald-500/20" />
                <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#02100b] bg-teal-200 dark:bg-teal-800 ring-2 ring-teal-500/20" />
                <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#02100b] bg-cyan-200 dark:bg-cyan-800 ring-2 ring-cyan-500/20" />
              </div>
              <p className="text-[15px] font-bold text-emerald-900/70 dark:text-emerald-300/80">
                Join 10,000+ residents.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: The Form */}
        <div className="flex flex-col justify-center bg-white/70 dark:bg-transparent p-10 lg:w-[55%] lg:p-14 relative">
          <div className="mb-10 max-w-[420px]">
            <h2 className="text-[2rem] font-black tracking-tight text-emerald-950 dark:text-white leading-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-[15.5px] font-medium text-emerald-800/70 dark:text-slate-400">
              Please enter your details to sign in to your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-[420px] space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[13px] uppercase tracking-wider font-bold text-emerald-900/80 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-emerald-800/40 dark:text-slate-500 transition-colors duration-300 group-focus-within:text-emerald-500 group-focus-within:scale-110" />
                  </div>
                  <input
                    type="email"
                    required
                    className={`block w-full rounded-2xl border border-emerald-900/10 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] py-4 pl-12 pr-4 text-[15px] font-medium text-emerald-950 dark:text-white placeholder-emerald-900/30 dark:placeholder-slate-600 outline-none transition-all duration-300 ${theme.ring} focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-[#061e16] focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:bg-white dark:hover:bg-white/[0.05]`}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[13px] uppercase tracking-wider font-bold text-emerald-900/80 dark:text-slate-400">
                    Password
                  </label>
                  <a href="#" className={`text-[13px] font-bold ${theme.accent} hover:underline transition-all`}>
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-emerald-800/40 dark:text-slate-500 transition-colors duration-300 group-focus-within:text-emerald-500 group-focus-within:scale-110" />
                  </div>
                  <input
                    type="password"
                    required
                    className={`block w-full rounded-2xl border border-emerald-900/10 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] py-4 pl-12 pr-4 text-[15px] font-medium text-emerald-950 dark:text-white placeholder-emerald-900/30 dark:placeholder-slate-600 outline-none transition-all duration-300 ${theme.ring} focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-[#061e16] focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:bg-white dark:hover:bg-white/[0.05]`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${theme.gradient} py-4 text-[15px] font-bold text-white shadow-xl ${theme.glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(16,185,129,0.35)] active:translate-y-0 disabled:opacity-70 ring-1 ring-white/20 inset-ring-default overflow-hidden relative`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />}
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>

          <div className="mt-10 text-left max-w-[420px]">
            <p className="text-[15px] font-medium text-emerald-900/60 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className={`font-bold ${theme.accent} hover:underline transition-all`}>
                Create an account
              </Link>
            </p>
          </div>

          {/* Test Credentials Helper */}
          <div className="mt-10 max-w-[420px] rounded-xl border border-emerald-900/10 dark:border-white/5 bg-emerald-50/50 dark:bg-white/[0.02] p-4 text-center transition-colors hover:bg-emerald-50 dark:hover:bg-white/[0.04]">
            <p className="text-xs font-medium text-emerald-900/60 dark:text-slate-400">
              <span className="font-bold text-emerald-950 dark:text-slate-300">Demo Access:</span> Try using 
              <span className={`mx-1 font-bold rounded bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 ${theme.accent}`}>admin@rise.com</span> 
              to access the administration portal.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

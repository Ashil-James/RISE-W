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
        return { name: "Water Authority", icon: Droplets, gradient: "from-sky-500 to-blue-600", accent: "text-sky-600 dark:text-sky-400", ring: "focus:ring-sky-500", glow: "shadow-sky-500/25" };
      case "power":
        return { name: "Power Authority", icon: Zap, gradient: "from-amber-500 to-orange-600", accent: "text-amber-600 dark:text-amber-400", ring: "focus:ring-amber-500", glow: "shadow-amber-500/25" };
      case "road":
        return { name: "Road Authority", icon: Construction, gradient: "from-orange-500 to-red-600", accent: "text-orange-600 dark:text-orange-400", ring: "focus:ring-orange-500", glow: "shadow-orange-500/25" };
      default:
        return { name: "RISE System", icon: Leaf, gradient: "from-emerald-500 to-teal-600", accent: "text-emerald-600 dark:text-emerald-400", ring: "focus:ring-emerald-500", glow: "shadow-emerald-500/25" };
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#020e0b] p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      
      {/* MAGNIFICENT SOFT MESH GRADIENT BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left Organic Glow */}
        <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] max-h-[800px] max-w-[800px] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[100px] sm:blur-[140px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        {/* Bottom Right organic glow */}
        <div className="absolute -bottom-[20%] -right-[10%] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[100px] sm:blur-[140px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-200" />
        {/* Center subtle bridge */}
        <div className="absolute top-[20%] left-[20%] h-[50vw] w-[50vw] max-h-[500px] max-w-[500px] rounded-full bg-cyan-400/10 dark:bg-cyan-600/5 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-500" />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* CENTRAL GLASS CONTAINER */}
      <div className="relative z-10 flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl lg:flex-row animate-fade-up">

        {/* LEFT PANE: Info & Branding */}
        <div className="relative flex flex-col justify-between p-10 lg:w-[45%] lg:p-14 border-b lg:border-b-0 lg:border-r border-white/40 dark:border-white/5">
          <div>
            <div className="mb-6 inline-flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg ${theme.glow}`}>
                <theme.icon className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-widest text-emerald-950 dark:text-white uppercase mt-1">
                {theme.name === "RISE System" ? "RISE" : theme.name}
              </span>
            </div>
            
            <h1 className="mt-8 text-4xl font-black tracking-tight text-emerald-950 dark:text-white lg:text-5xl leading-[1.1]">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                Communities.
              </span>
            </h1>
            <p className="mt-6 text-[1.05rem] font-medium leading-relaxed text-emerald-800 dark:text-emerald-100/70">
              A unified, deeply integrated ecosystem designed to connect citizens with authorities for faster, more transparent incident resolution.
            </p>
          </div>

          <div className="mt-12 hidden lg:block">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="h-10 w-10 rounded-full border-2 border-white dark:border-[#07221d] bg-emerald-200 dark:bg-emerald-800" />
                <div className="h-10 w-10 rounded-full border-2 border-white dark:border-[#07221d] bg-teal-200 dark:bg-teal-800" />
                <div className="h-10 w-10 rounded-full border-2 border-white dark:border-[#07221d] bg-cyan-200 dark:bg-cyan-800" />
              </div>
              <p className="text-sm font-bold text-emerald-900/60 dark:text-emerald-300/60">
                Join 10,000+ residents.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: The Form */}
        <div className="flex flex-col justify-center bg-white/60 dark:bg-black/20 p-10 lg:w-[55%] lg:p-14">
          <div className="mb-8 max-w-[400px]">
            <h2 className="text-3xl font-black tracking-tight text-emerald-950 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-[15px] font-medium text-emerald-800/70 dark:text-slate-400">
              Please enter your details to sign in to your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-emerald-900 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-emerald-800/40 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                </div>
                <input
                  type="email"
                  required
                  className={`block w-full rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02] py-4 pl-12 pr-4 text-[15px] font-medium text-emerald-950 dark:text-white placeholder-emerald-900/30 dark:placeholder-slate-500 outline-none transition-all ${theme.ring} focus:ring-2 focus:border-transparent focus:shadow-[0_4px_20px_rgba(16,185,129,0.1)]`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-bold text-emerald-900 dark:text-slate-300">
                  Password
                </label>
                <a href="#" className={`text-sm font-bold ${theme.accent} hover:underline`}>
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-emerald-800/40 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                </div>
                <input
                  type="password"
                  required
                  className={`block w-full rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02] py-4 pl-12 pr-4 text-[15px] font-medium text-emerald-950 dark:text-white placeholder-emerald-900/30 dark:placeholder-slate-500 outline-none transition-all ${theme.ring} focus:ring-2 focus:border-transparent focus:shadow-[0_4px_20px_rgba(16,185,129,0.1)]`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${theme.gradient} py-4 text-[15px] font-bold text-white shadow-xl ${theme.glow} transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)] active:translate-y-0 disabled:opacity-70`}
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-8 text-left max-w-[400px]">
            <p className="text-[15px] font-medium text-emerald-900/60 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className={`font-bold ${theme.accent} hover:underline`}>
                Create an account
              </Link>
            </p>
          </div>

          {/* Test Credentials Helper */}
          <div className="mt-8 max-w-[400px] rounded-xl border border-dashed border-emerald-900/20 dark:border-white/10 bg-emerald-50/50 dark:bg-white/[0.01] p-4 text-center">
            <p className="text-xs font-medium text-emerald-900/60 dark:text-slate-400">
              <span className="font-bold text-emerald-950 dark:text-slate-300">Demo Access:</span> Try using 
              <span className={`mx-1 font-bold ${theme.accent}`}>admin@rise.com</span> 
              to access the administration portal.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

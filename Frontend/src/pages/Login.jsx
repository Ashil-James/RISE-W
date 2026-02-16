import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

// CHANGE 1: Import useAuth instead of useUser
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();

  // CHANGE 2: Destructure from useAuth() and useUser()
  const { user, login: authLogin } = useAuth();
  const { login: userLogin } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // CHANGE 3: Redirect based on Role
    if (user) {
      const userRole = user.role || "user";
      if (userRole === "admin") navigate("/admin/dashboard");
      else if (userRole === "authority") navigate("/authority/dashboard");
      else navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // REAL BACKEND CALL - Using proxy /api/v1
      const { data } = await axios.post(
        "/api/v1/auth/login",
        { email: formData.email, password: formData.password }
      );

      // Check for token
      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Update Contexts
      authLogin(data);
      userLogin(data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : "Invalid email or password"
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-200"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-green-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-300"></div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-white/30 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg text-white mb-4">
              <Leaf className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 dark:text-gray-300 mt-2">
              Sign in to manage Wayanad Township
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-emerald-600 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Helper for Testing */}
          <div className="mt-4 text-xs text-center text-gray-400">
            <p>
              Try: <b>admin@rise.com</b> for Admin Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

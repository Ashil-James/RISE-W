import React, { useState } from "react";
import { User, Mail, Lock, Phone, ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup logic here...", formData);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      {/* --- BACKGROUND BLOBS --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-teal-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-200"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-green-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-300"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-lg animate-fade-up">
        <div
          className="
          bg-wayanad-panel 
          backdrop-blur-xl 
          border border-wayanad-border 
          rounded-3xl shadow-2xl 
          p-8 md:p-10
        "
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg text-white mb-4 transform hover:rotate-12 transition-transform duration-300">
              <Leaf className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-wayanad-text tracking-tight">
              Join the Community
            </h2>
            <p className="text-wayanad-muted mt-2">
              Create your account to contribute to Wayanad
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-wayanad-text mb-2 ml-1">
                  First Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-wayanad-muted group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text placeholder-wayanad-muted/70 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-wayanad-text mb-2 ml-1">
                  Last Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-wayanad-muted group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text placeholder-wayanad-muted/70 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-wayanad-text mb-2 ml-1">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-wayanad-muted group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text placeholder-wayanad-muted/70 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-wayanad-text mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-wayanad-muted group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text placeholder-wayanad-muted/70 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-wayanad-text mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-wayanad-muted group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text placeholder-wayanad-muted/70 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-2 text-xs text-wayanad-muted text-right">
                Must be at least 8 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-4 
                bg-gradient-to-r from-emerald-600 to-teal-600 
                hover:from-emerald-700 hover:to-teal-700
                text-white font-semibold rounded-xl shadow-lg 
                shadow-emerald-500/30 hover:shadow-emerald-500/40
                transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200 mt-2"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-wayanad-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-all"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-wayanad-dark text-wayanad-text overflow-hidden relative font-sans">
      {/* Background Ambience (Glowing Orbs) */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-wayanad-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Mobile Container */}
      <div className="relative z-10 max-w-md mx-auto h-screen flex flex-col bg-white/0 shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="p-6 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
          <h1 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            WAYANAD CONNECT
          </h1>
          {/* User Avatar Placeholder */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 border-2 border-white/20 shadow-lg" />
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

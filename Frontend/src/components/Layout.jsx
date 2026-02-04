import React from "react";
import { Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Layout = () => {
  return (
    <div className="min-h-screen w-full bg-wayanad-bg text-wayanad-text transition-colors duration-300 font-sans relative flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen dark:bg-emerald-500/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-screen dark:bg-blue-500/10" />
      </div>

      {/* HEADER: Full Width (Web Style) 
          - Removed 'max-w-7xl' and 'mx-auto'
          - Added 'w-full' and larger padding 'px-6 md:px-12' 
      */}
      <header className="sticky top-0 z-50 w-full bg-wayanad-bg/90 backdrop-blur-md border-b border-wayanad-border/50">
        <div className="w-full px-6 md:px-12 py-4 flex justify-between items-center">
          {/* Logo: Pushed to far left */}
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 cursor-pointer">
            WAYANAD CONNECT
          </h1>

          {/* Controls: Pushed to far right */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 border-2 border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Centered & Constrained (App Style)
          - Keeps forms and text readable by preventing them from stretching too wide
      */}
      <div className="flex-1 w-full max-w-4xl mx-auto relative z-10">
        <main className="p-6 md:p-10 pb-24 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

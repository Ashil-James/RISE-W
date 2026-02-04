import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col font-sans selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-wayanad-border bg-wayanad-bg/80 backdrop-blur-md">
        <div className="w-full px-6 md:px-12 py-4 flex justify-between items-center">
          {/* Logo: Added onClick handler */}
          <h1
            onClick={() => navigate("/")} // 3. Redirect to Home on click
            className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />{" "}
            {/* Status Indicator */}
            <span className="text-wayanad-text">WAYANAD</span>
            <span className="text-emerald-500">CONNECT</span>
          </h1>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 dark:from-zinc-700 dark:to-zinc-600 p-[1px] cursor-pointer hover:ring-2 ring-emerald-500/50 transition-all">
              <div className="w-full h-full rounded-full bg-wayanad-bg flex items-center justify-center overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 w-full max-w-5xl mx-auto relative z-10">
        <main className="p-6 md:p-10 pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";
import { useUser } from "../context/UserContext";

const Layout = () => {
  const navigate = useNavigate();
  const { user } = useUser();

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
            <div
              onClick={() => navigate("/profile")}
              className="cursor-pointer hover:ring-2 ring-emerald-500/50 rounded-full transition-all"
            >
              <Avatar
                src={user.avatar}
                name={user.name}
                size="sm"
              />
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

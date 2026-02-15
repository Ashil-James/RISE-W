import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  // Initialize state: Check localStorage first, then default to 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      // If user specifically saved 'light', respect it
      if (savedTheme === "light") {
        return "light";
      }
      // Otherwise, default to 'dark' (even if system is light, we want app to be dark by default)
      return "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  // Toggle function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-all duration-300 ease-in-out
        bg-wayanad-panel border border-wayanad-border shadow-sm
        hover:scale-110 active:scale-95 text-wayanad-text"
      aria-label="Toggle Theme"
    >
      <Sun
        className={`w-5 h-5 transition-all duration-300 absolute ${theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
      />
      <Moon
        className={`w-5 h-5 transition-all duration-300 ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
      />
    </button>
  );
};

export default ThemeToggle;

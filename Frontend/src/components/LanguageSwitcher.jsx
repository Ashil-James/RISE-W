import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
];

const LanguageSwitcher = ({ autoDetected }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-wayanad-text hover:border-emerald-500/30 transition-all"
      >
        <Globe size={14} className="text-emerald-500" />
        <span>{currentLang.flag} {currentLang.label}</span>
        <ChevronDown size={12} className={`text-wayanad-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-50"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  i18n.language === lang.code
                    ? "text-emerald-500 bg-emerald-500/5"
                    : "text-wayanad-text hover:bg-white/5"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {i18n.language === lang.code && <Check size={14} className="text-emerald-500" />}
              </button>
            ))}
            {autoDetected && (
              <div className="px-4 py-2 border-t border-white/5 text-[10px] text-wayanad-muted text-center">
                Auto-detected from your location
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  getAdminAuthorityLabel,
  getAdminStatusMeta,
  getAdminUrgencyMeta,
} from "../../utils/adminPortal";

export const surfaceClassName =
  "rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]";

export const AdminSurface = ({ children, className = "" }) => (
  <div className={`${surfaceClassName} ${className}`}>{children}</div>
);

export const AdminPageHeader = ({ title, description, actions, eyebrow = "RISE Admin" }) => (
  <div className="sticky top-4 z-20 mb-6">
    <AdminSurface className="px-5 py-5 md:px-7 md:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300/75 mb-2">
            {eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-300/85">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </AdminSurface>
  </div>
);

export const AdminActionButton = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_12px_35px_-12px_rgba(16,185,129,0.7)] hover:shadow-[0_16px_45px_-12px_rgba(16,185,129,0.9)] hover:brightness-110",
    secondary: "border border-white/10 bg-white/[0.03] text-white hover:border-emerald-400/30 hover:bg-white/[0.06]",
    subtle: "border border-transparent bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]",
    danger: "border border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-400/40 hover:text-red-200",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ y: -1, scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export const AdminStatCard = ({
  title,
  value,
  description,
  icon: Icon,
  tone = "emerald",
  onClick,
}) => {
  const tones = {
    emerald: "bg-emerald-500/[0.03] border-emerald-500/10 text-emerald-300 group-hover:border-emerald-500/30",
    amber: "bg-amber-500/[0.03] border-amber-500/10 text-amber-300 group-hover:border-amber-500/30",
    rose: "bg-rose-500/[0.03] border-rose-500/10 text-rose-300 group-hover:border-rose-500/30",
    sky: "bg-sky-500/[0.03] border-sky-500/10 text-sky-300 group-hover:border-sky-500/30",
    slate: "bg-white/[0.02] border-white/5 text-slate-300 group-hover:border-white/20",
  };

  const body = (
    <div className={`h-full rounded-[2rem] p-6 transition-all duration-300 border ${tones[tone] || tones.emerald}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-75">
            {title}
          </p>
          <p className="mt-2 text-4xl font-black text-white">{value}</p>
          {description ? (
            <p className="mt-3 text-sm text-slate-400/90 leading-snug">{description}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className={`rounded-full p-3 ${tones[tone] || tones.emerald} bg-opacity-20 backdrop-blur-md border border-white/10`}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!onClick) return body;

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left w-full h-full group"
    >
      {body}
    </motion.button>
  );
};

export const AdminStatusBadge = ({ status }) => {
  const meta = getAdminStatusMeta(status);

  return (
    <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${meta.badgeClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

export const AdminUrgencyBadge = ({ urgency }) => {
  const meta = getAdminUrgencyMeta(urgency);

  return (
    <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${meta.badgeClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

export const AdminAuthorityBadge = ({ authority }) => (
  <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
    {getAdminAuthorityLabel(authority)}
  </span>
);

export const AdminEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => (
  <AdminSurface className={`p-10 text-center ${className}`}>
    {Icon ? (
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400">
        <Icon size={24} />
      </div>
    ) : null}
    <p className="text-lg font-bold text-white">{title}</p>
    <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300/75">{description}</p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </AdminSurface>
);

export const AdminRowLink = ({ label = "Open", onClick }) => (
  <span
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-emerald-300 hover:text-white"
  >
    {label}
    <ChevronRight size={16} />
  </span>
);

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  getAdminAuthorityLabel,
  getAdminStatusMeta,
  getAdminUrgencyMeta,
} from "../../utils/adminPortal";

export const surfaceClassName =
  "rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(9,14,24,0.82),rgba(9,14,24,0.62))] backdrop-blur-2xl shadow-[0_18px_70px_-28px_rgba(0,0,0,0.65)]";

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
      "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_16px_45px_-18px_rgba(16,185,129,0.8)]",
    secondary: "border border-white/10 bg-white/[0.04] text-white hover:border-emerald-400/30",
    subtle: "border border-white/10 bg-black/20 text-slate-200 hover:text-white",
    danger: "border border-red-500/20 bg-red-500/10 text-red-200 hover:border-red-400/40",
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
    emerald: "from-emerald-500/16 to-cyan-500/12 text-emerald-200",
    amber: "from-amber-500/16 to-orange-500/12 text-amber-200",
    rose: "from-rose-500/16 to-red-500/12 text-rose-200",
    sky: "from-sky-500/16 to-cyan-500/12 text-sky-200",
    slate: "from-slate-500/16 to-slate-300/8 text-slate-200",
  };

  const body = (
    <AdminSurface className={`h-full p-5 bg-gradient-to-br ${tones[tone] || tones.emerald}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-300/75">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
          {description ? (
            <p className="mt-2 text-sm text-slate-300/80">{description}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </AdminSurface>
  );

  if (!onClick) return body;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="text-left"
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

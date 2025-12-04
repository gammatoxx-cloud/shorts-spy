"use client";

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: "blue" | "purple" | "teal" | "yellow" | "emerald";
  onClick?: () => void;
}

export default function DashboardStatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient = "blue",
  onClick,
}: DashboardStatsCardProps) {
  const gradientConfig = {
    blue: {
      icon: "from-blue-500/30 to-purple-500/30 border-blue-500/40 text-blue-400",
      border: "border-l-blue-500/60",
      bg: "bg-gradient-to-br from-blue-500/5 to-purple-500/5",
      glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    },
    purple: {
      icon: "from-purple-500/30 to-pink-500/30 border-purple-500/40 text-purple-400",
      border: "border-l-purple-500/60",
      bg: "bg-gradient-to-br from-purple-500/5 to-pink-500/5",
      glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    },
    teal: {
      icon: "from-teal-500/30 to-cyan-500/30 border-teal-500/40 text-teal-400",
      border: "border-l-teal-500/60",
      bg: "bg-gradient-to-br from-teal-500/5 to-cyan-500/5",
      glow: "hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]",
    },
    yellow: {
      icon: "from-yellow-500/30 to-orange-500/30 border-yellow-500/40 text-yellow-400",
      border: "border-l-yellow-500/60",
      bg: "bg-gradient-to-br from-yellow-500/5 to-orange-500/5",
      glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    },
    emerald: {
      icon: "from-emerald-500/30 to-green-500/30 border-emerald-500/40 text-emerald-400",
      border: "border-l-emerald-500/60",
      bg: "bg-gradient-to-br from-emerald-500/5 to-green-500/5",
      glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    },
  };

  const config = gradientConfig[gradient];
  const baseClasses = onClick 
    ? "cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1" 
    : "";

  return (
    <div
      className={`card-modern p-6 relative overflow-hidden border-l-4 ${config.border} ${config.bg} ${config.glow} ${baseClasses} group`}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${config.bg}`} />
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/70 mb-2 font-medium tracking-wide uppercase text-xs">{title}</p>
          <p className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.icon} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}


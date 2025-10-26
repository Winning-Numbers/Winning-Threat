const MetricCard = ({ title, value, subtitle, trend, status = "normal", icon }) => {
  const statusColors = {
    normal: "border-slate-700/50 hover:border-blue-500/50",
    warning: "border-yellow-600/50 hover:border-yellow-500/50",
    danger: "border-red-600/50 hover:border-red-500/50",
    success: "border-green-600/50 hover:border-green-500/50",
  };

  const statusBg = {
    normal: "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
    warning: "bg-gradient-to-br from-yellow-950/90 to-yellow-900/50",
    danger: "bg-gradient-to-br from-red-950/90 to-red-900/50",
    success: "bg-gradient-to-br from-green-950/90 to-green-900/50",
  };

  const iconColors = {
    normal: "text-blue-400",
    warning: "text-yellow-400",
    danger: "text-red-400",
    success: "text-green-400",
  };

  return (
    <div className={`${statusBg[status]} backdrop-blur-sm border ${statusColors[status]} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`${iconColors[status]} opacity-70 group-hover:opacity-100 transition-opacity`}>
              {icon}
            </div>
          )}
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {title}
          </h3>
        </div>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${
            trend > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mb-2">
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
      </div>
      {subtitle && (
        <p className="text-slate-500 text-sm">{subtitle}</p>
      )}
    </div>
  );
};

export default MetricCard;



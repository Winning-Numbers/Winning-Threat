const MetricCard = ({ title, value, subtitle, trend, status = "normal" }) => {
  const statusColors = {
    normal: "border-slate-700",
    warning: "border-yellow-600",
    danger: "border-red-600",
    success: "border-green-600",
  };

  const statusBg = {
    normal: "bg-slate-900",
    warning: "bg-yellow-950",
    danger: "bg-red-950",
    success: "bg-green-950",
  };

  return (
    <div className={`${statusBg[status]} border-2 ${statusColors[status]} rounded-lg p-6 shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        {trend && (
          <span className={`text-xs font-semibold ${
            trend > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mb-1">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      {subtitle && (
        <p className="text-slate-500 text-sm">{subtitle}</p>
      )}
    </div>
  );
};

export default MetricCard;



import { useMemo } from "react";

const RiskGauge = ({ value, max = 100, title = "Risk Score", size = 200 }) => {
  const strokeWidth = 15;
  const radius = 70;

  // value is already a percentage (e.g., 5.5 means 5.5%)
  const percentage = Math.min(
    Math.max(Number.isFinite(value) ? value : 0, 0),
    100
  );
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Create a safe gradient id (titles with spaces break url(#...))
  const gradientId = useMemo(() => {
    const base = String(title || "risk-gauge")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `gradient-${base}`;
  }, [title]);

  const getColor = () => {
    if (percentage > 0)
      return {
        primary: "#dc2626",
        secondary: "#991b1b",
        text: "text-red-600",
        glow: "rgba(220, 38, 38, 0.15)",
      };
    return {
      primary: "#059669",
      secondary: "#047857",
      text: "text-green-600",
      glow: "rgba(5, 150, 105, 0.15)",
    };
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-4">
        {title}
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: color.glow }}
        ></div>

        {/* SVG Gauge */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.primary} />
              <stop offset="100%" stopColor={color.secondary} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${color.text} mb-1`}>
            {percentage.toFixed(1)}%
          </div>
          <div
            className={`text-[10px] ${color.text} font-bold uppercase tracking-wider mt-1`}
          >
            {percentage > 0 ? "FRAUD DETECTED" : "NO FRAUD"}
          </div>
        </div>

        {/* Tick marks */}
        {[...Array(8)].map((_, i) => {
          const angleDeg = i * 45 - 90; // align with -rotate-90
          const angleRad = (angleDeg * Math.PI) / 180;
          const baseRadius = radius + strokeWidth / 2;
          const tickLength = 10; // px
          const gap = 6; // px gap outside the stroke
          const tickRadius = baseRadius + gap + tickLength / 2; // center of tick outside the stroke
          const cx = size / 2 + tickRadius * Math.cos(angleRad);
          const cy = size / 2 + tickRadius * Math.sin(angleRad);
          return (
            <div
              key={i}
              className="absolute bg-gray-300"
              style={{
                width: 2,
                height: tickLength,
                left: cx,
                top: cy,
                transform: `translate(-50%, -50%) rotate(${angleDeg + 90}deg)`,
                transformOrigin: "center",
                borderRadius: 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RiskGauge;

import { useMemo } from 'react';

const ThreatIndicator = ({ threatCount, total }) => {
  const threatLevel = useMemo(() => {
    const percentage = total > 0 ? (threatCount / total) * 100 : 0;
    
    // Simple: Fraud detected or no fraud
    if (threatCount > 0) return { 
      level: 'FRAUD DETECTED', 
      color: 'red', 
      bars: 5,
      description: `${percentage.toFixed(1)}% fraud rate`,
      percentage
    };
    return { 
      level: 'NO FRAUD', 
      color: 'green', 
      bars: 1,
      description: 'All transactions legitimate',
      percentage: 0
    };
  }, [threatCount, total]);

  const colorClasses = {
    red: {
      bg: 'bg-red-500',
      border: 'border-red-500',
      text: 'text-red-400',
      glow: 'shadow-red-500/50'
    },
    orange: {
      bg: 'bg-orange-500',
      border: 'border-orange-500',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/50'
    },
    yellow: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/50'
    },
    blue: {
      bg: 'bg-blue-500',
      border: 'border-blue-500',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/50'
    },
    green: {
      bg: 'bg-green-500',
      border: 'border-green-500',
      text: 'text-green-400',
      glow: 'shadow-green-500/50'
    }
  };

  const colors = colorClasses[threatLevel.color];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
      <div className="relative">
        <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-4">FRAUD STATUS</div>
        
        {/* Main indicator */}
        <div className="flex items-center gap-4 mb-4">
          {/* Bars */}
          <div className="flex items-end gap-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-3 transition-all duration-500 ${
                  bar <= threatLevel.bars 
                    ? `${colors.bg} ${colors.glow} shadow-lg ${threatLevel.color === 'red' ? 'animate-pulse' : ''}` 
                    : 'bg-gray-800'
                }`}
                style={{ height: `${bar * 10}px` }}
              />
            ))}
          </div>

          {/* Level text */}
          <div>
            <div className={`text-2xl font-bold ${colors.text} tracking-tight`}>
              {threatLevel.level}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {threatLevel.description}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">THREATS</div>
            <div className={`text-lg font-bold ${colors.text}`}>{threatCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">TOTAL</div>
            <div className="text-lg font-bold text-gray-900">{total}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIndicator;


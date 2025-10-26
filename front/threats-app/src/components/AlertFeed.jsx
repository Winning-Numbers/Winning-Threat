import { useContext, useMemo } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';

const AlertFeed = () => {
  const { transactions } = useContext(TransactionsContext);

  const recentAlerts = useMemo(() => {
    const fraudTransactions = transactions
      .filter(t => t.ml_prediction === true || t.ml_prediction === 1 || t.ml_prediction === "1")
      .slice(-10)
      .reverse();
    
    return fraudTransactions;
  }, [transactions]);

  // All fraud is treated the same - no severity levels
  const getFraudStyle = () => {
    return { label: 'FRAUD', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
  };

  return (
    <div className="w-80 bg-black border-l border-cyan-500/30 h-[calc(100vh-73px)] overflow-hidden flex flex-col relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-cyan-500/30 p-4 bg-gradient-to-b from-cyan-950/30 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-cyan-400 tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            ALERT FEED
          </h2>
          <div className="bg-red-500/20 border border-red-500/50 rounded px-2 py-0.5">
            <span className="text-xs font-bold text-red-400">{recentAlerts.length}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 font-mono">Real-time fraud detection stream</p>
      </div>

      {/* Alerts List */}
      <div className="relative flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600 font-semibold">No Active Alerts</p>
            <p className="text-[10px] text-gray-700 mt-1">System monitoring...</p>
          </div>
        ) : (
          recentAlerts.map((alert, idx) => {
            const style = getFraudStyle();
            return (
              <div 
                key={alert.transaction_id}
                className={`border ${style.border} ${style.bg} rounded-lg p-3 backdrop-blur-sm animate-fadeIn relative overflow-hidden group hover:scale-[1.02] transition-transform`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-transparent to-red-500/20"></div>
                
                {/* Fraud badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold ${style.color} tracking-widest`}>
                    {style.label}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono">
                    {alert.trans_time}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-2">
                  <div className="text-lg font-bold text-white">${alert.amt}</div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{alert.first} {alert.last}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="truncate">{alert.merchant?.replace(/^fraud_/, '')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{alert.city}, {alert.state}</span>
                  </div>
                </div>

                {/* ID */}
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <span className="text-[9px] text-gray-700 font-mono">ID: {alert.transaction_id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="relative border-t border-cyan-500/30 p-3 bg-gradient-to-t from-cyan-950/30 to-transparent">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-black/50 border border-red-500/30 rounded p-2">
            <div className="text-xs text-red-400 font-bold">{recentAlerts.filter(a => getSeverity(a.amt).level === 'CRITICAL').length}</div>
            <div className="text-[9px] text-gray-600 font-mono">CRITICAL</div>
          </div>
          <div className="bg-black/50 border border-orange-500/30 rounded p-2">
            <div className="text-xs text-orange-400 font-bold">{recentAlerts.filter(a => getSeverity(a.amt).level === 'HIGH').length}</div>
            <div className="text-[9px] text-gray-600 font-mono">HIGH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertFeed;



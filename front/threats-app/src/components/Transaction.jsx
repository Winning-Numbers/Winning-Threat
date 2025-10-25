const Transaction = ({ transaction }) => {
  const isFraud = transaction.merchant?.toLowerCase().includes('fraud');

  return (
    <div className="bg-[#2b2d31] hover:bg-[#35373c] transition-all duration-200 rounded-lg p-4 mb-3 shadow-lg border border-[#1e1f22]">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - User info and details */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {transaction.first?.[0]}{transaction.last?.[0]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[#f2f3f5] font-semibold text-base">
                {transaction.first} {transaction.last}
              </p>
              {isFraud && (
                <span className="bg-[#da373c] text-white px-2 py-0.5 rounded text-xs font-medium">
                  ⚠️ FRAUD
                </span>
              )}
            </div>
            
            <p className="text-[#b5bac1] text-sm mb-2 truncate">
              {transaction.merchant?.replace('fraud_', '')}
            </p>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-[#1e1f22] text-[#949ba4] px-2 py-1 rounded">
                📍 {transaction.city}, {transaction.state}
              </span>
              <span className="bg-[#1e1f22] text-[#949ba4] px-2 py-1 rounded">
                🕐 {transaction.trans_time}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right side - Amount */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-[#f2f3f5] font-bold text-2xl">
            ${transaction.amt}
          </p>
          <p className="text-[#949ba4] text-xs">
            {transaction.trans_date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transaction;

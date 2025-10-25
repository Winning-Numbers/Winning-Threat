const Transaction = ({ transaction }) => {
  // Determine fraud status strictly from ml_prediction
  const isFraud = (() => {
    const p = transaction.ml_prediction;

    // Interpret possible model outputs
    if (p === true || p === 1 || p === "1") return true;
    return false;
  })();

  return (
    <div
      className={`transition-all duration-200 rounded-lg p-4 mb-3 shadow-lg border ${
        isFraud
          ? "bg-[#3a1e1f] hover:bg-[#4a2426] border-[#da373c]"
          : "bg-[#2b2d31] hover:bg-[#35373c] border-[#1e1f22]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Avatar + name + merchant + chips */}
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {transaction.first?.[0] || "?"}
            {transaction.last?.[0] || ""}
          </div>

          <div className="flex-1 min-w-0">
            {/* Row with name + fraud badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-[#f2f3f5] font-semibold text-base">
                {transaction.first} {transaction.last}
              </p>

              {isFraud && (
                <span className="bg-[#da373c] text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  ⚠️ FRAUD
                </span>
              )}
            </div>

            {/* Merchant */}
            <p className="text-[#b5bac1] text-sm mb-2 truncate">
              {transaction.merchant?.replace(/^fraud_/, '') || transaction.merchant}
            </p>

            {/* Location + time */}
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

        {/* Right side - Amount + date */}
        <div className="flex flex-col items-end gap-1 text-right">
          <p className="text-[#f2f3f5] font-bold text-2xl leading-none">
            ${transaction.amt}
          </p>
          <p className="text-[#949ba4] text-xs leading-none">
            {transaction.trans_date}
          </p>
          <p className="text-[#555a60] text-[10px] leading-none">
            #{transaction.transaction_id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transaction;

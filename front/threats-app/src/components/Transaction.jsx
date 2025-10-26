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
      className={`transition-all duration-200 rounded-lg p-4 border relative overflow-hidden ${
        isFraud
          ? "bg-red-50/50 border-red-200 hover:border-red-300 shadow-sm"
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
      }`}
    >
      <div className="relative flex items-start justify-between gap-4">
        {/* Left side - Avatar + name + merchant + chips */}
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
            isFraud 
              ? "bg-red-600" 
              : "bg-blue-600"
          }`}>
            {transaction.first?.[0] || "?"}
            {transaction.last?.[0] || ""}
          </div>

          <div className="flex-1 min-w-0">
            {/* Row with name + fraud badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-gray-900 font-semibold text-sm">
                {transaction.first} {transaction.last}
              </p>

              {isFraud && (
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  FRAUD
                </span>
              )}
            </div>

            {/* Merchant */}
            <p className="text-gray-600 text-xs mb-2 truncate">
              {transaction.merchant?.replace(/^fraud_/, '') || transaction.merchant}
            </p>

            {/* Location + time */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {transaction.city}, {transaction.state}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {transaction.trans_time}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Amount + date */}
        <div className="flex flex-col items-end gap-1 text-right">
          <p className={`font-bold text-xl ${
            isFraud ? "text-red-600" : "text-blue-600"
          }`}>
            ${transaction.amt}
          </p>
          <p className="text-gray-500 text-[10px]">
            {transaction.trans_date}
          </p>
          <p className="text-gray-400 text-[9px]">
            #{transaction.transaction_id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transaction;

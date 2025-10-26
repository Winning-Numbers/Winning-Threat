import { useContext, useMemo } from "react";
import { TransactionsContext } from "../../contexts/TransactionsContext";

const ThreatsTab = () => {
  const { last12Hours } = useContext(TransactionsContext);

  const fraudTransactions = useMemo(() => {
    return last12Hours
      .filter(
        (t) =>
          t.ml_prediction === true ||
          t.ml_prediction === 1 ||
          t.ml_prediction === "1"
      )
      .reverse();
  }, [last12Hours]);

  const fraudStats = useMemo(() => {
    const totalFraud = fraudTransactions.length;
    const totalAmount = fraudTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amt || 0),
      0
    );
    const avgAmount = totalFraud > 0 ? totalAmount / totalFraud : 0;
    const maxAmount =
      totalFraud > 0
        ? Math.max(...fraudTransactions.map((t) => parseFloat(t.amt || 0)))
        : 0;

    return { totalFraud, totalAmount, avgAmount, maxAmount };
  }, [fraudTransactions]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Threat Detection
        </h2>
        <p className="text-gray-600">All detected fraudulent transactions</p>
      </div>

      {/* Fraud Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-red-200">
          <div className="text-red-600 text-sm font-semibold uppercase tracking-wide mb-2">
            Total Fraud
          </div>
          <div className="text-4xl font-bold text-red-600">
            {fraudStats.totalFraud}
          </div>
          <div className="text-gray-500 text-xs mt-1">Cases Detected</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-orange-200">
          <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide mb-2">
            Total Value
          </div>
          <div className="text-4xl font-bold text-orange-600">
            ${fraudStats.totalAmount.toFixed(0)}
          </div>
          <div className="text-gray-500 text-xs mt-1">Fraud Amount</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
          <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide mb-2">
            Average
          </div>
          <div className="text-4xl font-bold text-purple-600">
            ${fraudStats.avgAmount.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs mt-1">Per Transaction</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-pink-200">
          <div className="text-pink-600 text-sm font-semibold uppercase tracking-wide mb-2">
            Highest
          </div>
          <div className="text-4xl font-bold text-pink-600">
            ${fraudStats.maxAmount.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs mt-1">Single Transaction</div>
        </div>
      </div>

      {/* Fraud List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detected Threats
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {fraudTransactions.length} fraudulent transactions identified
          </p>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {fraudTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold text-gray-900">
                No threats detected
              </p>
              <p className="text-sm mt-2 text-gray-500">
                All transactions are clean
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {fraudTransactions.map((transaction) => {
                return (
                  <div
                    key={transaction.transaction_id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-100 text-red-700">
                            FRAUD
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {transaction.first} {transaction.last}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <div className="text-gray-500 text-xs mb-1 font-medium">
                              Merchant
                            </div>
                            <div className="text-gray-900 text-sm">
                              {transaction.merchant?.replace(/^fraud_/, "")}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1 font-medium">
                              Location
                            </div>
                            <div className="text-gray-900 text-sm">
                              {transaction.city}, {transaction.state}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1 font-medium">
                              Time
                            </div>
                            <div className="text-gray-900 text-sm">
                              {transaction.trans_time}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1 font-medium">
                              Date
                            </div>
                            <div className="text-gray-900 text-sm">
                              {transaction.trans_date}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold mb-1 text-red-600">
                          ${transaction.amt}
                        </div>
                        <div className="text-gray-500 text-xs">
                          #{transaction.transaction_id}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatsTab;

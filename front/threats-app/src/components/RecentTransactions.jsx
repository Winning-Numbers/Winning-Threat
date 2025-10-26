import { useContext } from "react";
import { TransactionsContext } from "../contexts/TransactionsContext";
import Transaction from "./Transaction";

const RecentTransactions = () => {
  const { transactions } = useContext(TransactionsContext);

  // Show last 20 transactions in reverse chronological order
  const recentTransactions = [...transactions].reverse().slice(0, 20);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
      <div className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Recent Transactions
            </h3>
            <p className="text-gray-600 text-sm">Latest transaction activity</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 mb-6">
              <svg
                className="w-20 h-20 mx-auto opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-semibold mb-2">
              No transactions yet
            </p>
            <p className="text-gray-500 text-sm">
              Waiting for POS data stream...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
            {recentTransactions.map((t) => (
              <Transaction key={t.transaction_id} transaction={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;

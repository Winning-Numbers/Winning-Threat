import Transaction from "./Transaction";
import { TransactionsContext } from "../contexts/TransactionsContext";
import { useContext } from "react";

const TransactionsList = () => {
  const { transactions } = useContext(TransactionsContext);

  return (
    <div className="w-full max-w-5xl px-4">
      <div className="bg-[#313338] rounded-lg shadow-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6 border-b border-[#1e1f22] pb-4">
          <h1 className="text-2xl font-bold text-[#f2f3f5]">💳 Transactions</h1>
          <span className="bg-[#5865f2] text-white px-3 py-1 rounded-full text-sm font-semibold">
            {transactions.length} Total
          </span>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-[#949ba4] text-lg">No transactions yet</p>
            <p className="text-[#6d7178] text-sm mt-2">Transactions will appear here automatically</p>
          </div>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map((t) => (
              <Transaction key={t.transaction_id} transaction={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;

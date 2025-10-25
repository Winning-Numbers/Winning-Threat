import { useContext } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';
import Transaction from './Transaction';

const RecentTransactions = () => {
  const { transactions } = useContext(TransactionsContext);

  // Show last 20 transactions in reverse chronological order
  const recentTransactions = [...transactions].reverse().slice(0, 20);

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Recent Transactions
        </h3>
        <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded text-sm font-semibold">
          Showing {recentTransactions.length} of {transactions.length}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-600 text-6xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg">No transactions yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Waiting for POS data stream...
          </p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          {recentTransactions.map((t) => (
            <Transaction key={t.transaction_id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;



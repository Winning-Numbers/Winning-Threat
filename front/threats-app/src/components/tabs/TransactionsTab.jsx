import RecentTransactions from '../RecentTransactions';

const TransactionsTab = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transaction Stream</h2>
        <p className="text-gray-600">Real-time transaction monitoring and history</p>
      </div>

      <RecentTransactions />
    </div>
  );
};

export default TransactionsTab;


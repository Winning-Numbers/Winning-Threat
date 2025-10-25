import { useContext } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';
import MetricCard from './MetricCard';
import FraudChart from './FraudChart';
import FraudPatterns from './FraudPatterns';
import AgeSegmentAnalysis from './AgeSegmentAnalysis';
import RecentTransactions from './RecentTransactions';

const Dashboard = () => {
  const { stats, transactions } = useContext(TransactionsContext);

  // Calculate alerts in last 2 hours
  const alertsLast2Hours = () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    return transactions.filter((t) => {
      const transDate = new Date(`${t.trans_date} ${t.trans_time}`);
      const isFraud = t.is_fraud === 1 || t.merchant?.toLowerCase().includes('fraud');
      return transDate >= twoHoursAgo && isFraud;
    }).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            POS Fraud Detection SIEM
          </h1>
          <p className="text-slate-400">
            Real-time Security Information and Event Management System
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
            subtitle="All time"
            status="normal"
          />
          <MetricCard
            title="Fraud Alerts"
            value={stats.fraudCount.toLocaleString()}
            subtitle={`${stats.fraudRate.toFixed(1)}% fraud rate`}
            status={stats.fraudRate > 10 ? "danger" : stats.fraudRate > 5 ? "warning" : "success"}
          />
          <MetricCard
            title="Alerts (2h)"
            value={alertsLast2Hours()}
            subtitle="Last 2 hours"
            status={alertsLast2Hours() > 10 ? "danger" : "normal"}
          />
          <MetricCard
            title="Avg Transaction"
            value={`$${stats.avgAmount.toFixed(2)}`}
            subtitle={`Total: $${stats.totalAmount.toFixed(2)}`}
            status="normal"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Fraud Timeline Chart - Takes 2 columns */}
          <div className="lg:col-span-2 bg-slate-900 border-2 border-slate-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Transaction Timeline (Last Hour)
            </h3>
            <FraudChart transactions={transactions} />
          </div>

          {/* Fraud Patterns - Takes 1 column */}
          <div className="lg:col-span-1">
            <FraudPatterns />
          </div>
        </div>

        {/* Age Analysis Row */}
        <div className="mb-6">
          <AgeSegmentAnalysis />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </div>
  );
};

export default Dashboard;



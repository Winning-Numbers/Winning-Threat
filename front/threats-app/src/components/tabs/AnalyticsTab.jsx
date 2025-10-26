import { useContext } from "react";
import { TransactionsContext } from "../../contexts/TransactionsContext";
import AgeSegmentAnalysis from "../AgeSegmentAnalysis";
import FraudAlertsTimeline from "../FraudAlertsTimeline";
import { BarChart3, TrendingUp, Users } from "lucide-react";

const AnalyticsTab = () => {
  const { last12HoursStats, lastHourStats } = useContext(TransactionsContext);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-lg p-8 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        </div>
        <p className="text-blue-100">
          Comprehensive fraud detection insights and trends
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-blue-100 text-xs">Total Transactions</p>
            <p className="text-xl font-bold">
              {last12HoursStats.totalTransactions.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-blue-100 text-xs">Last Hour</p>
            <p className="text-xl font-bold">
              {lastHourStats.totalTransactions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Fraud Alerts Timeline - Answers: "How many fraud alerts in last 2 hours?" */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Fraud Alerts Timeline
          </h3>
          <p className="text-gray-600">
            Answers: "How many fraud alerts were triggered in the last 2 hours?"
          </p>
        </div>
        <FraudAlertsTimeline />
      </div>

      {/* Age Demographics - Answers: "What age segment is most exposed to fraud?" */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Age Segment Exposure Analysis
          </h3>
          <p className="text-gray-600">
            Answers: "What age segment is most exposed to fraud?"
          </p>
        </div>
        <AgeSegmentAnalysis />
      </div>
    </div>
  );
};

export default AnalyticsTab;

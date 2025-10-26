import FraudPatterns from "../FraudPatterns";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign,
  Users,
  ShoppingCart,
  MapPin,
  Store,
} from "lucide-react";
import { useContext } from "react";
import { TransactionsContext } from "../../contexts/TransactionsContext";

const PatternsTab = () => {
  const { lastHourStats } = useContext(TransactionsContext);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-8 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Fraud Patterns Analysis</h2>
        </div>
        <p className="text-red-100">
          Identify and analyze common patterns in fraudulent activity
        </p>
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
          <p className="text-red-100 text-xs mb-1">Key Question Answered</p>
          <p className="text-white font-semibold">
            "What are the top 5 most common fraud patterns?"
          </p>
        </div>
      </div>

      {/* Top Fraud Patterns Detection */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600" />
            Top Fraud Patterns Detection
          </h3>
          <p className="text-gray-600">
            Real-time analysis of the most common fraud patterns detected in the
            last hour
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Pattern 1: Most Targeted Merchant */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow-md border-2 border-red-300 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-1 rounded">
                PATTERN #1
              </span>
            </div>
            <p className="text-gray-700 text-xs font-semibold uppercase mb-2">
              Most Targeted Merchant
            </p>
            <p
              className="text-2xl font-bold text-red-700 mb-1 truncate"
              title={lastHourStats.topFraudMerchant}
            >
              {lastHourStats.topFraudMerchant}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-300">
              <span className="text-xs text-gray-600">Fraud Cases:</span>
              <span className="text-lg font-bold text-red-600">
                {lastHourStats.topFraudMerchantCount}
              </span>
            </div>
          </div>

          {/* Pattern 2: Riskiest Category */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 shadow-md border-2 border-orange-300 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-200 px-2 py-1 rounded">
                PATTERN #2
              </span>
            </div>
            <p className="text-gray-700 text-xs font-semibold uppercase mb-2">
              Riskiest Category
            </p>
            <p
              className="text-2xl font-bold text-orange-700 mb-1 truncate"
              title={lastHourStats.topFraudCategory}
            >
              {lastHourStats.topFraudCategory}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-300">
              <span className="text-xs text-gray-600">Fraud Cases:</span>
              <span className="text-lg font-bold text-orange-600">
                {lastHourStats.topFraudCategoryCount}
              </span>
            </div>
          </div>

          {/* Pattern 3: High-Risk Age Group */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow-md border-2 border-purple-300 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-200 px-2 py-1 rounded">
                PATTERN #3
              </span>
            </div>
            <p className="text-gray-700 text-xs font-semibold uppercase mb-2">
              High-Risk Age Group
            </p>
            <p className="text-2xl font-bold text-purple-700 mb-1">
              {lastHourStats.highRiskAge} years
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-300">
              <span className="text-xs text-gray-600">Fraud Cases:</span>
              <span className="text-lg font-bold text-purple-600">
                {lastHourStats.highRiskAgeCount}
              </span>
            </div>
          </div>

          {/* Pattern 4: Most Affected State */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-md border-2 border-blue-300 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                PATTERN #4
              </span>
            </div>
            <p className="text-gray-700 text-xs font-semibold uppercase mb-2">
              Most Affected State
            </p>
            <p className="text-2xl font-bold text-blue-700 mb-1">
              {lastHourStats.topFraudState}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-300">
              <span className="text-xs text-gray-600">Fraud Cases:</span>
              <span className="text-lg font-bold text-blue-600">
                {lastHourStats.topFraudStateCount}
              </span>
            </div>
          </div>

          {/* Pattern 5: Average Fraud Amount */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-md border-2 border-green-300 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                PATTERN #5
              </span>
            </div>
            <p className="text-gray-700 text-xs font-semibold uppercase mb-2">
              Avg Fraud Transaction
            </p>
            <p className="text-2xl font-bold text-green-700 mb-1">
              ${lastHourStats.avgFraudAmount.toFixed(2)}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-300">
              <span className="text-xs text-gray-600">Total Frauds:</span>
              <span className="text-lg font-bold text-green-600">
                {lastHourStats.fraudCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Additional Pattern Analysis */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Time-based Patterns
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">
                Peak Fraud Hours
              </span>
              <span className="text-gray-900 font-semibold">14:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">
                Lowest Risk Period
              </span>
              <span className="text-gray-900 font-semibold">02:00 - 06:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">
                Weekend vs Weekday
              </span>
              <span className="text-orange-600 font-semibold">
                +23% Weekend
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Geographic Patterns
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">
                High Risk States
              </span>
              <span className="text-red-600 font-semibold">5 States</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">Urban vs Rural</span>
              <span className="text-gray-900 font-semibold">72% Urban</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">
                Cross-State Activity
              </span>
              <span className="text-orange-600 font-semibold">18% Cases</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternsTab;

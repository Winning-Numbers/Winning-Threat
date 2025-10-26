import { useContext, useMemo } from "react";
import { TransactionsContext } from "../contexts/TransactionsContext";
import { Users, TrendingUp, Clock } from "lucide-react";

const BusinessInsights = ({ setActiveTab }) => {
  const { transactions, last2Hours, last12Hours, lastHourStats } =
    useContext(TransactionsContext);

  const insights = useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    // Last hour fraud patterns (kept for potential future use)
    const lastHourTransactions = transactions.filter((t) => {
      const transDate = new Date(`${t.trans_date} ${t.trans_time}`);
      return transDate >= oneHourAgo;
    });

    const lastHourFraud = lastHourTransactions.filter(
      (t) =>
        t.ml_prediction === true ||
        t.ml_prediction === 1 ||
        t.ml_prediction === "1"
    );

    // Top 5 fraud patterns (not used in render anymore; using lastHourStats instead)
    const merchantCounts = {};
    const categoryCounts = {};
    lastHourFraud.forEach((t) => {
      const merchant = t.merchant?.replace("fraud_", "") || "Unknown";
      merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;

      const category = t.category || "Unknown";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const topMerchants = Object.entries(merchantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Last 2 hours alerts - now using the last2Hours from context
    const twoHourAlerts = last2Hours.filter(
      (t) =>
        t.ml_prediction === true ||
        t.ml_prediction === 1 ||
        t.ml_prediction === "1"
    ).length;

    // Age segment analysis - using last 12 hours data
    const ageGroups = {
      "18-25": { total: 0, fraud: 0 },
      "26-35": { total: 0, fraud: 0 },
      "36-45": { total: 0, fraud: 0 },
      "46-55": { total: 0, fraud: 0 },
      "56-65": { total: 0, fraud: 0 },
      "65+": { total: 0, fraud: 0 },
    };

    last12Hours.forEach((t) => {
      const dob = t.dob ? new Date(t.dob) : null;
      if (!dob) return;

      const age = Math.floor(
        (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      const isFraud =
        t.ml_prediction === true ||
        t.ml_prediction === 1 ||
        t.ml_prediction === "1";

      let ageGroup;
      if (age >= 18 && age <= 25) ageGroup = "18-25";
      else if (age >= 26 && age <= 35) ageGroup = "26-35";
      else if (age >= 36 && age <= 45) ageGroup = "36-45";
      else if (age >= 46 && age <= 55) ageGroup = "46-55";
      else if (age >= 56 && age <= 65) ageGroup = "56-65";
      else if (age > 65) ageGroup = "65+";

      if (ageGroup) {
        ageGroups[ageGroup].total += 1;
        if (isFraud) ageGroups[ageGroup].fraud += 1;
      }
    });

    const ageData = Object.entries(ageGroups)
      .map(([age, data]) => ({
        age,
        fraudRate: data.total > 0 ? (data.fraud / data.total) * 100 : 0,
        total: data.total,
        fraud: data.fraud,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.fraudRate - a.fraudRate);

    const mostExposedAge = ageData.length > 0 ? ageData[0] : null;

    return {
      topMerchants,
      topCategories,
      twoHourAlerts,
      mostExposedAge,
      lastHourFraudCount: lastHourFraud.length,
    };
  }, [transactions, last2Hours, last12Hours]);

  return (
    <div className="space-y-6">
      {/* Key Business Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Alerts in Last 2 Hours */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2.5 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Fraud Alerts
              </h3>
              <p className="text-xs text-gray-600">Last 2 Hours</p>
            </div>
          </div>

          <div className="text-center py-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-linear-to-br from-orange-400 to-red-500 rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">
                    {insights.twoHourAlerts}
                  </p>
                  <p className="text-[10px] text-orange-100 font-semibold uppercase">
                    Alerts
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-xs text-gray-600">Avg per Hour</span>
              <span className="text-lg font-bold text-orange-600">
                {(insights.twoHourAlerts / 2).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600">Time Window</span>
              <span className="text-xs font-semibold text-gray-900">
                2 Hours
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Most Exposed Age Segment */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Most Exposed Age
              </h3>
              <p className="text-xs text-gray-600">Last 12 Hours</p>
            </div>
          </div>

          {insights.mostExposedAge ? (
            <>
              <div className="text-center py-4">
                <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-lg mb-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {insights.mostExposedAge.age}
                    </p>
                    <p className="text-[10px] text-blue-100 font-semibold uppercase">
                      Years
                    </p>
                  </div>
                </div>
                <div className="bg-red-100 inline-block px-3 py-1.5 rounded-lg border-2 border-red-300">
                  <p className="text-[10px] text-red-600 font-bold uppercase">
                    Fraud Rate
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {insights.mostExposedAge.fraudRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-xs text-gray-600">Total</span>
                  <span className="text-blue-600 font-bold text-sm">
                    {insights.mostExposedAge.total}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-xs text-gray-600">Fraud Cases</span>
                  <span className="text-red-600 font-bold text-sm">
                    {insights.mostExposedAge.fraud}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No age data available</p>
            </div>
          )}
        </div>

        {/* Card 3: Quick Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Quick Stats</h3>
              <p className="text-xs text-gray-600">Real-time Metrics</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="bg-linear-to-r from-red-50 to-red-100 rounded-lg p-3 border-2 border-red-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-700 font-medium">
                  Total Frauds
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {lastHourStats.fraudCount}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Last Hour</p>
            </div>

            <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-700 font-medium">
                  Top Merchant
                </span>
                <span
                  className="text-sm font-bold text-blue-600 truncate ml-2"
                  title={lastHourStats.topFraudMerchant}
                >
                  {lastHourStats.topFraudMerchant || "N/A"}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {lastHourStats.topFraudMerchantCount || 0} cases
              </p>
            </div>

            <div className="bg-linear-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-700 font-medium">
                  Top Category
                </span>
                <span
                  className="text-sm font-bold text-purple-600 truncate ml-2"
                  title={lastHourStats.topFraudCategory}
                >
                  {lastHourStats.topFraudCategory || "N/A"}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {lastHourStats.topFraudCategoryCount || 0} cases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab("analytics")}
            className="bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
          >
            <p className="text-sm font-semibold text-blue-900 mb-1">
              View Analytics
            </p>
            <p className="text-xs text-gray-600">
              Explore detailed analytics and charts
            </p>
          </button>
          <button
            onClick={() => setActiveTab("threats")}
            className="bg-white hover:bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
          >
            <p className="text-sm font-semibold text-orange-900 mb-1">
              Threat Monitoring
            </p>
            <p className="text-xs text-gray-600">
              Review real-time fraud alerts
            </p>
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className="bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
          >
            <p className="text-sm font-semibold text-purple-900 mb-1">
              Transaction History
            </p>
            <p className="text-xs text-gray-600">
              View all transaction records
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessInsights;

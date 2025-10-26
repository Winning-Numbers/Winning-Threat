import { useContext, useMemo } from "react";
import { TransactionsContext } from "../contexts/TransactionsContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const FraudAlertsTimeline = () => {
  const { last2Hours } = useContext(TransactionsContext);

  const alertsData = useMemo(() => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Filter fraud alerts from last 2 hours
    const fraudAlerts = (last2Hours || []).filter(
      (t) =>
        t?.ml_prediction === true ||
        t?.ml_prediction === 1 ||
        t?.ml_prediction === "1"
    );

    // Group by 15-minute intervals
    const intervals = {};

    fraudAlerts.forEach((transaction) => {
      try {
        let time = String(transaction.trans_time || "00:00");
        if (/^\d{2}:\d{2}$/.test(time)) time += ":00";
        const iso = `${transaction.trans_date}T${time}`;
        const transDate = new Date(iso);

        if (isNaN(transDate.getTime())) return;

        const hours = transDate.getHours();
        const minutes = transDate.getMinutes();
        const minuteKey = Math.floor(minutes / 15) * 15;
        const key = `${String(hours).padStart(2, "0")}:${String(
          minuteKey
        ).padStart(2, "0")}`;

        if (!intervals[key]) {
          intervals[key] = {
            time: key,
            count: 0,
            totalAmount: 0,
            merchants: new Set(),
            timestamp: new Date(
              transDate.getFullYear(),
              transDate.getMonth(),
              transDate.getDate(),
              hours,
              minuteKey,
              0
            ).getTime(),
          };
        }

        intervals[key].count += 1;
        intervals[key].totalAmount += parseFloat(transaction.amt || 0);
        intervals[key].merchants.add(transaction.merchant);
      } catch (err) {
        console.warn("Error parsing transaction date:", err);
      }
    });

    // Convert to array and sort by actual timestamp
    const chartData = Object.values(intervals)
      .map((interval) => ({
        time: interval.time,
        count: interval.count,
        totalAmount: interval.totalAmount,
        merchantCount: interval.merchants.size,
        timestamp: interval.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate metrics
    const totalAlerts = fraudAlerts.length;
    const totalValue = fraudAlerts.reduce(
      (sum, t) => sum + parseFloat(t?.amt || 0),
      0
    );
    const avgAlertValue = totalAlerts > 0 ? totalValue / totalAlerts : 0;
    const uniqueMerchants = new Set(
      fraudAlerts.map((t) => t?.merchant).filter(Boolean)
    ).size;

    // Find peak interval
    const peakInterval =
      chartData.length > 0
        ? chartData.reduce(
            (max, current) => (current.count > max.count ? current : max),
            chartData[0]
          )
        : null;

    return {
      chartData,
      totalAlerts,
      totalValue,
      avgAlertValue,
      uniqueMerchants,
      peakInterval,
      recentAlerts: fraudAlerts.slice(-5).reverse(),
    };
  }, [last2Hours]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-linear-to-r from-red-50 via-orange-50 to-yellow-50 rounded-lg p-6 border-2 border-red-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-7 h-7 text-red-600" />
              Fraud Alerts Timeline
            </h3>
            <p className="text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last 2 hours (15-minute intervals)
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-2 border-red-300">
            <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">
              Total Alerts
            </p>
            <p className="text-4xl font-bold text-red-600">
              {alertsData.totalAlerts}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  ${alertsData.totalValue.toFixed(2)}
                </p>
              </div>
              <svg
                className="w-10 h-10 text-orange-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                  Avg Alert Value
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ${alertsData.avgAlertValue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                  Unique Merchants
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {alertsData.uniqueMerchants}
                </p>
              </div>
              <svg
                className="w-10 h-10 text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {alertsData.peakInterval && (
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border-2 border-red-300">
            <p className="text-xs text-red-600 uppercase font-bold mb-2">
              ⚠️ Peak Alert Period
            </p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">
                {alertsData.peakInterval.time} -{" "}
                <span className="text-red-600">
                  {alertsData.peakInterval.count} alerts
                </span>
              </p>
              <p className="text-sm text-gray-600">
                ${alertsData.peakInterval.totalAmount.toFixed(2)} total
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Alerts Distribution
        </h4>
        {alertsData.chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No fraud alerts in the last 2 hours</p>
              <p className="text-sm text-gray-300 mt-1">System is monitoring</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertsData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                label={{
                  value: "Alert Count",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "12px" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #ef4444",
                  borderRadius: "8px",
                  padding: "10px",
                }}
                formatter={(value, name) => {
                  if (name === "count") return [value, "Alerts"];
                  if (name === "totalAmount")
                    return [`$${value.toFixed(2)}`, "Total Value"];
                  return [value, name];
                }}
              />
              <Bar dataKey="count" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Alerts */}
      {alertsData.recentAlerts.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Fraud Alerts
          </h4>
          <div className="space-y-3">
            {alertsData.recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {alert.merchant?.replace("fraud_", "") || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {alert.city}, {alert.state} • {alert.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 text-lg">
                    ${parseFloat(alert.amt).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{alert.trans_time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudAlertsTimeline;

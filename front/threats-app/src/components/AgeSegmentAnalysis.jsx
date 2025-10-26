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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, AlertTriangle, TrendingUp } from "lucide-react";

const AgeSegmentAnalysis = () => {
  const { last12Hours } = useContext(TransactionsContext);

  const ageData = useMemo(() => {
    const ageGroups = {
      "18-25": { total: 0, fraud: 0, totalAmount: 0, fraudAmount: 0 },
      "26-35": { total: 0, fraud: 0, totalAmount: 0, fraudAmount: 0 },
      "36-45": { total: 0, fraud: 0, totalAmount: 0, fraudAmount: 0 },
      "46-55": { total: 0, fraud: 0, totalAmount: 0, fraudAmount: 0 },
      "56-65": { total: 0, fraud: 0, totalAmount: 0, fraudAmount: 0 },
      "65+": { total: 0, fraud: 0, totalAmount: 0, fraudAmount: 0 },
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
      const amount = parseFloat(t.amt || 0);

      let ageGroup;
      if (age >= 18 && age <= 25) ageGroup = "18-25";
      else if (age >= 26 && age <= 35) ageGroup = "26-35";
      else if (age >= 36 && age <= 45) ageGroup = "36-45";
      else if (age >= 46 && age <= 55) ageGroup = "46-55";
      else if (age >= 56 && age <= 65) ageGroup = "56-65";
      else if (age > 65) ageGroup = "65+";

      if (ageGroup) {
        ageGroups[ageGroup].total += 1;
        ageGroups[ageGroup].totalAmount += amount;
        if (isFraud) {
          ageGroups[ageGroup].fraud += 1;
          ageGroups[ageGroup].fraudAmount += amount;
        }
      }
    });

    return Object.entries(ageGroups).map(([age, data]) => ({
      age,
      total: data.total,
      fraud: data.fraud,
      fraudRate:
        data.total > 0
          ? parseFloat(((data.fraud / data.total) * 100).toFixed(1))
          : 0,
      totalAmount: data.totalAmount,
      fraudAmount: data.fraudAmount,
      avgTransactionAmount: data.total > 0 ? data.totalAmount / data.total : 0,
    }));
  }, [last12Hours]);

  const mostExposed = useMemo(() => {
    const validData = ageData.filter((d) => d.total > 0);
    if (validData.length === 0) return { age: "N/A", fraudRate: 0, fraud: 0 };
    return validData.reduce(
      (max, current) => (current.fraudRate > max.fraudRate ? current : max),
      validData[0]
    );
  }, [ageData]);

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];

  const pieData = ageData
    .filter((d) => d.total > 0)
    .map((d, idx) => ({
      name: d.age,
      value: d.total,
      fraudRate: d.fraudRate,
      fill: COLORS[idx % COLORS.length],
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">
            {payload[0].payload.age} years
          </p>
          <p className="text-sm text-blue-600">
            Total: {payload[0].payload.total}
          </p>
          <p className="text-sm text-red-600">
            Fraud: {payload[0].payload.fraud}
          </p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            Fraud Rate: {payload[0].payload.fraudRate}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg p-6 border-2 border-blue-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Age Segment Analysis
            </h3>
            <p className="text-gray-600">Fraud exposure by age demographic</p>
          </div>
          {mostExposed.age !== "N/A" && (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-red-300">
              <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Most Exposed
              </p>
              <p className="text-3xl font-bold text-red-600">
                {mostExposed.age}
              </p>
              <p className="text-sm text-red-600 font-semibold">
                {mostExposed.fraudRate}% fraud rate
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {mostExposed.fraud} fraud cases
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {ageData
            .filter((d) => d.total > 0)
            .slice(0, 3)
            .map((segment, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
              >
                <p className="text-xs text-gray-600 font-semibold">
                  {segment.age} years
                </p>
                <p className="text-lg font-bold" style={{ color: COLORS[idx] }}>
                  {segment.fraudRate}%
                </p>
              </div>
            ))}
        </div>
      </div>

      {last12Hours.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No transaction data available</p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Fraud vs Total Transactions
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="age"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="total"
                    fill="#3b82f6"
                    name="Total Transactions"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="fraud"
                    fill="#ef4444"
                    name="Fraud Detected"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Distribution
              </h4>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} transactions (${props.payload.fraudRate}% fraud rate)`,
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>No data to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-x-auto">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Breakdown
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Age Group
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Fraud
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Fraud Rate
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Avg Transaction
                  </th>
                </tr>
              </thead>
              <tbody>
                {ageData
                  .filter((d) => d.total > 0)
                  .sort((a, b) => b.fraudRate - a.fraudRate)
                  .map((segment, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        segment.age === mostExposed.age ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                        {segment.age} years
                        {segment.age === mostExposed.age && (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold">
                            HIGHEST RISK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {segment.total}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            segment.fraud > 0 ? "text-red-600" : "text-gray-400"
                          }`}
                        >
                          {segment.fraud}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            segment.fraudRate > 0
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        >
                          {segment.fraudRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ${segment.avgTransactionAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AgeSegmentAnalysis;

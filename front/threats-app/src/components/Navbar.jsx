import { useContext } from "react";
import { TransactionsContext } from "../contexts/TransactionsContext";

const Navbar = ({ activeTab, setActiveTab }) => {
  const { last12HoursStats } = useContext(TransactionsContext);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "threats", label: "Threats" },
    { id: "transactions", label: "Transactions" },
    { id: "map", label: "Map" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-5 border-b border-gray-200">
          {/* Brand */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              POS Fraud Detection
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Security Information & Event Management
            </p>
          </div>

          {/* Live Indicator & Stats */}
          <div className="flex items-center gap-6">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <div className="relative">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <span className="text-sm font-bold text-red-700 uppercase tracking-wider">
                Live
              </span>
            </div>

            <div className="h-8 w-px bg-gray-300"></div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Total Events
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {last12HoursStats.totalTransactions.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Threats
                </div>
                <div className="text-lg font-semibold text-red-600">
                  {last12HoursStats.fraudCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-all duration-150 border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

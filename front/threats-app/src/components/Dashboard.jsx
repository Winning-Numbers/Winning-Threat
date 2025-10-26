import { useState } from "react";
import Navbar from "./Navbar";
import OverviewTab from "./tabs/OverviewTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import ThreatsTab from "./tabs/ThreatsTab";
import TransactionsTab from "./tabs/TransactionsTab";
import MapTab from "./tabs/MapTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab setActiveTab={setActiveTab} />;
      case "analytics":
        return <AnalyticsTab />;
      case "threats":
        return <ThreatsTab />;
      case "transactions":
        return <TransactionsTab />;
      case "map":
        return <MapTab />;
      default:
        return <OverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-[1920px] mx-auto p-8">
        <div className="animate-fadeIn">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;

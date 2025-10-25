import { useContext, useMemo } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';

const FraudPatterns = () => {
  const { transactions } = useContext(TransactionsContext);

  const patterns = useMemo(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTransactions = transactions.filter((t) => {
      const transDate = new Date(`${t.trans_date} ${t.trans_time}`);
      return transDate >= oneHourAgo;
    });

    const fraudTransactions = recentTransactions.filter((t) => 
      t.is_fraud === 1 || t.merchant?.toLowerCase().includes('fraud')
    );

    // Analyze patterns
    const merchantCounts = {};
    const cityCounts = {};
    const amountRanges = {
      'Under $50': 0,
      '$50-$100': 0,
      '$100-$500': 0,
      '$500-$1000': 0,
      'Over $1000': 0
    };

    fraudTransactions.forEach((t) => {
      // Merchant pattern
      const merchant = t.merchant?.replace('fraud_', '') || 'Unknown';
      merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;

      // Location pattern
      const location = `${t.city}, ${t.state}`;
      cityCounts[location] = (cityCounts[location] || 0) + 1;

      // Amount pattern
      const amt = parseFloat(t.amt);
      if (amt < 50) amountRanges['Under $50']++;
      else if (amt < 100) amountRanges['$50-$100']++;
      else if (amt < 500) amountRanges['$100-$500']++;
      else if (amt < 1000) amountRanges['$500-$1000']++;
      else amountRanges['Over $1000']++;
    });

    // Get top patterns
    const topMerchants = Object.entries(merchantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topLocations = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topAmountRanges = Object.entries(amountRanges)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      topMerchants,
      topLocations,
      topAmountRanges,
      totalFraud: fraudTransactions.length
    };
  }, [transactions]);

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        Top Fraud Patterns (Last Hour)
      </h3>

      {patterns.totalFraud === 0 ? (
        <p className="text-slate-400 text-center py-4">No fraud detected in the last hour</p>
      ) : (
        <div className="space-y-6">
          {/* Top Merchants */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">
              Top Merchants
            </h4>
            <div className="space-y-2">
              {patterns.topMerchants.map(([merchant, count], idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800 rounded p-3">
                  <span className="text-white text-sm">{merchant}</span>
                  <span className="bg-red-900 text-red-200 px-3 py-1 rounded text-xs font-semibold">
                    {count} alerts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">
              Top Locations
            </h4>
            <div className="space-y-2">
              {patterns.topLocations.map(([location, count], idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800 rounded p-3">
                  <span className="text-white text-sm">{location}</span>
                  <span className="bg-red-900 text-red-200 px-3 py-1 rounded text-xs font-semibold">
                    {count} alerts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Ranges */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">
              Amount Ranges
            </h4>
            <div className="space-y-2">
              {patterns.topAmountRanges.map(([range, count], idx) => (
                count > 0 && (
                  <div key={idx} className="flex justify-between items-center bg-slate-800 rounded p-3">
                    <span className="text-white text-sm">{range}</span>
                    <span className="bg-red-900 text-red-200 px-3 py-1 rounded text-xs font-semibold">
                      {count} alerts
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudPatterns;



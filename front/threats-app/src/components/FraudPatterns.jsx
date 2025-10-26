import { useContext, useMemo } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const FraudPatterns = () => {
  const { transactions } = useContext(TransactionsContext);

  const patterns = useMemo(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTransactions = transactions.filter((t) => {
      const transDate = new Date(`${t.trans_date} ${t.trans_time}`);
      return transDate >= oneHourAgo;
    });

    const fraudTransactions = recentTransactions.filter((t) => 
      t.ml_prediction === true || t.ml_prediction === 1 || t.ml_prediction === "1"
    );

    // Analyze patterns - more comprehensive
    const merchantCounts = {};
    const cityCounts = {};
    const categoryCounts = {};
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

      // Category pattern
      const category = t.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      // Amount pattern
      const amt = parseFloat(t.amt);
      if (amt < 50) amountRanges['Under $50']++;
      else if (amt < 100) amountRanges['$50-$100']++;
      else if (amt < 500) amountRanges['$100-$500']++;
      else if (amt < 1000) amountRanges['$500-$1000']++;
      else amountRanges['Over $1000']++;
    });

    // Get top 5 patterns
    const topMerchants = Object.entries(merchantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topLocations = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topAmountRanges = Object.entries(amountRanges)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      topMerchants,
      topLocations,
      topCategories,
      topAmountRanges,
      totalFraud: fraudTransactions.length
    };
  }, [transactions]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden h-full">
      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Top 5 Fraud Patterns
            </h3>
            <p className="text-gray-600 text-sm">Detected in the last hour</p>
          </div>
          {patterns.totalFraud > 0 && (
            <div className="bg-red-100 border-2 border-red-300 rounded-lg px-4 py-2">
              <p className="text-xs text-red-600 uppercase font-bold">Total Fraud</p>
              <p className="text-2xl font-bold text-red-600">{patterns.totalFraud}</p>
            </div>
          )}
        </div>

        {patterns.totalFraud === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No fraud detected in the last hour</p>
            <p className="text-gray-300 text-sm mt-1">System is monitoring transactions</p>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Top Merchants */}
          {patterns.topMerchants.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Top Merchants
              </h4>
              <div className="space-y-2">
                {patterns.topMerchants.map(([merchant, count], idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-red-50 to-white rounded-lg p-3 hover:from-red-100 hover:to-gray-50 transition-all border border-red-100">
                    <span className="text-gray-900 text-sm font-medium truncate">{merchant}</span>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Categories */}
          {patterns.topCategories.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Top Categories
              </h4>
              <div className="space-y-2">
                {patterns.topCategories.map(([category, count], idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-white rounded-lg p-3 hover:from-purple-100 hover:to-gray-50 transition-all border border-purple-100">
                    <span className="text-gray-900 text-sm font-medium truncate">{category}</span>
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Locations */}
          {patterns.topLocations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Top Locations
              </h4>
              <div className="space-y-2">
                {patterns.topLocations.map(([location, count], idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-white rounded-lg p-3 hover:from-orange-100 hover:to-gray-50 transition-all border border-orange-100">
                    <span className="text-gray-900 text-sm font-medium truncate">{location}</span>
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Ranges */}
          {patterns.topAmountRanges.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Amount Ranges
              </h4>
              <div className="space-y-2">
                {patterns.topAmountRanges.map(([range, count], idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-yellow-50 to-white rounded-lg p-3 hover:from-yellow-100 hover:to-gray-50 transition-all border border-yellow-100">
                    <span className="text-gray-900 text-sm font-medium">{range}</span>
                    <span className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default FraudPatterns;



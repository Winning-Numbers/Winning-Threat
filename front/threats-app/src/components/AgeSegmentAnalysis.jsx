import { useContext, useMemo } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AgeSegmentAnalysis = () => {
  const { transactions } = useContext(TransactionsContext);

  const ageData = useMemo(() => {
    const ageGroups = {
      '18-25': { total: 0, fraud: 0 },
      '26-35': { total: 0, fraud: 0 },
      '36-45': { total: 0, fraud: 0 },
      '46-55': { total: 0, fraud: 0 },
      '56-65': { total: 0, fraud: 0 },
      '65+': { total: 0, fraud: 0 },
    };

    transactions.forEach((t) => {
      const dob = t.dob ? new Date(t.dob) : null;
      if (!dob) return;

      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const isFraud = t.is_fraud === 1 || t.merchant?.toLowerCase().includes('fraud');

      let ageGroup;
      if (age >= 18 && age <= 25) ageGroup = '18-25';
      else if (age >= 26 && age <= 35) ageGroup = '26-35';
      else if (age >= 36 && age <= 45) ageGroup = '36-45';
      else if (age >= 46 && age <= 55) ageGroup = '46-55';
      else if (age >= 56 && age <= 65) ageGroup = '56-65';
      else if (age > 65) ageGroup = '65+';

      if (ageGroup) {
        ageGroups[ageGroup].total += 1;
        if (isFraud) {
          ageGroups[ageGroup].fraud += 1;
        }
      }
    });

    return Object.entries(ageGroups).map(([age, data]) => ({
      age,
      total: data.total,
      fraud: data.fraud,
      fraudRate: data.total > 0 ? ((data.fraud / data.total) * 100).toFixed(1) : 0,
    }));
  }, [transactions]);

  const mostExposed = useMemo(() => {
    return ageData.reduce((max, current) => 
      parseFloat(current.fraudRate) > parseFloat(max.fraudRate) ? current : max
    , ageData[0] || { age: 'N/A', fraudRate: 0 });
  }, [ageData]);

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">
          Age Segment Analysis
        </h3>
        {mostExposed.age !== 'N/A' && (
          <div className="bg-red-900 border border-red-700 rounded px-3 py-2">
            <p className="text-xs text-red-200 uppercase">Most Exposed</p>
            <p className="text-lg font-bold text-white">{mostExposed.age} years</p>
            <p className="text-xs text-red-300">{mostExposed.fraudRate}% fraud rate</p>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="text-slate-400 text-center py-4">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="age" 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="total" fill="#3b82f6" name="Total Transactions" />
            <Bar dataKey="fraud" fill="#ef4444" name="Fraud Detected" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AgeSegmentAnalysis;



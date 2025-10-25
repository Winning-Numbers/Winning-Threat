import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FraudChart = ({ transactions }) => {
  // Group transactions by time intervals (last 60 minutes)
  const generateChartData = () => {
    if (transactions.length === 0) return [];

    // Get transactions from last hour
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    
    // Group by 5-minute intervals
    const intervals = {};
    
    transactions.forEach((transaction) => {
      // Parse transaction datetime
      const transDate = new Date(`${transaction.trans_date} ${transaction.trans_time}`);
      
      if (transDate >= oneHourAgo) {
        const minuteKey = Math.floor(transDate.getMinutes() / 5) * 5;
        const key = `${transDate.getHours()}:${minuteKey.toString().padStart(2, '0')}`;
        
        if (!intervals[key]) {
          intervals[key] = { time: key, total: 0, fraud: 0, legitimate: 0 };
        }
        
        intervals[key].total += 1;
        const isFraud = transaction.is_fraud === 1 || transaction.merchant?.toLowerCase().includes('fraud');
        if (isFraud) {
          intervals[key].fraud += 1;
        } else {
          intervals[key].legitimate += 1;
        }
      }
    });

    return Object.values(intervals).sort((a, b) => {
      const [aHr, aMin] = a.time.split(':').map(Number);
      const [bHr, bMin] = b.time.split(':').map(Number);
      return aHr * 60 + aMin - (bHr * 60 + bMin);
    });
  };

  const data = generateChartData();

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500">
        <p>Waiting for transaction data...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="time" 
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
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Total Transactions"
        />
        <Line 
          type="monotone" 
          dataKey="fraud" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Fraud Detected"
        />
        <Line 
          type="monotone" 
          dataKey="legitimate" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Legitimate"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FraudChart;



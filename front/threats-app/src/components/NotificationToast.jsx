import { useState, useEffect, useContext } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';

const NotificationToast = () => {
  const { transactions } = useContext(TransactionsContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (transactions.length > 0) {
      const latestTransaction = transactions[transactions.length - 1];
      const isFraud = latestTransaction.ml_prediction === true || 
                     latestTransaction.ml_prediction === 1 || 
                     latestTransaction.ml_prediction === "1";
      
      if (isFraud) {
        const newNotification = {
          id: Date.now(),
          transaction: latestTransaction,
          timestamp: new Date()
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
      }
    }
  }, [transactions]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto bg-black border-2 border-red-500 rounded-lg p-4 shadow-2xl shadow-red-500/50 animate-slideInRight max-w-sm backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-red-400 tracking-wider">FRAUD DETECTED</h4>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-auto text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-xs text-gray-400 mb-2">
                <span className="font-semibold text-white">
                  {notification.transaction.first} {notification.transaction.last}
                </span>
                {' '}• ${notification.transaction.amt}
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{notification.transaction.city}, {notification.transaction.state}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-shrink"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;



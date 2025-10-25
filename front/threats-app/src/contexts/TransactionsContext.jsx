import React, { createContext, useState, useEffect } from "react";

export const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  // Fetch the last transaction every 3 seconds
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/last_transaction"
        );
        if (!res.ok) return; // skip if not ok
        const data = await res.json();

        setTransactions([...transactions, data.transaction]);
        console.log("Noua tranzactie:", data);
      } catch (err) {
        console.error("Error fetching transaction:", err);
      }
    };

    fetchTransaction(); // first call
    const interval = setInterval(fetchTransaction, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TransactionsContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from "react";

export const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/last_transaction"
        );

        if (!res.ok) {
          console.warn("Response not OK:", res.status);
          return;
        }

        const data = await res.json();
        // data = { transaction: {...}, ml_prediction: ... }

        // build the shape we keep in state
        const newTx = {
          ...data.transaction,
          ml_prediction: data.ml_prediction,
        };

        // sanity check
        if (
          !newTx ||
          !newTx.transaction_id // must have id
        ) {
          console.warn("No valid transaction in response:", data);
          return;
        }

        setTransactions((prev) => {
          const last = prev[prev.length - 1];

          // append only if it's new (ID changed)
          if (
            !last ||
            String(last.transaction_id) !== String(newTx.transaction_id)
          ) {
            const updated = [...prev, newTx];
            console.log("Added new transaction:", newTx);
            return updated;
          }

          // else keep same list
          return prev;
        });
      } catch (err) {
        console.error("Error fetching transaction:", err);
      }
    };

    // first fetch immediately
    fetchTransaction();

    // then poll every 1s
    const interval = setInterval(fetchTransaction, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TransactionsContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
};

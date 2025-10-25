import { createContext, useContext } from "react";

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  // hardcode dummy data for now
  const transactions = [
    {
      id: 1,
      name: "Kaufland",
      category: "Groceries",
      amount: -72.45,
      date: "2025-10-24",
      paymentMethod: "Card",
    },
    {
      id: 2,
      name: "Salary",
      category: "Income",
      amount: 4200,
      date: "2025-10-23",
      paymentMethod: "Bank transfer",
    },
    {
      id: 3,
      name: "Uber",
      category: "Transport",
      amount: -18.9,
      date: "2025-10-22",
      paymentMethod: "Card",
    },
  ];

  return (
    <TransactionsContext.Provider value={{ transactions }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used inside <TransactionsProvider>."
    );
  }
  return context;
}

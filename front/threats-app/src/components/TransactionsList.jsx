import Transaction from "./Transaction";
import { TransactionsContext } from "../contexts/TransactionsContext";
import { useContext } from "react";

const TransactionsList = () => {
  const { transactions } = useContext(TransactionsContext);

  return transactions.map((t) => (
    <Transaction key={t.transaction_id} id={t.transaction_id} />
  ));
};

export default TransactionsList;

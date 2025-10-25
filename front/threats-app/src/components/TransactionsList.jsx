import Transaction from "./Transaction";
import { useTransactions } from "../contexts/TransactionsContext";

const TransactionsList = () => {
  const { transactions } = useTransactions();

  return (
    <div>
      {transactions.map((t) => (
        <Transaction key={t.id} id={t.id} name={t.name} category={t.category} />
      ))}
    </div>
  );
};

export default TransactionsList;

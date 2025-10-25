import TransactionsList from "./components/TransactionsList";
import { TransactionsProvider } from "./contexts/TransactionsContext";

function App() {
  return (
    <TransactionsProvider>
      <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center">
        <TransactionsList />
      </div>
    </TransactionsProvider>
  );
}

export default App;

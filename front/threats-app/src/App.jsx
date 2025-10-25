import TransactionsList from "./components/TransactionsList";
import { TransactionsProvider } from "./contexts/TransactionsContext";

function App() {
  return (
    <TransactionsProvider>
      <div className="bg-[#1e1f22] min-h-screen flex flex-col items-center justify-center py-8">
        <TransactionsList />
      </div>
    </TransactionsProvider>
    //test
  );
}

export default App;

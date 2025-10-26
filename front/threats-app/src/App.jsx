import Dashboard from "./components/Dashboard";
import { TransactionsProvider } from "./contexts/TransactionsContext";

function App() {
  return (
    <TransactionsProvider>
      <Dashboard />
    </TransactionsProvider>
  );
}

export default App;

import './App.css';
import WalletHeader from './components/WalletHeader';
import TransferPanel from './components/TransferPanel';
import TransactionHistory from './components/TransactionHistory';

export default function App() {
  return (
    <div className="app">
      <div className="app-content">
        <WalletHeader />
        <TransferPanel />
        {/* <TransactionHistory /> */}
      </div>
      <div className="app-footer">
        Web3 Wallet Demo · Powered by React
      </div>
    </div>
  );
}
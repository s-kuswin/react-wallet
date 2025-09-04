import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WalletHeader.css';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const networks = [
  { name: '本地网络', value: 'local' },
  { name: '测试网络', value: 'testnet' }
];

export default function WalletHeader() {
  const [network, setNetwork] = useState(networks[0].value);
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${account}`;

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('请安装 MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败，请检查 MetaMask 是否正确安装和配置。');
    }
  };

  useEffect(() => {
    connectWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', connectWallet);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connectWallet);
      }
    };
  }, []);

  return (
    <div className="wallet-header">
      <div className="wallet-info">
        <img
          src={avatarUrl}
          alt="avatar"
          className="wallet-avatar"
        />
        <div>
          {account ? (
            <>
              <div className="wallet-balance">
                {parseFloat(balance).toFixed(4)} ETH
              </div>
              <div className="wallet-address">
                <span className="wallet-status-dot" />
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </>
          ) : (
            <button onClick={connectWallet} className="connect-wallet-btn">
              连接钱包
            </button>
          )}
        </div>
      </div>
      <div>
        <select
          className="network-select"
          value={network}
          onChange={e => setNetwork(e.target.value)}
        >
          {networks.map(n => (
            <option key={n.value} value={n.value}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
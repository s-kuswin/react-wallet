import { useState, useEffect } from 'react';
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

// 预设链配置：local=Hardhat(31337), testnet=Sepolia(11155111)
const chainConfigs: Record<string, {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}> = {
  local: {
    chainId: '0x7a69', // 31337
    chainName: 'Localhost 8545',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
  },
  testnet: {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Test Network',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  }
};

export default function WalletHeader() {
  const [network, setNetwork] = useState(networks[0].value);
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${account}`;

  const mapChainIdToKey = (hexChainId: string): string | null => {
    if (!hexChainId) return null;
    const lower = hexChainId.toLowerCase();
    if (lower === chainConfigs.local.chainId) return 'local';
    if (lower === chainConfigs.testnet.chainId) return 'testnet';
    return null;
  };

  const refreshBalance = async (addr: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const b = await provider.getBalance(addr);
    setBalance(ethers.formatEther(b));
  };

  const switchOrAddNetwork = async (targetKey: string) => {
    if (!window.ethereum) {
      alert('请安装 MetaMask!');
      return;
    }
    const cfg = chainConfigs[targetKey];
    if (!cfg) {
      alert('未知的网络配置');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cfg.chainId }]
      });
    } catch (switchError: any) {
      // 4902: 未添加链
      if (switchError?.code === 4902 || (switchError?.data && switchError?.data?.originalError?.code === 4902)) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [cfg]
          });
        } catch (addError) {
          console.error('添加链失败:', addError);
          alert('添加链失败，请检查钱包权限或网络配置。');
          return;
        }
      } else {
        console.error('切换网络失败:', switchError);
        alert('切换网络失败，请在钱包中手动切换后重试。');
        return;
      }
    }

    setNetwork(targetKey);
    if (account) {
      try { await refreshBalance(account); } catch {}
    }
  };

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

      try {
        const currentChainId: string = await window.ethereum.request({ method: 'eth_chainId' });
        const key = mapChainIdToKey(currentChainId);
        if (key) setNetwork(key);
      } catch {}
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
          onChange={e => switchOrAddNetwork(e.target.value)}
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
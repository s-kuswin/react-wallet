import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TransferPanel.css';
import './TransactionHistory.css';

const INFURA_PROJECT_ID = "142e5c27dd8e4af6abff2be271add6ac";
const network = "sepolia";
const provider = new ethers.JsonRpcProvider(`https://${network}.infura.io/v3/${INFURA_PROJECT_ID}`);

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Transaction {
  hash: string;
  type: string;
  amount: string;
  time: string;
  status: string;
}


export default function NormalTransfer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 获取交易历史记录
  const fetchTransactionHistory = async (address: string) => {
    
  };

  // 连接钱包并获取交易历史
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          await fetchTransactionHistory(accounts[0]);
        } catch (error) {
          console.error('连接钱包失败:', error);
        }
      }
    };

    connectWallet();

    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        fetchTransactionHistory(accounts[0]);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => { });
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const to = (form.elements.namedItem('to') as HTMLInputElement).value;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;

    try {
      if (!window.ethereum) {
        throw new Error('请先安装 MetaMask!');
      }

      // 首先请求用户连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 检查网络连接
      const network = await provider.getNetwork();
      console.log('当前网络:', network.name);

      const tx = await signer.sendTransaction({
        to: to,
        value: ethers.parseEther(amount)
      });

      await tx.wait();

      // 刷新交易历史
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await fetchTransactionHistory(accounts[0]);
      alert('转账成功！');
    } catch (error: any) {
      console.error('转账失败:', error);
      let errorMessage = '转账失败: ';

      // 处理常见错误类型
      if (error.code === 4001) {
        errorMessage += '用户拒绝了交易请求';
      } else if (error.code === -32002) {
        errorMessage += '钱包已经有一个待处理的请求，请检查钱包';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage += '余额不足';
      } else if (error.message.includes('nonce')) {
        errorMessage += '请刷新页面重试';
      } else {
        errorMessage += error.message || '未知错误';
      }

      alert(errorMessage);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="transfer-form">
        <input
          name="to"
          className="transfer-input"
          placeholder="收款地址"
          required
        />
        <input
          name="amount"
          className="transfer-input"
          placeholder="转账金额 (ETH)"
          type="number"
          step="any"
          required
        />
        <button
          type="submit"
          disabled={!window.ethereum}
          className="submit-button transfer"
        >
          发起转账
        </button>
      </form>

      {/* <div className="tx-history">
        <div className="tx-title">
          历史交易
        </div>
        <div className="tx-table-container">
          <table className="tx-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>金额</th>
                <th>时间</th>
                <th>状态</th>
                <th>哈希</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={idx}>
                  <td className="tx-type">{tx.type}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.time}</td>
                  <td>
                    <span className={`tx-status ${tx.status === '成功' ? 'success' : 'failed'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="tx-hash">{tx.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
}

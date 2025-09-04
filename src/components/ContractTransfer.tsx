import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TransferPanel.css';
import TransferWidthLogABI from '../abi/TransferWidthLog.json';

interface TransferHistory {
  id: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
}

export default function ContractTransfer() {
  const [history, setHistory] = useState<TransferHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const contractAddress = '0xbd6e267D816703Eb532C64a7c185dDcb8f4E1f00';
  const subgraphUrl = 'https://api.studio.thegraph.com/query/118918/get-transfer-list/version/latest';

  // 获取转账历史
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const query = {
        query: "{ transferLogs(first: 5) { id from to amount timestamp } }",
        operationName: "Subgraphs",
        variables: {}
      };
      const res = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer b8c158ab7b28419b9c7a771efdd4435c'
        },
        body: JSON.stringify(query)
      });
      const data = await res.json();
      setHistory(data.data?.transferLogs || []);
    } catch (err) {
      console.error('获取历史记录失败:', err);
      setHistory([]);
    }
    setLoadingHistory(false);
  };

  // 组件加载时获取历史记录
  useEffect(() => {
    fetchHistory();
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

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      console.log('Signer address:', await signer.getAddress());

      const contract = new ethers.Contract(contractAddress, TransferWidthLogABI.abi, signer);
      const tx = await contract.transferAndLog(to, { value: ethers.parseEther(amount) });
      await tx.wait();
      alert('合约转账成功！');
      fetchHistory(); // 转账成功后刷新历史
    } catch (error) {
      console.error('合约转账失败:', error);
      alert('合约转账失败，请检查控制台了解详情。');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="transfer-form">
        <input
          name="to"
          className="transfer-input"
          placeholder="合约收款地址"
          required
        />
        <input
          name="amount"
          className="transfer-input"
          placeholder="转账金额"
          type="number"
          step="any"
          required
        />
        <button
          type="submit"
          disabled={!window.ethereum}
          className="submit-button contract"
        >
          发起合约转账
        </button>
      </form>

      {/* 历史记录展示 */}
      <div className="transfer-history">
        <h3>合约转账历史</h3>
        {loadingHistory ? (
          <div>加载中...</div>
        ) : history.length === 0 ? (
          <div>暂无历史记录</div>
        ) : (
          <div className="tx-table-container">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>发送方</th>
                  <th>接收方</th>
                  <th>金额(ETH)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>
                    <td className="tx-hash">{item.from}</td>
                    <td className="tx-hash">{item.to}</td>
                    <td>{ethers.formatEther(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </div>
    </div>
  );
}

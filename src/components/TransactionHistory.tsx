import React from 'react';
import './TransactionHistory.css';

const mockTxs = [
  {
    hash: '0xabc123...',
    type: '转账',
    amount: '1.2 ETH',
    time: '2025-08-25 14:32',
    status: '成功'
  },
  {
    hash: '0xdef456...',
    type: '兑换U',
    amount: '100 USDT',
    time: '2025-08-24 10:12',
    status: '成功'
  }
];

export default function TransactionHistory() {
  return (
    <div className="tx-history">
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
            {mockTxs.map((tx, idx) => (
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
    </div>
  );
}
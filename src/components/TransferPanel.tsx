import React, { useState } from 'react';
import './TransferPanel.css';
import NormalTransfer from './NormalTransfer';
import ContractTransfer from './ContractTransfer';
import SwapPanel from './SwapPanel';

export default function TransferPanel() {
  const [tab, setTab] = useState<'transfer' | 'contract' | 'swap'>('transfer');

  return (
    <div className="transfer-panel">
      <div className="tab-group">
        <button
          onClick={() => setTab('transfer')}
          className={`tab-button transfer ${tab === 'transfer' ? 'active' : ''}`}
        >
          普通转账
        </button>
        <button
          onClick={() => setTab('contract')}
          className={`tab-button contract ${tab === 'contract' ? 'active' : ''}`}
        >
          合约转账
        </button>
        <button
          onClick={() => setTab('swap')}
          className={`tab-button swap ${tab === 'swap' ? 'active' : ''}`}
        >
          兑换U
        </button>
      </div>

      {tab === 'transfer' ? (
        <NormalTransfer />
      ) : tab === 'contract' ? (
        <ContractTransfer />
      ) : (
        <SwapPanel />
      )}
    </div>
  );
}
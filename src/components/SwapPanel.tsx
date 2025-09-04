import React from 'react';
import './TransferPanel.css';

export default function SwapPanel() {
  return (
    <form className="transfer-form">
      <input
        className="transfer-input"
        placeholder="兑换数量（U）"
      />
      <button className="submit-button swap">
        兑换U
      </button>
    </form>
  );
}

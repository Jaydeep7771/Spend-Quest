import { formatINR } from '../../utils/formatCurrency.js';

export default function TxList({ items = [] }) {
  return (
    <div className="card">
      <h3>Recent Transactions</h3>
      {items.slice(0, 5).map((tx) => (
        <div key={tx.id} className="row" style={{ justifyContent: 'space-between' }}>
          <span>{tx.plain_label || tx.merchant_raw}</span>
          <b style={{ color: tx.type === 'debit' ? '#EF4444' : '#22C55E' }}>{formatINR(tx.amount)}</b>
        </div>
      ))}
    </div>
  );
}

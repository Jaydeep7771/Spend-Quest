import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions.js';
import TxList from '../components/transactions/TxList.jsx';

export default function Transactions() {
  const [query, setQuery] = useState('');
  const { data } = useTransactions({ page: 1, limit: 20, search: query });

  return (
    <div>
      <div className="card row">
        <input placeholder="Search merchant" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select><option>All Categories</option></select>
        <input type="date" />
        <input type="date" />
      </div>
      <TxList items={data?.items || []} />
    </div>
  );
}

import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { CATEGORY_META } from '../../utils/categorize.js';

export default function CategoryPie({ data = [] }) {
  return (
    <div className="card">
      <h3>Category Split</h3>
      <PieChart width={280} height={220}>
        <Pie data={data} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70}>
          {data.map((item) => <Cell key={item.category} fill={CATEGORY_META[item.category]?.color || '#9998B8'} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}

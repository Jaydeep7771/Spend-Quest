import XPBar from '../components/gamification/XPBar.jsx';
import StreakCounter from '../components/gamification/StreakCounter.jsx';
import QuestCard from '../components/gamification/QuestCard.jsx';
import TxList from '../components/transactions/TxList.jsx';
import CategoryPie from '../components/charts/CategoryPie.jsx';
import { useXP } from '../hooks/useXP.js';
import { useQuests } from '../hooks/useQuests.js';
import { useStreaks } from '../hooks/useStreaks.js';
import { useTransactions } from '../hooks/useTransactions.js';

export default function Dashboard() {
  const xp = useXP();
  const quests = useQuests();
  const streaks = useStreaks();
  const tx = useTransactions({ page: 1, limit: 5 });

  return (
    <div>
      <XPBar xp={xp.data || undefined} />
      <StreakCounter streak={streaks.data?.current_streak || 0} />
      <QuestCard quest={quests.data?.[0]} />
      <div className="row">
        <CategoryPie data={[{ category: 'food', total: 40 }, { category: 'transport', total: 30 }, { category: 'other', total: 30 }]} />
        <TxList items={tx.data?.items || []} />
      </div>
      <div className="card row">
        <button className="btn">Add Transaction</button>
        <button className="btn">Import SMS</button>
        <button className="btn">View Quests</button>
      </div>
    </div>
  );
}

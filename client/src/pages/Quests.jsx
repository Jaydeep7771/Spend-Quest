import { useQuests } from '../hooks/useQuests.js';
import QuestCard from '../components/gamification/QuestCard.jsx';

export default function Quests() {
  const { data } = useQuests();
  return <div>{(data || []).map((q) => <QuestCard key={q.id || q.quest_id} quest={q} />)}</div>;
}

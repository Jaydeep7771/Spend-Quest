export default function QuestCard({ quest }) {
  const progress = quest?.progress?.current || 0;
  const target = quest?.progress?.target || 1;
  const percent = Math.min((progress / target) * 100, 100);
  return (
    <div className="card">
      <h4>{quest?.title || 'Quest'}</h4>
      <p>{quest?.description}</p>
      <div style={{ background: '#1A1A24', borderRadius: 999, height: 8 }}>
        <div style={{ width: `${percent}%`, height: '100%', background: '#22C55E', borderRadius: 999 }} />
      </div>
      <small>{Math.round(percent)}% complete • {quest?.xp_reward || 0} XP</small>
    </div>
  );
}

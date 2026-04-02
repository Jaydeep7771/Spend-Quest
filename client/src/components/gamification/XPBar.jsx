import { motion } from 'framer-motion';
import { formatINR } from '../../utils/formatCurrency.js';
import { levelProgress, xpToNextLevel } from '../../utils/xpCalculator.js';

export default function XPBar({ xp = { total_xp: 0, level: 1, level_name: 'Rookie Saver' } }) {
  const progress = levelProgress(Number(xp.total_xp));
  return (
    <div className="card">
      <h3>✨ Level {xp.level} — {xp.level_name}</h3>
      <div style={{ background: '#1A1A24', borderRadius: 999, height: 12 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ background: '#7C5CFC', height: '100%', borderRadius: 999 }} />
      </div>
      <p>{xpToNextLevel(Number(xp.total_xp))} XP to next level</p>
      <small>Total XP value: {formatINR(Number(xp.total_xp))} (visual only)</small>
    </div>
  );
}

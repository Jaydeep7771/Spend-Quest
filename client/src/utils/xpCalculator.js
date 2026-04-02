const LEVELS = [0, 500, 1500, 3500, 7500, 15000];

export function xpToNextLevel(totalXP = 0) {
  const next = LEVELS.find((t) => t > totalXP) ?? totalXP;
  return Math.max(next - totalXP, 0);
}

export function levelProgress(totalXP = 0) {
  let start = 0;
  let end = LEVELS[1];
  for (let i = 0; i < LEVELS.length - 1; i += 1) {
    if (totalXP >= LEVELS[i] && totalXP < LEVELS[i + 1]) {
      start = LEVELS[i];
      end = LEVELS[i + 1];
      break;
    }
  }
  return ((totalXP - start) / Math.max(end - start, 1)) * 100;
}

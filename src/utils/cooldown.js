const store = new Map();

export function hasCooldown(key, ms) {
  const now = Date.now();
  const until = store.get(key) || 0;
  if (until > now) return until - now;
  return 0;
}
export function setCooldown(key, ms) {
  store.set(key, Date.now() + ms);
}

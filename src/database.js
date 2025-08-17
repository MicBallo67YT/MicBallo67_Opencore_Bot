import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const db = new Database(path.join(dataDir, 'economy.db'));

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  userId TEXT NOT NULL,
  guildId TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  lastDaily INTEGER,
  lastWork INTEGER,
  PRIMARY KEY (userId, guildId)
);
CREATE TABLE IF NOT EXISTS drops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guildId TEXT NOT NULL,
  channelId TEXT NOT NULL,
  messageId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  claimedBy TEXT
);
`);

export const getUser = db.prepare('SELECT * FROM users WHERE userId=? AND guildId=?');
export const upsertUser = db.prepare(`INSERT INTO users(userId, guildId, balance, lastDaily, lastWork)
  VALUES(@userId, @guildId, @balance, @lastDaily, @lastWork)
  ON CONFLICT(userId, guildId) DO UPDATE SET balance=excluded.balance, lastDaily=excluded.lastDaily, lastWork=excluded.lastWork`);
export const addBalance = db.prepare('UPDATE users SET balance = balance + ? WHERE userId=? AND guildId=?');
export const setTimestamps = db.prepare('UPDATE users SET lastDaily=?, lastWork=? WHERE userId=? AND guildId=?');
export const ensureUser = (userId, guildId) => {
  const row = getUser.get(userId, guildId);
  if (!row) {
    upsertUser.run({ userId, guildId, balance: 0, lastDaily: null, lastWork: null });
    return getUser.get(userId, guildId);
  }
  return row;
};
export const topBalances = db.prepare('SELECT userId, balance FROM users WHERE guildId=? ORDER BY balance DESC LIMIT ?');

export const dropsTbl = {
  insert: db.prepare('INSERT INTO drops(guildId, channelId, messageId, amount) VALUES(?,?,?,?)'),
  getByMessage: db.prepare('SELECT * FROM drops WHERE messageId=?'),
  claim: db.prepare('UPDATE drops SET claimedBy=? WHERE id=? AND claimedBy IS NULL')
};

export default db;

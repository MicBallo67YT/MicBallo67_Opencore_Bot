import 'dotenv/config';

export const cfg = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  eventChannelId: process.env.EVENT_CHANNEL_ID,
  currency: process.env.CURRENCY || '⚡',
  dailyReward: Number(process.env.DAILY_REWARD ?? 250),
  workMin: Number(process.env.WORK_MIN ?? 25),
  workMax: Number(process.env.WORK_MAX ?? 75),
  dropMin: Number(process.env.DROP_MIN ?? 50),
  dropMax: Number(process.env.DROP_MAX ?? 150),
  cronEvent: process.env.CRON_EVENT || '0 * * * *',
};

if (!cfg.token) throw new Error('Brak DISCORD_TOKEN w .env');

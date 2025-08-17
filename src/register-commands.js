import { REST, Routes } from 'discord.js';
import { cfg } from './config.js';
import * as balance from './commands/balance.js';
import * as daily from './commands/daily.js';
import * as work from './commands/work.js';
import * as pay from './commands/pay.js';
import * as top from './commands/top.js';
import * as ev from './commands/events.js';

const commands = [balance.data, daily.data, work.data, pay.data, top.data, ev.data].map(c => c.toJSON());
const rest = new REST({ version: '10' }).setToken(cfg.token);

try {
  if (cfg.guildId) {
    await rest.put(Routes.applicationGuildCommands(cfg.clientId, cfg.guildId), { body: commands });
    console.log('Zarejestrowano komendy GUILD');
  } else {
    await rest.put(Routes.applicationCommands(cfg.clientId), { body: commands });
    console.log('Zarejestrowano komendy GLOBAL');
  }
} catch (e) { console.error(e); process.exit(1); }

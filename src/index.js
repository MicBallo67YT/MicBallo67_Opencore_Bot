import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { cfg } from './config.js';
import * as balance from './commands/balance.js';
import * as daily from './commands/daily.js';
import * as work from './commands/work.js';
import * as pay from './commands/pay.js';
import * as top from './commands/top.js';
import * as ev from './commands/events.js';
import './database.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
[balance, daily, work, pay, top, ev].forEach(c => client.commands.set(c.data.name, c));

client.once(Events.ClientReady, c => console.log(`Zalogowano jako ${c.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try { await cmd.execute(interaction); } catch (err) { console.error(err); await interaction.reply({ content: 'Błąd przy komendzie', ephemeral: true }); }
});

client.login(cfg.token);

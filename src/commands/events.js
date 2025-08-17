import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import cron from 'node-cron';
import { cfg } from '../config.js';
import { dropsTbl, ensureUser, addBalance } from '../database.js';

let scheduled = null;

export const data = new SlashCommandBuilder()
  .setName('eventy')
  .setDescription('Eventy dropów')
  .addSubcommand(s => s.setName('start').setDescription('Włącz automatyczne dropy').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild))
  .addSubcommand(s => s.setName('stop').setDescription('Wyłącz automatyczne dropy').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild))
  .addSubcommand(s => s.setName('drop').setDescription('Rzuć drop teraz'))
  .addSubcommand(s => s.setName('ustawkanal').setDescription('Ustaw kanał eventowy')
    .addChannelOption(o => o.setName('kanal').setDescription('Kanał').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  if (sub === 'ustawkanal') {
    const ch = interaction.options.getChannel('kanal', true);
    process.env.EVENT_CHANNEL_ID = ch.id;
    return interaction.reply(`Kanał ustawiony na ${ch}`);
  }
  const channelId = process.env.EVENT_CHANNEL_ID || cfg.eventChannelId || interaction.channelId;
  const channel = await interaction.guild.channels.fetch(channelId);

  const sendDrop = async () => {
    const amount = Math.floor(Math.random()*(cfg.dropMax - cfg.dropMin + 1)) + cfg.dropMin;
    const msg = await channel.send(`💰 **DROP!** Napisz claim w 30s aby zdobyć **${amount} ${cfg.currency}**!`);
    dropsTbl.insert.run(interaction.guildId, channel.id, msg.id, amount);
    const collector = msg.channel.createMessageCollector({ time: 30000 });
    collector.on('collect', m => {
      if (m.author.bot || m.content.toLowerCase() !== 'claim') return;
      const d = dropsTbl.getByMessage.get(msg.id);
      if (!d) return;
      const res = dropsTbl.claim.run(m.author.id, d.id);
      if (res.changes === 1) {
        ensureUser(m.author.id, m.guild.id);
        addBalance.run(d.amount, m.author.id, m.guild.id);
        collector.stop('claimed');
        msg.reply(`${m.author} zgarnął ${d.amount} ${cfg.currency}!`);
      }
    });
    collector.on('end', (_, r) => { if (r !== 'claimed') msg.reply('Nikt nie odebrał dropa.'); });
  };

  if (sub === 'drop') { await sendDrop(); return interaction.reply({ content: 'Drop wysłany', ephemeral: true }); }
  if (sub === 'start') { if (scheduled) return interaction.reply('Już działa.'); scheduled = cron.schedule(cfg.cronEvent, sendDrop); scheduled.start(); return interaction.reply('Włączono.'); }
  if (sub === 'stop') { if (!scheduled) return interaction.reply('Nie działa.'); scheduled.stop(); scheduled = null; return interaction.reply('Wyłączono.'); }
}

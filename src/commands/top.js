import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { cfg } from '../config.js';
import { topBalances } from '../database.js';

export const data = new SlashCommandBuilder()
  .setName('topka')
  .setDescription('Zobacz ranking najbogatszych');

export async function execute(interaction) {
  const rows = topBalances.all(interaction.guildId, 10);
  if (!rows.length) return interaction.reply('Brak danych.');
  const desc = rows.map((r, i) => `**${i+1}.** <@${r.userId}> — ${r.balance} ${cfg.currency}`).join('\n');
  const embed = new EmbedBuilder().setTitle('Top 10').setDescription(desc);
  await interaction.reply({ embeds: [embed] });
}

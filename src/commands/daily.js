import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { cfg } from '../config.js';
import { ensureUser, addBalance, setTimestamps } from '../database.js';
import { hasCooldown, setCooldown } from '../utils/cooldown.js';

export const data = new SlashCommandBuilder()
  .setName('dzienna')
  .setDescription('Odbierz swoją dzienną nagrodę');

export async function execute(interaction) {
  const key = `daily:${interaction.guildId}:${interaction.user.id}`;
  const left = hasCooldown(key, 24*60*60*1000);
  if (left) return interaction.reply({ content: `Musisz poczekać **${Math.ceil(left/3600000)}h**`, ephemeral: true });
  ensureUser(interaction.user.id, interaction.guildId);
  addBalance.run(cfg.dailyReward, interaction.user.id, interaction.guildId);
  setCooldown(key, 24*60*60*1000);
  setTimestamps.run(Date.now(), null, interaction.user.id, interaction.guildId);
  const embed = new EmbedBuilder().setTitle('Dzienna nagroda').setDescription(`+${cfg.dailyReward} ${cfg.currency}`);
  await interaction.reply({ embeds: [embed] });
}

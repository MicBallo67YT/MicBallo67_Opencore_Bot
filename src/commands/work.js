import { SlashCommandBuilder } from 'discord.js';
import { cfg } from '../config.js';
import { ensureUser, addBalance, setTimestamps } from '../database.js';
import { hasCooldown, setCooldown } from '../utils/cooldown.js';

export const data = new SlashCommandBuilder()
  .setName('praca')
  .setDescription('Idź do pracy i zarób');

export async function execute(interaction) {
  const key = `work:${interaction.guildId}:${interaction.user.id}`;
  const left = hasCooldown(key, 60*60*1000);
  if (left) return interaction.reply({ content: `Spróbuj za ${Math.ceil(left/60000)} minut`, ephemeral: true });
  const amount = Math.floor(Math.random()*(cfg.workMax - cfg.workMin + 1)) + cfg.workMin;
  ensureUser(interaction.user.id, interaction.guildId);
  addBalance.run(amount, interaction.user.id, interaction.guildId);
  setCooldown(key, 60*60*1000);
  setTimestamps.run(null, Date.now(), interaction.user.id, interaction.guildId);
  await interaction.reply(`Zarobiłeś **${amount} ${cfg.currency}**.`);
}

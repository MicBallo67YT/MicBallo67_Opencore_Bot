import { SlashCommandBuilder } from 'discord.js';
import { cfg } from '../config.js';
import { ensureUser, addBalance } from '../database.js';

export const data = new SlashCommandBuilder()
  .setName('przelej')
  .setDescription('Wyślij pieniądze innemu graczowi')
  .addUserOption(o => o.setName('gracz').setDescription('Komu').setRequired(true))
  .addIntegerOption(o => o.setName('kwota').setDescription('Ile').setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('gracz', true);
  if (target.bot) return interaction.reply({ content: 'Nie możesz wysłać botowi.', ephemeral: true });
  const amount = interaction.options.getInteger('kwota', true);
  const u = ensureUser(interaction.user.id, interaction.guildId);
  if (u.balance < amount) return interaction.reply({ content: 'Za mało środków.', ephemeral: true });
  ensureUser(target.id, interaction.guildId);
  addBalance.run(-amount, interaction.user.id, interaction.guildId);
  addBalance.run(amount, target.id, interaction.guildId);
  await interaction.reply(`${interaction.user} wysłał ${target} **${amount} ${cfg.currency}**.`);
}

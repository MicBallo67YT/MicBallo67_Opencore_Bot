import { SlashCommandBuilder } from 'discord.js';
import { cfg } from '../config.js';
import { ensureUser } from '../database.js';

export const data = new SlashCommandBuilder()
  .setName('saldo')
  .setDescription('Sprawdź swoje saldo');

export async function execute(interaction) {
  const u = ensureUser(interaction.user.id, interaction.guildId);
  await interaction.reply(`${interaction.user} masz **${u.balance} ${cfg.currency}**`);
}

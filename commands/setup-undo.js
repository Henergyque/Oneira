import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { readFile, writeFile } from 'fs/promises';

const stateUrl = new URL('../setup-state.json', import.meta.url);

async function loadState() {
  try {
    const raw = await readFile(stateUrl, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveState(state) {
  await writeFile(stateUrl, JSON.stringify(state, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName('setup-undo')
    .setDescription('Remove roles/channels created by /setup')
    .addStringOption(option =>
      option
        .setName('confirm')
        .setDescription('Type CONFIRM to proceed')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
      return;
    }

    const allowedGuildId = process.env.GUILD_ID;
    if (allowedGuildId && interaction.guildId !== allowedGuildId) {
      await interaction.reply({ content: '❌ This command is not allowed in this server.', ephemeral: true });
      return;
    }

    const confirm = interaction.options.getString('confirm');
    if (confirm !== 'CONFIRM') {
      await interaction.reply({ content: '❌ Confirmation failed. Type CONFIRM to proceed.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const state = await loadState();
    if (!state || state.guildId !== interaction.guildId) {
      await interaction.editReply('❌ No setup state found for this server. Run /setup again first.');
      return;
    }

    const guild = interaction.guild;
    await guild.roles.fetch();
    await guild.channels.fetch();

    const channels = (state.createdChannelIds || [])
      .map(id => guild.channels.cache.get(id))
      .filter(Boolean);

    const nonCategories = channels.filter(channel => channel.type !== ChannelType.GuildCategory);
    const categories = channels.filter(channel => channel.type === ChannelType.GuildCategory);

    for (const channel of nonCategories) {
      await channel.delete('setup-undo cleanup');
    }

    for (const category of categories) {
      await category.delete('setup-undo cleanup');
    }

    const roles = (state.createdRoleIds || [])
      .map(id => guild.roles.cache.get(id))
      .filter(role => role && !role.managed && role.id !== guild.roles.everyone.id);

    for (const role of roles) {
      await role.delete('setup-undo cleanup');
    }

    await saveState({
      guildId: state.guildId,
      createdRoleIds: [],
      createdChannelIds: [],
      clearedAt: new Date().toISOString(),
    });

    await interaction.editReply(
      `✅ Cleanup done. Deleted ${nonCategories.length + categories.length} channels and ${roles.length} roles.`
    );
  },
};

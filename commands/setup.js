import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { readFile, writeFile } from 'fs/promises';

const stateUrl = new URL('../setup-state.json', import.meta.url);

const ROLE_NAMES = [
  'Creator',
  'Developer',
  'Moderator',
  'Tester',
  'Patreon Tier 1',
  'Patreon Tier 2',
  'Patreon Tier 3',
  'Trialist',
  'Survivor',
  'Victor',
  'Champion',
  'Darling',
  "Oneira's Favorite",
  'Tempted',
  'Corrupted',
  'Artist',
  'Bug Hunter',
];

const CATEGORY_CONFIGS = [
  {
    name: 'WELCUM',
    channels: [
      { name: '😈・welcum', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone, botMember) => [
      { id: everyone.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
      botMember ? { id: botMember.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'INFORMATION',
    channels: [
      { name: '💋・rules', type: ChannelType.GuildText },
      { name: '🕯️・announcements', type: ChannelType.GuildText },
      { name: '🕸️・links', type: ChannelType.GuildText },
      { name: '❓・faq', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.SendMessages] } : null,
      roles.Tester ? { id: roles.Tester.id, allow: [PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'GENERAL',
    channels: [
      { name: '💬・general', type: ChannelType.GuildText },
      { name: '🔞・nsfw-general', type: ChannelType.GuildText },
      { name: '🎨・fan-art', type: ChannelType.GuildText },
      { name: '🕸️・off-topic', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      roles.Darling ? { id: roles.Darling.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Tester ? { id: roles.Tester.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'GAME',
    channels: [
      { name: '🗣️・game-discussion', type: ChannelType.GuildText },
      { name: '📝・devlogs', type: ChannelType.GuildText },
      { name: '🐛・bug-reports', type: ChannelType.GuildText },
      { name: '💡・suggestions', type: ChannelType.GuildText },
      { name: '🕸️・spoilers', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      roles.Darling ? { id: roles.Darling.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Tester ? { id: roles.Tester.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'PATREON EXCLUSIVE',
    channels: [
      { name: '👑・patreon-lounge', type: ChannelType.GuildText },
      { name: '🎁・early-access', type: ChannelType.GuildText },
      { name: '🗳️・polls', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      roles['Patreon Tier 1'] ? { id: roles['Patreon Tier 1'].id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles['Patreon Tier 2'] ? { id: roles['Patreon Tier 2'].id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles['Patreon Tier 3'] ? { id: roles['Patreon Tier 3'].id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Tester ? { id: roles.Tester.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'VOICE',
    channels: [
      { name: '🎙️・general-voice', type: ChannelType.GuildVoice },
      { name: '🔇・afk', type: ChannelType.GuildVoice },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      roles.Darling ? { id: roles.Darling.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] } : null,
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] } : null,
      roles.Tester ? { id: roles.Tester.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] } : null,
    ],
  },
  {
    name: 'BOT',
    channels: [
      { name: '🤖・bot', type: ChannelType.GuildText },
      { name: '🏆・level-up', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      roles.Darling ? { id: roles.Darling.id, allow: [PermissionFlagsBits.ViewChannel] } : null,
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'SUPPORT',
    channels: [
      { name: '🎫・open-ticket', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      roles.Darling ? { id: roles.Darling.id, allow: [PermissionFlagsBits.ViewChannel] } : null,
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
  {
    name: 'STAFF ONLY',
    channels: [
      { name: '🛠️・staff-chat', type: ChannelType.GuildText },
      { name: '📊・logs', type: ChannelType.GuildText },
    ],
    permissions: (roles, everyone) => [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      roles.Creator ? { id: roles.Creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Developer ? { id: roles.Developer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Moderator ? { id: roles.Moderator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
      roles.Tester ? { id: roles.Tester.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } : null,
    ],
  },
];

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

function getRoleByName(guild, name) {
  return guild.roles.cache.find(role => role.name === name) ?? null;
}

function normalizeChannelName(name) {
  return name
    .toLowerCase()
    .replace(/^[^a-z0-9]+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureCategory(guild, name, permissionOverwrites) {
  const existing = guild.channels.cache.find(
    channel => channel.type === ChannelType.GuildCategory && channel.name === name
  );
  if (existing) {
    await existing.permissionOverwrites.set(permissionOverwrites);
    return { channel: existing, created: false };
  }

  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites,
  });
  return { channel, created: true };
}

async function ensureChannel(guild, config, parent) {
  const targetName = config.name;
  const normalizedTarget = normalizeChannelName(targetName);
  const existing = guild.channels.cache.find(channel => {
    if (channel.type !== config.type) return false;
    if (channel.name === targetName) return true;
    return normalizeChannelName(channel.name) === normalizedTarget;
  });
  if (existing) {
    if (existing.name !== targetName) {
      await existing.setName(targetName);
    }
    if (existing.parentId !== parent.id) {
      await existing.setParent(parent.id, { lockPermissions: true });
    } else {
      await existing.lockPermissions();
    }
    return { channel: existing, created: false };
  }

  const channel = await guild.channels.create({
    name: targetName,
    type: config.type,
    parent: parent.id,
  });
  await channel.lockPermissions();
  return { channel, created: true };
}

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Create the server structure (roles + channels)')
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

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    await guild.roles.fetch();
    await guild.channels.fetch();

    const roles = {};
    const createdChannelIds = [];
    for (const name of ROLE_NAMES) {
      roles[name] = getRoleByName(guild, name);
    }

    const everyone = guild.roles.everyone;
    const botMember = guild.members.me;

    for (const categoryConfig of CATEGORY_CONFIGS) {
      const permissionOverwrites = categoryConfig.permissions(roles, everyone, botMember)
        .filter(Boolean);
      const { channel: category, created: categoryCreated } = await ensureCategory(
        guild,
        categoryConfig.name,
        permissionOverwrites
      );
      if (categoryCreated) createdChannelIds.push(category.id);

      for (const channelConfig of categoryConfig.channels) {
        const { channel, created } = await ensureChannel(guild, channelConfig, category);
        if (created) createdChannelIds.push(channel.id);
      }
    }

    await saveState({
      guildId: guild.id,
      createdRoleIds: [],
      createdChannelIds,
      createdAt: new Date().toISOString(),
    });

    await interaction.editReply(
      `✅ Server structure created. Added ${createdChannelIds.length} channels. Roles were left unchanged.`
    );
  },
};

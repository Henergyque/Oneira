import { SlashCommandBuilder } from 'discord.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your game account to Discord to receive automatic roles')
    .addStringOption(option =>
      option.setName('uuid')
        .setDescription('Your player ID (Options → Anonymous Statistics in-game)')
        .setRequired(true)),

  async execute(interaction) {
    const uuid = interaction.options.getString('uuid').trim().toLowerCase();

    if (!UUID_REGEX.test(uuid)) {
      return interaction.reply({
        content: '❌ Invalid format. Copy your exact player ID from Options → Anonymous Statistics in-game.',
        ephemeral: true,
      });
    }

    try {
      const [zonesRes, linksRes] = await Promise.all([
        fetch(`${process.env.TELEMETRY_API_URL}/v1/players/zones`, {
          headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
        }),
        fetch(`${process.env.TELEMETRY_API_URL}/v1/players/links`, {
          headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
        }),
      ]);

      const zones = await zonesRes.json();
      const { links } = await linksRes.json();

      if (!zones[uuid]) {
        return interaction.reply({
          content: '❌ Unknown player ID. Launch the game at least once with anonymous statistics enabled.',
          ephemeral: true,
        });
      }

      const existing = (links || []).find(l => l.uuid === uuid);
      if (existing && existing.discordId === interaction.user.id) {
        return interaction.reply({
          content: '✅ This UUID is already linked to your Discord account. Your roles will be updated automatically.',
          ephemeral: true,
        });
      }
      if (existing && existing.discordId !== interaction.user.id) {
        return interaction.reply({
          content: '❌ This UUID is already linked to another Discord account.',
          ephemeral: true,
        });
      }

      await fetch(`${process.env.TELEMETRY_API_URL}/v1/players/link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, discordUsername: interaction.user.username, discordId: interaction.user.id }),
      });

      await interaction.reply({
        content: '✅ Linked! Your role will be updated within the next few minutes.',
        ephemeral: true,
      });
    } catch {
      await interaction.reply({
        content: '❌ Server connection error. Please try again in a moment.',
        ephemeral: true,
      });
    }
  },
};

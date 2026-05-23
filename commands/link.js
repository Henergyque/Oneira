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
        content: '❌ Format invalide. Copie ton UUID exact depuis Options → Statistiques anonymes en jeu.',
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
          content: '❌ UUID inconnu. Lance le jeu au moins une fois avec les statistiques anonymes activées.',
          ephemeral: true,
        });
      }

      const existing = (links || []).find(l => l.uuid === uuid);
      if (existing && existing.discordId === interaction.user.id) {
        return interaction.reply({
          content: '✅ Cet UUID est déjà lié à ton compte Discord. Tes rôles seront mis à jour automatiquement.',
          ephemeral: true,
        });
      }
      if (existing && existing.discordId !== interaction.user.id) {
        return interaction.reply({
          content: '❌ Cet UUID est déjà utilisé par un autre compte Discord.',
          ephemeral: true,
        });
      }

      await fetch(`${process.env.TELEMETRY_API_URL}/v1/players/link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, discordUsername: interaction.user.username, discordId: interaction.user.id }),
      });

      await interaction.reply({
        content: '✅ Lié ! Ton rôle sera mis à jour dans les prochaines minutes.',
        ephemeral: true,
      });
    } catch {
      await interaction.reply({
        content: '❌ Erreur de connexion au serveur. Réessaie dans un moment.',
        ephemeral: true,
      });
    }
  },
};

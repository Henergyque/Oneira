import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '../data');
const DATA_PATH = join(DATA_DIR, 'players.json');

function loadPlayers() {
  if (!existsSync(DATA_PATH)) return {};
  try { return JSON.parse(readFileSync(DATA_PATH, 'utf8')); } catch { return {}; }
}

function savePlayers(data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Lier ton compte de jeu à Discord pour recevoir tes rôles automatiquement')
    .addStringOption(option =>
      option.setName('uuid')
        .setDescription('Ton identifiant joueur (Options → Statistiques Anonymes dans le jeu)')
        .setRequired(true)),

  async execute(interaction) {
    const uuid = interaction.options.getString('uuid').trim().toLowerCase();

    if (!UUID_REGEX.test(uuid)) {
      return interaction.reply({
        content: '❌ Format invalide. Copie exactement l\'identifiant depuis Options → Statistiques Anonymes.',
        ephemeral: true,
      });
    }

    try {
      const res = await fetch(`${process.env.TELEMETRY_API_URL}/v1/players/zones`, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      });
      const zones = await res.json();

      if (!zones[uuid]) {
        return interaction.reply({
          content: '❌ Identifiant non reconnu. Lance le jeu au moins une fois avec les statistiques activées.',
          ephemeral: true,
        });
      }

      const players = loadPlayers();

      const alreadyLinked = Object.entries(players).find(([, v]) => v.discordId === interaction.user.id);
      if (alreadyLinked) delete players[alreadyLinked[0]];

      players[uuid] = { discordId: interaction.user.id, lastZone: null };
      savePlayers(players);

      await interaction.reply({
        content: '✅ Lien établi. Ton rôle sera mis à jour dans les prochaines minutes.',
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

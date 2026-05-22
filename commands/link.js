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
      const res = await fetch(`${process.env.TELEMETRY_API_URL}/v1/players/zones`, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      });
      const zones = await res.json();

      if (!zones[uuid]) {
        return interaction.reply({
          content: '❌ Unknown player ID. Launch the game at least once with anonymous statistics enabled.',
          ephemeral: true,
        });
      }

      const players = loadPlayers();

      const alreadyLinked = Object.entries(players).find(([, v]) => v.discordId === interaction.user.id);
      if (alreadyLinked) delete players[alreadyLinked[0]];

      players[uuid] = { discordId: interaction.user.id, lastZone: null };
      savePlayers(players);

      await fetch(`${process.env.TELEMETRY_API_URL}/v1/players/link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, discordUsername: interaction.user.username }),
      }).catch(() => {});

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

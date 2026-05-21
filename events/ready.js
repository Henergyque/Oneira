import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '../data');
const DATA_PATH = join(DATA_DIR, 'players.json');

const ZONE_ROLES = {
  intro:       () => process.env.ROLE_INTRO_ID,
  jeu1:        () => process.env.ROLE_JEU1_ID,
  jeu2_hub:    () => process.env.ROLE_JEU2_ID,
  jeu2_gauche: () => process.env.ROLE_JEU2_ID,
  jeu2_droite: () => process.env.ROLE_JEU2_ID,
  jeu2_arbre:  () => process.env.ROLE_JEU2_ID,
  endgame:     () => process.env.ROLE_ENDGAME_ID,
};

function allRoleIds() {
  return [...new Set([
    process.env.ROLE_INTRO_ID,
    process.env.ROLE_JEU1_ID,
    process.env.ROLE_JEU2_ID,
    process.env.ROLE_ENDGAME_ID,
  ].filter(Boolean))];
}

function loadPlayers() {
  if (!existsSync(DATA_PATH)) return {};
  try { return JSON.parse(readFileSync(DATA_PATH, 'utf8')); } catch { return {}; }
}

function savePlayers(data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function updateStatus(client) {
  try {
    const res = await fetch(`${process.env.TELEMETRY_API_URL}/v1/stats/live`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    const data = await res.json();
    const total = data?.totalUniques ?? 0;
    client.user.setPresence({
      activities: [{ name: `${total} souls... and counting`, type: 3 }],
      status: 'dnd',
    });
  } catch {
    client.user.setPresence({
      activities: [{ name: 'with your desires 😈', type: 0 }],
      status: 'dnd',
    });
  }
}

async function updateRoles(client) {
  try {
    const res = await fetch(`${process.env.TELEMETRY_API_URL}/v1/players/zones`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    const zones = await res.json();
    const players = loadPlayers();
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const roleIds = allRoleIds();
    let changed = false;

    for (const [uuid, data] of Object.entries(players)) {
      const zone = zones[uuid];
      if (!zone || zone === data.lastZone) continue;

      const newRoleId = ZONE_ROLES[zone]?.();
      if (!newRoleId) continue;

      try {
        const member = await guild.members.fetch(data.discordId);
        await member.roles.remove(roleIds.filter(id => id !== newRoleId));
        await member.roles.add(newRoleId);
        players[uuid].lastZone = zone;
        changed = true;
      } catch {
        // member left server or role missing — skip silently
      }
    }

    if (changed) savePlayers(players);
  } catch {
    // telemetry unreachable — skip
  }
}

export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🟢 Oneira is online as ${client.user.tag}`);
    updateStatus(client);
    setInterval(() => updateStatus(client), 30 * 1000);
    setInterval(() => updateRoles(client), 3 * 60 * 1000);
  },
};

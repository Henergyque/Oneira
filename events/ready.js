import { query } from '../lib/db.js';
import { runBackup } from '../lib/backup.js';

const ZONE_ROLES = {
  intro:       () => process.env.ROLE_INTRO_ID,
  jeu1:        () => process.env.ROLE_JEU1_ID,
  jeu2_hub:    () => process.env.ROLE_JEU2_ID,
  jeu2_gauche: () => process.env.ROLE_JEU2_ID,
  jeu2_droite: () => process.env.ROLE_JEU2_ID,
  jeu2_arbre:  () => process.env.ROLE_JEU2_ID,
};

function allRoleIds() {
  return [...new Set([
    process.env.ROLE_INTRO_ID,
    process.env.ROLE_JEU1_ID,
    process.env.ROLE_JEU2_ID,
  ].filter(Boolean))];
}

// uuid → lastZone (in-memory, resets on restart which is fine)
const lastZoneMap = new Map();

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
    const [zonesRes, linksRes] = await Promise.all([
      fetch(`${process.env.TELEMETRY_API_URL}/v1/players/zones`, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      }),
      fetch(`${process.env.TELEMETRY_API_URL}/v1/players/links`, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      }),
    ]);

    if (!zonesRes.ok) { console.error(`[roles] zones fetch failed: ${zonesRes.status}`); return; }
    if (!linksRes.ok) { console.error(`[roles] links fetch failed: ${linksRes.status}`); return; }

    const zones = await zonesRes.json();
    const { links } = await linksRes.json();

    if (!links || links.length === 0) return;

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const roleIds = allRoleIds();

    for (const { uuid, discordId } of links) {
      const zone = zones[uuid];
      if (!zone || zone === 'unknown') continue;

      const lastZone = lastZoneMap.get(uuid) ?? null;
      if (zone === lastZone) continue;

      const newRoleId = ZONE_ROLES[zone]?.();
      if (!newRoleId) { console.warn(`[roles] no role mapped for zone "${zone}"`); continue; }

      try {
        const member = await guild.members.fetch(discordId);
        await member.roles.remove(roleIds.filter(id => id !== newRoleId));
        await member.roles.add(newRoleId);
        lastZoneMap.set(uuid, zone);
        console.log(`[roles] ${uuid.slice(0, 8)} → ${zone} (role ${newRoleId})`);
      } catch (err) {
        console.error(`[roles] failed for ${uuid.slice(0, 8)}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`[roles] updateRoles error: ${err.message}`);
  }
}

async function resumeInterruptedBackup(client) {
  const guildId = process.env.GUILD_ID;
  if (!guildId) return;

  try {
    const res = await query(
      `SELECT 1 FROM backup_jobs WHERE guild_id = $1 AND status = 'running' LIMIT 1`,
      [guildId]
    );
    if (res.rows.length === 0) return;

    const guild = await client.guilds.fetch(guildId);
    console.log(`[backup] resuming interrupted backup for ${guild.name}...`);
    runBackup(guild, { log: msg => console.log(`[backup:${guildId}] ${msg}`) }).catch(err => {
      console.error('[backup] resume failed:', err);
    });
  } catch (err) {
    console.error('[backup] could not check for interrupted backup:', err.message);
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
    resumeInterruptedBackup(client);
  },
};

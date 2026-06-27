import { query } from './db.js';

const MESSAGE_BATCH_DELAY_MS = Number(process.env.BACKUP_MESSAGE_DELAY_MS) || 750;
const ATTACHMENT_DELAY_MS = Number(process.env.BACKUP_ATTACHMENT_DELAY_MS) || 350;
const CHANNEL_DELAY_MS = Number(process.env.BACKUP_CHANNEL_DELAY_MS) || 1500;

// guildId -> true while a backup loop is actively running in this process
const activeBackups = new Set();
// guildId -> last activity line, for live progress display
const lastActivity = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function emit(guildId, log, message) {
  lastActivity.set(guildId, message);
  log?.(message);
}

export function getLastActivity(guildId) {
  return lastActivity.get(guildId) ?? null;
}

async function getOrCreateJob(guildId) {
  const unfinished = await query(
    `SELECT * FROM backup_jobs WHERE guild_id = $1 AND status != 'completed' ORDER BY id DESC LIMIT 1`,
    [guildId]
  );
  if (unfinished.rows[0]) {
    const resumed = await query(
      `UPDATE backup_jobs SET status = 'running', error = NULL WHERE id = $1 RETURNING *`,
      [unfinished.rows[0].id]
    );
    return resumed.rows[0];
  }

  const created = await query(
    `INSERT INTO backup_jobs (guild_id, status) VALUES ($1, 'running') RETURNING *`,
    [guildId]
  );
  return created.rows[0];
}

async function getJobStatus(jobId) {
  const res = await query(`SELECT status FROM backup_jobs WHERE id = $1`, [jobId]);
  return res.rows[0]?.status ?? 'stopped';
}

async function finishJob(jobId, status, error = null) {
  await query(
    `UPDATE backup_jobs SET status = $2, error = $3, finished_at = now() WHERE id = $1`,
    [jobId, status, error]
  );
}

async function backupRoles(guild) {
  await guild.roles.fetch();
  for (const role of guild.roles.cache.values()) {
    await query(
      `INSERT INTO backup_roles (role_id, guild_id, name, color, position, hoist, mentionable, permissions, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       ON CONFLICT (role_id) DO UPDATE SET
         name = $3, color = $4, position = $5, hoist = $6, mentionable = $7, permissions = $8, updated_at = now()`,
      [role.id, guild.id, role.name, role.color, role.position, role.hoist, role.mentionable, role.permissions.bitfield.toString()]
    );
  }
}

async function saveChannelMeta(guild, channel, { isThread = false } = {}) {
  await query(
    `INSERT INTO backup_channels (channel_id, guild_id, name, type, parent_id, position, topic, nsfw, is_thread, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     ON CONFLICT (channel_id) DO UPDATE SET
       name = $3, type = $4, parent_id = $5, position = $6, topic = $7, nsfw = $8, is_thread = $9, updated_at = now()`,
    [
      channel.id,
      guild.id,
      channel.name,
      channel.type,
      channel.parentId ?? null,
      channel.position ?? null,
      channel.topic ?? null,
      channel.nsfw ?? false,
      isThread,
    ]
  );
}

async function backupMembers(guild) {
  const members = await guild.members.fetch();
  for (const member of members.values()) {
    await query(
      `INSERT INTO backup_members (user_id, guild_id, username, nickname, joined_at, role_ids, bot, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (user_id) DO UPDATE SET
         username = $3, nickname = $4, joined_at = $5, role_ids = $6, bot = $7, updated_at = now()`,
      [
        member.id,
        guild.id,
        member.user.username,
        member.nickname,
        member.joinedAt,
        [...member.roles.cache.keys()],
        member.user.bot,
      ]
    );
  }
}

// Gathers every channel/thread that can hold messages
async function collectTextChannels(guild) {
  await guild.channels.fetch();
  const result = [];

  for (const channel of guild.channels.cache.values()) {
    if (channel.isThread()) continue;
    await saveChannelMeta(guild, channel, { isThread: false });
    if (channel.isTextBased() && typeof channel.messages?.fetch === 'function') {
      result.push(channel);
    }

    if (typeof channel.threads?.fetchActive === 'function') {
      try {
        const active = await channel.threads.fetchActive();
        const archived = await channel.threads.fetchArchived();
        for (const thread of [...active.threads.values(), ...archived.threads.values()]) {
          await saveChannelMeta(guild, thread, { isThread: true });
          result.push(thread);
        }
      } catch (err) {
        console.error(`[backup] could not fetch threads for ${channel.name}:`, err.message);
      }
    }
  }

  return result;
}

async function saveMessage(guild, message) {
  await query(
    `INSERT INTO backup_messages (message_id, channel_id, guild_id, author_id, author_username, content, created_at, edited_at, reply_to_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (message_id) DO UPDATE SET
       content = $6, edited_at = $8`,
    [
      message.id,
      message.channelId,
      guild.id,
      message.author?.id ?? null,
      message.author?.username ?? null,
      message.content ?? '',
      message.createdAt,
      message.editedAt,
      message.reference?.messageId ?? null,
    ]
  );

  for (const attachment of message.attachments.values()) {
    await downloadAttachment(message.id, attachment);
    await sleep(ATTACHMENT_DELAY_MS);
  }
}

async function downloadAttachment(messageId, attachment) {
  const already = await query(
    `SELECT downloaded FROM backup_attachments WHERE attachment_id = $1`,
    [attachment.id]
  );
  if (already.rows[0]?.downloaded) return;

  let data = null;
  let downloaded = false;
  try {
    const res = await fetch(attachment.url);
    if (res.ok) {
      data = Buffer.from(await res.arrayBuffer());
      downloaded = true;
    } else {
      console.error(`[backup] attachment ${attachment.id} fetch failed: ${res.status}`);
    }
  } catch (err) {
    console.error(`[backup] attachment ${attachment.id} download error:`, err.message);
  }

  await query(
    `INSERT INTO backup_attachments (attachment_id, message_id, filename, content_type, size, data, downloaded)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (attachment_id) DO UPDATE SET
       data = COALESCE($6, backup_attachments.data),
       downloaded = $7 OR backup_attachments.downloaded`,
    [attachment.id, messageId, attachment.name, attachment.contentType ?? null, attachment.size ?? null, data, downloaded]
  );
}

async function getChannelProgress(jobId, channelId) {
  const res = await query(
    `SELECT oldest_message_id, done FROM backup_progress WHERE job_id = $1 AND channel_id = $2`,
    [jobId, channelId]
  );
  return res.rows[0] ?? null;
}

async function setChannelProgress(jobId, channelId, oldestMessageId, done) {
  await query(
    `INSERT INTO backup_progress (job_id, channel_id, oldest_message_id, done)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (job_id, channel_id) DO UPDATE SET oldest_message_id = $3, done = $4`,
    [jobId, channelId, oldestMessageId, done]
  );
}

async function backupChannelMessages(guild, job, channel, log) {
  const progress = await getChannelProgress(job.id, channel.id);
  if (progress?.done) return;

  let before = progress?.oldest_message_id ?? undefined;

  while (true) {
    if (await getJobStatus(job.id) !== 'running') return;

    let messages;
    try {
      messages = await channel.messages.fetch({ limit: 100, before });
    } catch (err) {
      console.error(`[backup] failed fetching messages in #${channel.name}:`, err.message);
      await sleep(CHANNEL_DELAY_MS);
      continue;
    }

    if (messages.size === 0) {
      await setChannelProgress(job.id, channel.id, before ?? null, true);
      return;
    }

    for (const message of messages.values()) {
      await saveMessage(guild, message);
    }

    before = messages.last().id;
    await setChannelProgress(job.id, channel.id, before, false);
    emit(guild.id, log, `#${channel.name}: +${messages.size} messages`);

    await sleep(MESSAGE_BATCH_DELAY_MS);
  }
}

export function isBackupRunning(guildId) {
  return activeBackups.has(guildId);
}

export async function requestStop(guildId) {
  await query(
    `UPDATE backup_jobs SET status = 'stopped' WHERE guild_id = $1 AND status = 'running'`,
    [guildId]
  );
}

export async function getStatusSummary(guildId) {
  const jobRes = await query(
    `SELECT * FROM backup_jobs WHERE guild_id = $1 ORDER BY id DESC LIMIT 1`,
    [guildId]
  );
  const job = jobRes.rows[0];
  if (!job) return null;

  const [channels, doneChannels, messages, attachments] = await Promise.all([
    query(`SELECT count(*) FROM backup_progress WHERE job_id = $1`, [job.id]),
    query(`SELECT count(*) FROM backup_progress WHERE job_id = $1 AND done = true`, [job.id]),
    query(`SELECT count(*) FROM backup_messages WHERE guild_id = $1`, [guildId]),
    query(`SELECT count(*) FROM backup_attachments WHERE downloaded = true`, []),
  ]);

  return {
    job,
    running: activeBackups.has(guildId),
    activity: lastActivity.get(guildId) ?? null,
    channelsTotal: Number(channels.rows[0].count),
    channelsDone: Number(doneChannels.rows[0].count),
    messageCount: Number(messages.rows[0].count),
    attachmentCount: Number(attachments.rows[0].count),
  };
}

export async function runBackup(guild, { log } = {}) {
  if (activeBackups.has(guild.id)) return;
  activeBackups.add(guild.id);

  try {
    const job = await getOrCreateJob(guild.id);

    emit(guild.id, log, 'Backing up roles...');
    await backupRoles(guild);

    emit(guild.id, log, 'Backing up members...');
    await backupMembers(guild);

    emit(guild.id, log, 'Listing channels and threads...');
    const textChannels = await collectTextChannels(guild);

    for (const channel of textChannels) {
      if (await getJobStatus(job.id) !== 'running') break;
      emit(guild.id, log, `Backing up #${channel.name}...`);
      await backupChannelMessages(guild, job, channel, log);
      await sleep(CHANNEL_DELAY_MS);
    }

    const finalStatus = await getJobStatus(job.id);
    if (finalStatus === 'running') {
      await finishJob(job.id, 'completed');
      emit(guild.id, log, 'Backup completed.');
    } else {
      emit(guild.id, log, `Backup stopped (status: ${finalStatus}).`);
    }
  } catch (err) {
    console.error('[backup] fatal error:', err);
    emit(guild.id, log, `Backup failed: ${err.message}`);
    const jobRes = await query(
      `SELECT id FROM backup_jobs WHERE guild_id = $1 AND status = 'running' ORDER BY id DESC LIMIT 1`,
      [guild.id]
    );
    if (jobRes.rows[0]) {
      await finishJob(jobRes.rows[0].id, 'error', err.message);
    }
  } finally {
    activeBackups.delete(guild.id);
  }
}

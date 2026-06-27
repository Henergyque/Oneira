import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS backup_jobs (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      finished_at TIMESTAMPTZ,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS backup_roles (
      role_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color INTEGER,
      position INTEGER,
      hoist BOOLEAN,
      mentionable BOOLEAN,
      permissions TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS backup_channels (
      channel_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type INTEGER,
      parent_id TEXT,
      position INTEGER,
      topic TEXT,
      nsfw BOOLEAN,
      is_thread BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS backup_members (
      user_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      username TEXT,
      nickname TEXT,
      joined_at TIMESTAMPTZ,
      role_ids TEXT[],
      bot BOOLEAN,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS backup_messages (
      message_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      author_id TEXT,
      author_username TEXT,
      content TEXT,
      created_at TIMESTAMPTZ,
      edited_at TIMESTAMPTZ,
      reply_to_id TEXT
    );
    CREATE INDEX IF NOT EXISTS backup_messages_channel_idx ON backup_messages(channel_id);

    CREATE TABLE IF NOT EXISTS backup_attachments (
      attachment_id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES backup_messages(message_id) ON DELETE CASCADE,
      filename TEXT,
      content_type TEXT,
      size INTEGER,
      data BYTEA,
      downloaded BOOLEAN NOT NULL DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS backup_progress (
      job_id INTEGER NOT NULL REFERENCES backup_jobs(id) ON DELETE CASCADE,
      channel_id TEXT NOT NULL,
      oldest_message_id TEXT,
      done BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY (job_id, channel_id)
    );
  `);
}

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { runBackup, requestStop, getStatusSummary, isBackupRunning } from '../lib/backup.js';

const UPDATE_INTERVAL_MS = 6000;

// guildId -> { intervalId } for the live-updating tracking message
const trackers = new Map();

function buildEmbed(summary) {
  const { job, running, activity, channelsTotal, channelsDone, messageCount, attachmentCount } = summary;
  const color = job.status === 'completed' ? '#2ECC71'
    : job.status === 'error' ? '#E74C3C'
    : job.status === 'stopped' ? '#F1C40F'
    : '#3498DB';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('📦 Server backup')
    .setDescription(activity ?? 'Starting...')
    .addFields(
      { name: 'Status', value: `${job.status}${running ? ' (active)' : ''}`, inline: true },
      { name: 'Channels', value: `${channelsDone}/${channelsTotal}`, inline: true },
      { name: 'Messages', value: `${messageCount}`, inline: true },
      { name: 'Attachments', value: `${attachmentCount}`, inline: true },
    )
    .setTimestamp();
}

function startTracking(guild, message) {
  if (trackers.has(guild.id)) return;

  const tick = async () => {
    const summary = await getStatusSummary(guild.id);
    if (!summary) return;

    try {
      await message.edit({ embeds: [buildEmbed(summary)] });
    } catch (err) {
      console.error('[backup] could not update tracking message:', err.message);
    }

    if (!summary.running) {
      clearInterval(trackers.get(guild.id));
      trackers.delete(guild.id);
    }
  };

  trackers.set(guild.id, setInterval(tick, UPDATE_INTERVAL_MS));
  tick();
}

export default {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Backup the entire server to the database')
    .addSubcommand(sub => sub.setName('start').setDescription('Start or resume a full server backup'))
    .addSubcommand(sub => sub.setName('status').setDescription('Show the progress of the current/last backup'))
    .addSubcommand(sub => sub.setName('stop').setDescription('Stop the running backup'))
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

    const guild = interaction.guild;
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      if (isBackupRunning(guild.id)) {
        await interaction.reply({ content: '⚠️ A backup is already running. Use `/backup status` to follow it.', ephemeral: true });
        return;
      }

      await interaction.reply({ content: '🔄 Backup started, live progress below 👇', ephemeral: true });

      const trackingMessage = await interaction.channel.send({
        embeds: [new EmbedBuilder()
          .setColor('#3498DB')
          .setTitle('📦 Server backup')
          .setDescription('Starting...')
          .setTimestamp()],
      });

      runBackup(guild, { log: msg => console.log(`[backup:${guild.id}] ${msg}`) }).catch(err => {
        console.error('[backup] unhandled error:', err);
      });

      startTracking(guild, trackingMessage);
      return;
    }

    if (sub === 'status') {
      const summary = await getStatusSummary(guild.id);
      if (!summary) {
        await interaction.reply({ content: 'ℹ️ No backup has been started yet. Use `/backup start`.', ephemeral: true });
        return;
      }

      await interaction.reply({ embeds: [buildEmbed(summary)], ephemeral: true });
      return;
    }

    if (sub === 'stop') {
      await requestStop(guild.id);
      await interaction.reply({ content: '🛑 Backup will stop after the current batch. Run `/backup start` later to resume where it left off.', ephemeral: true });
    }
  },
};

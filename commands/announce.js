import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post an announcement')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Announcement message')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL (optional)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    const image = interaction.options.getString('image');

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('📢 Announcement')
      .setDescription(message)
      .setFooter({ text: `Announced by ${interaction.user.username}` })
      .setTimestamp();

    if (image) {
      embed.setImage(image);
    }

    const channelId = process.env.ANNOUNCEMENTS_CHANNEL_ID;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      return interaction.reply({ 
        content: '❌ Announcements channel not found. Check your .env configuration.', 
        ephemeral: true 
      });
    }

    await channel.send({ content: '@everyone', embeds: [embed] });
    await interaction.reply({ 
      content: `✅ Announcement posted in ${channel}!`, 
      ephemeral: true 
    });
  },
};

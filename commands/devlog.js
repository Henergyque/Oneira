import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('devlog')
    .setDescription('Post a devlog announcement')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Devlog title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Devlog content')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL (optional)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const content = interaction.options.getString('content');
    const image = interaction.options.getString('image');

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`📝 ${title}`)
      .setDescription(content)
      .setFooter({ text: `Posted by ${interaction.user.username}` })
      .setTimestamp();

    if (image) {
      embed.setImage(image);
    }

    const channelId = process.env.DEVLOG_CHANNEL_ID;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      return interaction.reply({ 
        content: '❌ Devlog channel not found. Check your .env configuration.', 
        ephemeral: true 
      });
    }

    await channel.send({ embeds: [embed] });
    await interaction.reply({ 
      content: `✅ Devlog posted in ${channel}!`, 
      ephemeral: true 
    });
  },
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Get all official Succubus Games links'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF1493')
      .setTitle('🔗 Succubus Games - Official Links')
      .setDescription('Follow us everywhere!')
      .addFields(
        { name: '💖 Patreon', value: '[Support us on Patreon!](https://www.patreon.com/c/Kutushmurf)', inline: false },
        { name: '🎮 Itch.io', value: '[Play on Itch.io](https://kutushmurf.itch.io)', inline: false },
        { name: '📸 Instagram', value: '[Follow @kutushmurf.games](https://www.instagram.com/kutushmurf.games/)', inline: false },
        { name: '💬 Discord', value: '[Join our server](https://discord.gg/DVFWng48xP)', inline: false }
      )
      .setThumbnail(interaction.guild?.iconURL() || null)
      .setFooter({ text: 'Succubus Games by Kutushmurf' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

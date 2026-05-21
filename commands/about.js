import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Learn about Succubus Games'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#E91E63')
      .setTitle('🔥 About Succubus Games')
      .setDescription(
        `**Succubus Games** is an adult NSFW game where Oneira, a seductive succubus, kidnaps a young man addicted to adult content and challenges him through various twisted games to escape back to his world.\n\n` +
        `Will he resist temptation or succumb to her desires? 😈`
      )
      .addFields(
        { name: '🎮 Genre', value: 'NSFW / Adult / Puzzle', inline: true },
        { name: '🔞 Rating', value: '18+ Only', inline: true },
        { name: '🎨 Creator', value: 'Kutushmurf & Aku', inline: true }
      )
      .setImage('https://via.placeholder.com/800x400.png?text=Succubus+Games') // Replace with actual game banner
      .setFooter({ text: 'Join the adventure now!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

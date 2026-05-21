import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('contract')
    .setDescription('Display Oneira\'s Contract'),
  
  async execute(interaction) {
    const rules = [
      "No Spam • Keep the chat clean",
      "Respect Discord ToS & Laws • No illegal content",
      "Be Respectful • No harassment",
      "No Explicit Content in General Channels • Use designated channels",
      "No Self-Promotion • Ask staff first",
      "Stay On-Topic • Use proper channels",
      "Respect Staff Decisions • Final say is ours",
      "No Cheating or Exploits • Don't ruin the game",
      "No Impersonation • Be yourself",
      "One Account Per Person • No ban evading",
      "Age 18+ Only • NSFW server",
      "English Only • Server language",
      "No Begging for Roles • Earn them",
      "Spoilers in #spoilers • Not here",
      "Have Fun & Enjoy • Be respectful"
    ];

    const rulesText = rules.map((rule, i) => `**${i + 1}.** ${rule}`).join('\n');

    const contractEmbed = new EmbedBuilder()
      .setColor('#FF1493')
      .setTitle('✨ ONEIRA\'S CONTRACT ✨')
      .setDescription('>>> **By entering this realm, you hereby agree to the following terms:**')
      .addFields(
        { name: '\u200B', value: rulesText }
      )
      .addFields(
        { name: '\u200B', value: '**By signing below, you acknowledge and accept all terms.**' }
      )
      .setFooter({ text: '✍️ Sign with ✅ • Oneira' })
      .setTimestamp();

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_rules')
        .setLabel('Sign the Contract')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [contractEmbed], components: [actionRow] });
  },
};

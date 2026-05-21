import { Events, EmbedBuilder } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const normalizeChannelName = (name) => name
      .toLowerCase()
      .replace(/^[^a-z0-9]+/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const isName = (ch, target) => normalizeChannelName(ch.name) === target;

    // Welcome message in #welcum channel
    const welcomeChannelId = '1472703857862643899';
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId)
      ?? member.guild.channels.cache.find(
        ch => isName(ch, 'welcum') || isName(ch, 'welcome')
      );
    
    // Check for rules channel
    const rulesChannel = member.guild.channels.cache.find(
      ch => isName(ch, 'rules') || isName(ch, 'regles')
    );
    
    if (welcomeChannel) {
      const rulesChannelMention = rulesChannel ? rulesChannel.toString() : '**rules**';
      
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#FF1493')
        .setDescription(`${member} just arrived... Welcome, darling.\n\nCome read ${rulesChannelMention} and accept them. Let's see if you're worth my time. 😏`);
      
      welcomeChannel.send({ embeds: [welcomeEmbed] });
    }
  },
};

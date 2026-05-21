import { Events } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId !== 'accept_rules') {
        return;
      }

      const roleId = process.env.MEMBER_ROLE_ID;
      if (!roleId) {
        await interaction.reply({ content: '❌ Role ID not configured.', ephemeral: true });
        return;
      }

      const member = interaction.member;
      if (!member || !('roles' in member)) {
        await interaction.reply({ content: '❌ Could not access member roles.', ephemeral: true });
        return;
      }

      if (member.roles.cache?.has(roleId)) {
        await interaction.reply({ content: '✅ You already accepted the contract.', ephemeral: true });
        return;
      }

      try {
        await member.roles.add(roleId, 'Accepted the contract');
        await interaction.reply({ content: '✅ Contract signed. Welcome, darling.', ephemeral: true });
      } catch (error) {
        console.error('Error assigning role:', error);
        await interaction.reply({ content: '❌ Could not assign the role.', ephemeral: true });
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Command ${interaction.commandName} not found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      const reply = { content: '❌ An error occurred while executing this command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

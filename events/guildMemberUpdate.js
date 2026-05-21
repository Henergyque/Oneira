import { Events } from 'discord.js';

export default {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    if (!oldMember.pending && !newMember.pending) {
      return;
    }

    if (oldMember.pending && !newMember.pending) {
      const roleId = process.env.MEMBER_ROLE_ID;
      if (!roleId) {
        return;
      }

      try {
        if (!newMember.roles.cache.has(roleId)) {
          await newMember.roles.add(roleId, 'Passed rules screening');
        }
      } catch (error) {
        console.error('Error assigning role after screening:', error);
      }
    }
  },
};
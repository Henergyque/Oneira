# 🔥 Succubus Games - Discord Server Structure

## 📋 Server Overview
**Name:** Succubus Games  
**Theme:** NSFW Adult Game Community (18+)  
**Language:** English  
**Creator:** Kutushmurf  

---

## 🎯 Server Roles

### 👑 Staff & Team
- **🎨 Creator** - Kutushmurf (owner, project lead)
- **⚙️ Developer** - Dev team (you!)
- **🛡️ Moderator** - Community moderators
- **🧪 Tester** - Testing / QA

### 💎 Patreon Tiers
- **✨ Patreon Tier 1** - Basic supporter ($X/month)
- **💫 Patreon Tier 2** - Mid-tier supporter ($X/month)
- **⭐ Patreon Tier 3** - Premium supporter ($X/month)
*(Adjust tier names based on actual Patreon tiers)*

### 📊 Activity Roles (Bot-managed via level system)
- **🧪 Trialist** - Level 1-5
- **🛡️ Survivor** - Level 6-15
- **🏆 Victor** - Level 16-29
- **👑 Champion** - Level 30+
*(Use MEE6, Carl-bot, or similar for leveling)*

### 🔐 Access Control
- **💕 Darling** - Accepted rules (auto-assigned via reaction role)

### 💋 Special Roles
- **💋 Oneira's Favorite** - Ultra-rare role given by staff to outstanding community members. Hoisted, custom color (#FF1493 Hot Pink), special perks
  - *Ideas: Early access to exclusive content, direct input on game features, special channel access, monthly recognition*
- **😈 Tempted** - Players who own/played the game (self-assignable or manual)
- **🔥 Corrupted** - Hardcore fans, super active and engaged
- **🎨 Artist** - Created fan art for the game
- **🐛 Bug Hunter** - Reported critical bugs

---

## 📂 Channel Structure

### 🔹 WELCUM
- **😈・welcum** - First point of contact, Oneira welcomes new arrivals (read-only, @everyone can view)

### 🔹 INFORMATION
- **💋・rules** - Server rules (18+ disclaimer) + reaction to accept → grants @Darling role
- **🕯️・announcements** - Major updates, game releases 📌 Staff-only posting
- **🕸️・links** - All official links (Patreon, Itch, Instagram, etc.)
- **❓・faq** - Common questions & answers

### 🔹 GENERAL
- **💬・general** - Main chat (Darling required)
- **🔞・nsfw-general** - Adult content discussion (Darling required)
- **🎨・fan-art** - Share fan art & creations
- **🕸️・off-topic** - Non-game related chat

### 🔹 GAME
- **🗣️・game-discussion** - Game feedback, theories, ideas
- **📝・devlogs** - Development updates 📌 Staff posts, community reactions
- **🐛・bug-reports** - Report bugs & issues
- **💡・suggestions** - Feature requests & ideas
- **🕸️・spoilers** - Spoilers only

### 🔹 PATREON EXCLUSIVE
- **👑・patreon-lounge** - Exclusive chat for Patreon supporters
- **🎁・early-access** - Early builds & content
- **🗳️・polls** - Vote on game features/content

### 🔹 VOICE
- **🎙️・general-voice**
- **🔇・afk**

### 🔹 BOT
- **🤖・bot** - Commandes et notifications bots
- **🏆・level-up** - Annonces de niveaux

### 🔹 SUPPORT
- **🎫・open-ticket** - Ouvrir un ticket (lecture seule, via bot)

### 🔹 STAFF ONLY
- **🛠️・staff-chat** - Internal team discussion
- **📊・logs** - Bot logs (mod actions, joins/leaves)

---

## 🔐 Permissions Overview

| Role          | General | NSFW | Devlogs | Patreon | Staff |
|---------------|---------|------|---------|---------|-------|
| @everyone     | ❌      | ❌   | ❌      | ❌      | ❌    |
| Darling       | ✅      | ✅   | 👁️ View | ❌      | ❌    |
| Patreon T1-3  | ✅      | ✅   | 👁️ View | ✅      | ❌    |
| Tester        | ✅      | ✅   | ✅ Post | ✅      | ❌    |
| Moderator     | ✅      | ✅   | ✅ Post | ✅      | ⚠️ Mod Tools |
| Developer     | ✅      | ✅   | ✅ Post | ✅      | ✅ Admin |
| Creator       | ✅      | ✅   | ✅ Post | ✅      | ✅ Owner |

---

## 🤖 Bot Features
**Oneira** (the custom bot) includes:
- `/links` - Show all official links
- `/about` - Game description
- `/devlog [title] [content] [image?]` - Post devlog (Staff only)
- `/announce [message] [image?]` - Post announcement (Staff only)
- `/ping` - Check bot latency
- Auto-welcome new members with succubus flair
- Activity tracking support

---

## 🔧 Setup Checklist

### 1️⃣ Create Roles
1. Go to Server Settings → Roles
2. Create all roles listed above
3. Assign colors:
   - Creator: Gold (#FFD700)
   - Developer: Blue (#3498DB)
   - Moderator: Red (#E74C3C)
   - Patreon Tiers: Purple shades (#9B59B6, #8E44AD, #6C3483)
   - **💋 Oneira's Favorite: Hot Pink (#FF1493)** ⭐ Hoisted (display separately)
   - Darling: Gray (#95A5A6)
   - Tempted: Pink (#FF6FB5)
   - Corrupted: Deep Purple (#6C3483)
   - Artist: Teal (#1ABC9C)
   - Bug Hunter: Orange (#E67E22)

### 2️⃣ Create Channels
1. Follow the structure above
2. Set permissions for each channel type:
   - **welcum**: Everyone can view, only bots can send (for auto-welcome messages)
   - **rules**: Everyone can view, nobody can send
   - **announcements**: Darling can view, only staff can post
   - **general/nsfw/game channels**: Darling role required to view
   - **patreon-exclusive**: Only Patreon roles can access
   - **staff-chat**: Staff roles only

### 3️⃣ Rules Verification Setup
**Use a reaction role bot** (Carl-bot, Yagpdb, or Wick):
1. Post your rules in #rules channel
2. Add reaction role: "React ✅ to accept the rules and access the server"
3. Reaction assigns @Darling role automatically
4. Configure all main channels to require @Darling role

**Alternative:** Discord's built-in "Rules Screening" feature (simpler but less customizable)

### 4️⃣ Leveling System (Optional)
Use MEE6, Amari, or Carl-bot:
- Set XP rates and level thresholds
- Auto-assign activity roles at levels 5, 15, 30

### 5️⃣ Patreon Integration
Use **Patreon Integration Bot** to auto-sync roles:
1. Link Patreon account to Discord server
2. Map Patreon tiers → Discord roles
3. Auto-assign/remove roles based on pledge status

---

## 📌 Important Notes
- ⚠️ **NSFW Content:** Add 18+ disclaimer in rules, mark NSFW channels as age-restricted
- 🔒 Enable Community Server features for better moderation tools
- 📊 Enable Server Insights to track growth
- 🤖 Consider anti-spam bots (Wick, Beemo, etc.)

---

## 🎨 Branding Tips
- **Server Icon:** Oneira character art or logo
- **Banner:** Game title screen or key art (boost to Level 2 required)
- **Custom Emoji:** Key characters, emoticons, game items (🔥💋😈 themed)
- **Invite Background:** Custom splash art (boost to Level 3 required)
- **#welcum Topic:** Set a seductive topic like "You've entered Oneira's domain... 😈"

---

**Created for Succubus Games by Kutushmurf**  
Need help? DM the dev team!

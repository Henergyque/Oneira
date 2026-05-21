# � Oneira - Succubus Games Discord Bot

**Oneira**, the seductive succubus from Succubus Games, now watches over your Discord server. She manages announcements, devlogs, and keeps the community engaged.

---

## 🚀 Features

- **`/links`** - Display all official Succubus Games links (Patreon, Itch.io, Instagram, Discord)
- **`/about`** - Show game description and info
- **`/devlog`** - Post devlog updates to a dedicated channel (Staff only)
- **`/announce`** - Post announcements with @everyone ping (Staff only)
- **`/ping`** - Check bot latency
- **Auto-welcome** - Greet new members on join

---

## 📦 Installation

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Discord Bot Token** ([Create a bot](https://discord.com/developers/applications))
- **VPS/Server** (Ubuntu/Debian recommended) or local machine

### 1️⃣ Clone & Install
```bash
cd /path/to/your/server
git clone <your-repo-url> oneira-bot
cd oneira-bot/discord-bot
npm install
```

### 2️⃣ Configure Environment
```bash
cp .env.example .env
nano .env  # or your preferred editor
```

**Fill in your `.env`:**
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id
GUILD_ID=your_server_id

DEVLOG_CHANNEL_ID=channel_id_for_devlogs
ANNOUNCEMENTS_CHANNEL_ID=channel_id_for_announcements
VERIFIED_ROLE_ID=verified_role_id
```

**How to get IDs:**
1. Enable Developer Mode: Discord Settings → Advanced → Developer Mode
2. Right-click channels/roles → Copy ID

### 3️⃣ Deploy Slash Commands
```bash
node deploy-commands.js
```
You should see: `✅ Successfully reloaded X application (/) commands.`

### 4️⃣ Start the Bot
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

---

## 🖥️ VPS Deployment (Ubuntu/Debian)

### Step 1: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verify installation
```

### Step 2: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 3: Clone & Setup
```bash
cd /home/your-user
git clone <your-repo-url> oneira-bot
cd oneira-bot/discord-bot
npm install
cp .env.example .env
nano .env  # Configure your tokens
```

### Step 4: Deploy Commands
```bash
node deploy-commands.js
```

### Step 5: Start with PM2
```bash
pm2 start index.js --name oneira-bot
pm2 save
pm2 startup  # Follow instructions to enable auto-restart
```

**PM2 Commands:**
- `pm2 status` - Check bot status
- `pm2 logs oneira-bot` - View logs
- `pm2 restart oneira-bot` - Restart bot
- `pm2 stop oneira-bot` - Stop bot

### Step 6: Auto-restart on Reboot
```bash
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user
pm2 save
```

---

## 🤖 Discord Bot Setup

### 1. Create Bot Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → Name it "Oneira"
3. Go to **Bot** tab → Click **Add Bot**
4. **Copy your token** → Paste in `.env` as `DISCORD_TOKEN`
5. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2. Invite Bot to Server
1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select permissions:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Mention Everyone
   - ✅ Manage Messages
   - ✅ Use Slash Commands
4. **Copy the generated URL** → Open in browser → Add to your server

### 3. Get IDs
- **CLIENT_ID**: Go to **General Information** → Copy **Application ID**
- **GUILD_ID**: Right-click your server icon → Copy Server ID (Developer Mode required)
- **Channel IDs**: Right-click channels → Copy Channel ID
- **Role IDs**: Server Settings → Roles → Right-click role → Copy Role ID

---

## 📁 Project Structure

```
discord-bot/
├── commands/          # Slash commands
│   ├── about.js
│   ├── announce.js
│   ├── devlog.js
│   ├── links.js
│   └── ping.js
├── events/            # Discord events
│   ├── ready.js
│   ├── interactionCreate.js
│   └── guildMemberAdd.js
├── config/            # (Future: database, settings)
├── index.js           # Main bot file
├── deploy-commands.js # Command deployment script
├── package.json
├── .env               # Environment variables (DO NOT COMMIT)
├── .env.example       # Example env file
└── .gitignore
```

---

## 🛠️ Customization

### Add New Commands
1. Create `commands/mycommand.js`:
```js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My custom command'),
  
  async execute(interaction) {
    await interaction.reply('Hello!');
  },
};
```

2. Deploy: `node deploy-commands.js`
3. Restart bot: `pm2 restart oneira-bot`

### Change Bot Status
Edit `events/ready.js`:
```js
client.user.setPresence({
  activities: [{ name: 'with your desires 😈', type: 0 }],
  status: 'dnd', // 'online', 'idle', 'dnd', 'invisible'
});
```

### Add Embeds/Images
Replace placeholder image URLs in `commands/about.js`:
```js
.setImage('https://your-actual-game-banner-url.png')
```

---

## 🐛 Troubleshooting

### Bot not responding?
- Check bot is online: `pm2 status`
- View logs: `pm2 logs oneira-bot`
- Verify token in `.env`
- Ensure intents are enabled in Discord Developer Portal

### Commands not showing?
- Re-run `node deploy-commands.js`
- Wait up to 1 hour for Discord cache
- Check `CLIENT_ID` and `GUILD_ID` in `.env`

### Permission errors?
- Ensure bot role is higher than roles it needs to manage
- Check channel permissions allow bot to send messages

---

## 📚 Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

## 📄 License

MIT License - Feel free to modify and adapt for your needs.

---

**Created for Succubus Games by Kutushmurf**  
Need help? Open an issue or contact the dev team!

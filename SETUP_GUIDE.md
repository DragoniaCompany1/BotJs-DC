## 📄 **File `SETUP_GUIDE.md` (Panduan Detail):**

# 🚀 Setup Guide - Discord Bot for SAMP Server
**Created by: Axel (Drgxel), Ozi (Mozi)**

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Node.js v16 or higher installed
- ✅ MySQL Server running (your SAMP database)
- ✅ Discord Bot created in Discord Developer Portal
- ✅ Bot invited to your Discord server

---

## Step 1: Install Node.js

### Windows:
1. Download from https://nodejs.org/
2. Run installer
3. Verify: Open CMD and type `node --version`

### Linux:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

---

## Step 2: Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give it a name (e.g., "SAMP Bot")
4. Go to "Bot" section
5. Click "Add Bot"
6. Copy the TOKEN (you'll need this!)
7. Enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

---

## Step 3: Invite Bot to Your Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select permissions:
   - ✅ Administrator (easiest)
   - Or select specific permissions listed in README
4. Copy generated URL
5. Open in browser and invite to your server

---

## Step 4: Install Bot

1. Download and extract bot files
2. Open terminal/CMD in bot folder
3. Run: `npm install`
4. Wait for installation to complete

---

## Step 5: Configure Bot

### A. Copy example files:
```bash
# Windows (CMD)
copy .env.example .env
copy config.json.example config.json

# Linux
cp .env.example .env
cp config.json.example config.json
```

### B. Edit `.env` file:

Open `.env` with notepad and fill in:

```env
TOKEN_BOT=your_bot_token_from_step_2
OWNER_ID=your_discord_user_id
ROLE_ADMIN=your_admin_role_id
# ... (fill all values)
```

**How to get Discord IDs:**
1. Discord → User Settings → Advanced
2. Enable "Developer Mode"
3. Right-click on user/role/server → Copy ID

### C. Edit `config.json`:

```json
{
    "mysql": {
        "host": "localhost",
        "user": "root",
        "password": "your_mysql_password",
        "database": "samp_database"
    }
}
```

---

## Step 6: Configure Ban Table (IMPORTANT!)

The bot needs to know which table stores banned players.

### Find your ban table:

1. Open your MySQL database
2. Find table that stores banned players
3. Common names: `player_bans`, `banned_players`, `ucp_bans`

### Check table structure:

```sql
DESCRIBE your_ban_table_name;
```

### Configure the bot:

1. Open `Events/banMonitor.js`
2. Find line ~40
3. Replace `player_bans` with YOUR table name:

```javascript
// Original
SELECT * FROM player_bans WHERE id > ?

// Change to YOUR table
SELECT * FROM your_table_name WHERE id > ?
```

### If column names are different:

Map your columns to bot's expected columns:

| Bot expects | Your column might be |
|------------|---------------------|
| id | ban_id, bannid |
| name | player_name, username |
| admin | banned_by, admin_name |
| reason | ban_reason, ban_desc |
| ban_date | banned_date, timestamp |
| ban_expire | expire_date, unban_date |

---

## Step 7: Run Bot

### First time:
```bash
node bot-dc.js
```

### If successful, you'll see:
```
==================================================
🤖 BOT INFORMATION
==================================================
✅ Bot logged in as: YourBot#1234
🆔 Bot ID: 123456789...
📊 Servers: 1
...
👨‍💻 Created by: Axel (Drgxel), Ozi (Mozi)
==================================================
```

---

## Step 8: Setup Ban Monitoring

1. Create channel for ban logs: `#ban-logs`
2. In Discord, type: `!monitorban #ban-logs`
3. Bot will reply with confirmation
4. Done! Ban logs will appear automatically

---

## Step 9: Test Everything

### Test help command:
```
!help
```
Should show interactive help menu.

### Test ping:
```
!ping
```
Should show bot latency.

### Test ban check:
```
!checkban TestPlayer
```
Should check if player is banned.

---

## 🐛 Common Issues & Solutions

### Bot won't start:

**"Invalid token"**
- Double-check TOKEN_BOT in .env
- Make sure no spaces before/after token
- Generate new token if needed

**"Cannot find module"**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Ban monitor not working:

**"Table not found"**
- Check table name in `Events/banMonitor.js`
- Make sure MySQL connection works

**"Column not found"**
- Check column names match your database
- Modify queries to match your columns

### Commands not working:

**Bot doesn't respond**
- Check PREFIX_BOT in .env (should be `!`)
- Check bot has permissions
- Check bot is online

**"Missing permissions"**
- Check ROLE_ADMIN ID is correct
- Make sure you have the admin role
- Try giving yourself owner role temporarily

---

## 🎉 You're Done!

Bot should now be working perfectly!

### Next steps:
- Setup ban monitoring
- Customize commands if needed
- Invite community to use !help

### Need help?
- Read README.md
- Check troubleshooting section
- Open an issue on GitHub

---

**Created by: Axel (Drgxel), Ozi (Mozi)**
```

---

## 🎯 **CHECKLIST SEBELUM RELEASE v1.0:**

```
✅ Obfuscate 7 core files
✅ README.md lengkap dengan setup ban table
✅ .env.example dengan semua variables
✅ config.json.example
✅ SETUP_GUIDE.md (panduan detail)
✅ Hanya include 4 fitur: help, menupanel, banlogs, ping
✅ Remove Commands lain (backup, restore, admin tools, dll)
✅ Remove node_modules/
✅ Remove backups/ folder
✅ Remove config/ folder
✅ Remove log.txt
✅ Test bot jalan dengan config fresh
✅ Credit ada di semua file
```

---

**Structure untuk Release v1.0:**
```
discord-bot-samp-v1.0/
├── bot-dc.js (obfuscated)
├── Core/
│   └── index.js (obfuscated)
├── Mysql.js (obfuscated)
├── Events/
│   ├── messageCreate.js (obfuscated)
│   ├── interactionCreate.js (obfuscated)
│   ├── ready.js (obfuscated)
│   └── banMonitor.js (obfuscated)
├── Commands/
│   ├── Admin/
│   │   ├── monitorban.js
│   │   ├── disablebanlog.js
│   │   ├── banlogs.js
│   │   └── checkban.js
│   ├── menupanel.js
│   └── Utility/
│       ├── help.js
│       └── ping.js
├── Tombol/
│   ├── tombol-pendaftaran.js
│   ├── tombol-kirimulang.js
│   ├── tombol-reset.js
│   └── tombol-takerole.js
├── Modals/
│   └── tampilan-pendaftaran.js
├── .env.example
├── config.json.example
├── package.json
├── README.md
├── SETUP_GUIDE.md
└── LICENSE
```

**Created by: Axel (Drgxel), Ozi (Mozi)** 🚀

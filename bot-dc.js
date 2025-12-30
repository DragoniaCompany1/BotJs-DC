const { Client, Collection, WebhookClient } = require("discord.js");
const discordModals = require("discord-modals");
const { EventEmitter } = require("events");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
require("./Mysql");

EventEmitter.defaultMaxListeners = 15;

const logFilePath = path.join(__dirname, 'log.txt');

const logToFile = (message) => {
  const timestamp = new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function(...args) {
  const message = args.join(' ');
  originalConsoleLog.apply(console, args);
  logToFile(`[LOG] ${message}`);
};

console.error = function(...args) {
  const message = args.join(' ');
  originalConsoleError.apply(console, args);
  logToFile(`[ERROR] ${message}`);
};

console.warn = function(...args) {
  const message = args.join(' ');
  originalConsoleWarn.apply(console, args);
  logToFile(`[WARN] ${message}`);
};

const client = new Client({
  intents: 32767,
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  }
});

module.exports = client;

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.cooldowns = new Collection();
client.config = process.env;

require("./Core")(client);
discordModals(client);

const requiredEnvVars = ['TOKEN_BOT', 'PREFIX_BOT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

let hook;
if (process.env.WEBHOOK_ID && process.env.WEBHOOK_TOKEN) {
  try {
    hook = new WebhookClient({ 
      id: process.env.WEBHOOK_ID, 
      token: process.env.WEBHOOK_TOKEN 
    });
    console.log('✅ Webhook client berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Gagal membuat webhook client:', error.message);
  }
}

const getTimestamp = () => {
  return new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

let lastLogTime = 0;
const LOG_COOLDOWN = 5000;

const logError = async (error, context = '') => {
  if (!hook) return;
  
  const now = Date.now();
  if (now - lastLogTime < LOG_COOLDOWN) return;
  lastLogTime = now;
  
  try {
    const errorMessage = error?.stack || error?.message || String(error);
    const timestamp = getTimestamp();
    const contextInfo = context ? `\n📍 Context: ${context}` : '';
    
    const message = `🚨 **Error Log** - ${timestamp}${contextInfo}\n\`\`\`js\n${errorMessage.slice(0, 1800)}\`\`\``;
    
    await hook.send(message);
  } catch (err) {
    console.error('❌ Gagal mengirim log error ke webhook:', err.message);
  }
};

const logInfo = async (message) => {
  if (!hook) return;
  
  try {
    const timestamp = getTimestamp();
    await hook.send(`ℹ️ **Info** - ${timestamp}\n${message}`);
  } catch (err) {
    console.error('❌ Gagal mengirim log info:', err.message);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  logError(reason, 'Unhandled Rejection');
});

process.on('uncaughtException', (error, origin) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Origin:', origin);
  logError(error, `Uncaught Exception - ${origin}`);
  
  setTimeout(() => {
    console.error('💀 Process akan di-restart karena uncaught exception');
    process.exit(1);
  }, 1000);
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
  console.error('⚠️ Uncaught Exception Monitor:', error.message);
  logError(error, `Exception Monitor - ${origin}`);
});

process.on('warning', (warning) => {
  console.warn('⚠️ Process Warning:', warning.name, warning.message);
});

process.on('beforeExit', (code) => {
  console.log(`🔄 Process beforeExit dengan code: ${code}`);
  if (hook) {
    hook.send(`\`\`\`js\nBeforeExit: ${code}\`\`\``).catch(err => console.error('Error sending beforeExit log:', err));
  }
});

process.on('exit', (code) => {
  console.log(`👋 Process exit dengan code: ${code}`);
});

process.on('multipleResolves', (type, promise, reason) => {
  console.warn(`⚠️ Multiple resolves terdeteksi: ${type}`);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️ SIGINT received, shutting down gracefully...');
  await gracefulShutdown('SIGINT');
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  await gracefulShutdown('SIGTERM');
});

const gracefulShutdown = async (signal) => {
  try {
    console.log(`🔄 Memulai graceful shutdown (${signal})...`);
    
    if (hook) {
      logInfo(`Bot shutting down (${signal})`).catch(err => console.error('Error sending shutdown log:', err));
    }
    
    if (client.isReady()) {
      try {
        await client.user.setStatus('invisible');
      } catch (err) {
        console.error('Error setting status:', err);
      }
      await client.destroy();
      console.log('✅ Client destroyed successfully');
    }
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

client.once('ready', async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🤖 BOT INFORMATION');
  console.log('='.repeat(50));
  console.log(`✅ Bot logged in as: ${client.user.tag}`);
  console.log(`🆔 Bot ID: ${client.user.id}`);
  console.log(`📊 Servers: ${client.guilds.cache.size}`);
  console.log(`👥 Users: ${client.users.cache.size}`);
  console.log(`📝 Commands: ${client.commands.size}`);
  console.log(`🔘 Buttons: ${client.buttons.size}`);
  console.log(`📋 Modals: ${client.modals.size}`);
  console.log(`⏰ Started at: ${getTimestamp()}`);
  console.log(`🔧 Node: ${process.version}`);
  console.log(`📦 Discord.js: v${require('discord.js').version}`);
  console.log('='.repeat(50));
  console.log('👨‍💻 Created by: Axel (Drgxel), Ozi (Mozi)');
  console.log('='.repeat(50) + '\n');
  
  if (client.user) {
    try {
      await client.user.setPresence({
        status: 'online',
        activities: [{
          name: `${client.config.PREFIX_BOT}help | ${client.guilds.cache.size} servers`,
          type: 0
        }]
      });
    } catch (err) {
      console.error('Error setting presence:', err);
    }
  }
  
  if (hook) {
    logInfo(`✅ Bot started successfully!\n**Tag:** ${client.user.tag}\n**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n\n**Created by:** Axel (Drgxel), Ozi (Mozi)`).catch(err => console.error('Error sending info log:', err));
  }
});

client.on('error', (error) => {
  console.error('❌ Discord Client Error:', error);
  logError(error, 'Discord Client Error');
});

client.on('warn', (warning) => {
  console.warn('⚠️ Discord Client Warning:', warning);
});

client.on('rateLimit', (rateLimitInfo) => {
  console.warn('⚠️ Rate Limited:', rateLimitInfo);
});

client.on('guildCreate', (guild) => {
  console.log(`✅ Joined new guild: ${guild.name} (${guild.id})`);
  logInfo(`Joined guild: **${guild.name}** (${guild.memberCount} members)`);
  
  if (client.user) {
    try {
      client.user.setActivity(`${client.config.PREFIX_BOT}help | ${client.guilds.cache.size} servers`, { type: 0 });
    } catch (err) {
      console.error('Error updating activity:', err);
    }
  }
});

client.on('guildDelete', (guild) => {
  console.log(`❌ Left guild: ${guild.name} (${guild.id})`);
  logInfo(`Left guild: **${guild.name}**`);
  
  if (client.user) {
    try {
      client.user.setActivity(`${client.config.PREFIX_BOT}help | ${client.guilds.cache.size} servers`, { type: 0 });
    } catch (err) {
      console.error('Error updating activity:', err);
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === `${client.config.PREFIX_BOT}sdbot`) {
    try {
      const shutdownMsg = await message.channel.send('🔄 Mematikan bot...');
      console.log(`⚠️ Bot shutdown requested by: ${message.author.tag} (${message.author.id})`);
      
      if (hook) {
        logInfo(`Bot shutdown by: **${message.author.tag}** (${message.author.id})\nServer: **${message.guild?.name || 'DM'}**`).catch(err => console.error('Error sending shutdown log:', err));
      }
      
      await shutdownMsg.edit('✅ Bot shutting down... Goodbye! 👋\n\n**Created by:** Axel (Drgxel), Ozi (Mozi)');
      await gracefulShutdown('Manual Command');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      
      try {
        await message.channel.send('❌ Error occurred while shutting down!');
      } catch (err) {
        console.error('❌ Failed to send error message:', err);
      }
      
      await gracefulShutdown('Error During Shutdown');
    }
  }
});

const startBot = async () => {
  try {
    console.log('🔄 Logging in to Discord...');
    console.log('👨‍💻 Bot created by: Axel (Drgxel), Ozi (Mozi)\n');
    await client.login(client.config.TOKEN_BOT);
  } catch (error) {
    console.error('❌ Failed to login:', error);
    
    if (error.code === 'TokenInvalid') {
      console.error('❌ Invalid token! Please check your TOKEN_BOT in .env file');
    } else if (error.message?.includes('disallowed intents')) {
      console.error('❌ Intents error! Enable all Privileged Gateway Intents di Discord Developer Portal');
    }
    
    logError(error, 'Login Failed');
    process.exit(1);
  }
};

startBot();

setInterval(() => {
  if (client.isReady() && client.user) {
    try {
      client.user.setActivity(`${client.config.PREFIX_BOT}help | ${client.guilds.cache.size} servers`, { type: 0 });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }
}, 5 * 60 * 1000);

setInterval(() => {
  const now = Date.now();
  client.cooldowns.forEach((timestamps, commandName) => {
    timestamps.forEach((timestamp, userId) => {
      if (now - timestamp > 30 * 60 * 1000) {
        timestamps.delete(userId);
      }
    });
  });
  console.log('🧹 Cooldowns cleaned up');
}, 30 * 60 * 1000);
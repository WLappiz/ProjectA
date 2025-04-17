const { GatewayIntentBits, ShardingManager, ActivityFlags, ActivityType, Collection, Partials } = require('discord.js');
const { Client } = require('discord.js');
const config = require('../config');
const emoji = require('../structure/emoji')
const color = require('../structure/color');
const Utils = require('../utils/utils');



class Subject extends Client {
    constructor(options) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildExpressions,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember,

            ],
            disableEveryone: true,
            fetchAllMembers: false,
            ...options,
        });
        this.config = config;
        this.emote = emoji
        this.color = color
        this.utils = new Utils(this);
        this.cooldowns = new Collection();
    }
}

module.exports = Subject;

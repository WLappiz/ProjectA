const { GatewayIntentBits, ShardingManager, ActivityFlags, ActivityType, Collection, Partials } = require('discord.js');
const { Client } = require('discord.js');
const config = require('../config');
const emotes = require('../structure/emoji')
const color = require('../structure/color');
const Utils = require('../utils/utils');
const MyIntents = require('../enums/Intents');
const MyPartials = require('../enums/Partials');



class Subject extends Client {
    constructor(options) {
        super({
            intents: MyIntents.ALL,

            partials: [Partials.Message,
            Partials.Channel,
            Partials.Reaction,
            Partials.GuildMember,
            Partials.User,
            Partials.ThreadMember],

            disableEveryone: true,
            fetchAllMembers: false,
            ...options,
        });
        this.config = config;
        this.emote = emotes;
        this.color = color
        this.utils = new Utils(this);
        this.cooldowns = new Collection();
    }
}

module.exports = Subject;

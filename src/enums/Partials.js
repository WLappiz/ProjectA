const { Partials } = require('discord.js');

const MyPartials = Object.freeze({
    // Add all available partials for flexibility
    ALL: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
        Partials.ThreadMember,
    ],

    // For message-related events
    Messaging: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ],

    // For guild-related caching
    GuildRelated: [
        Partials.GuildMember,
        Partials.User,
        Partials.ThreadMember
    ]
});

module.exports = MyPartials;

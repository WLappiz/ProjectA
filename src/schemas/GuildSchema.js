const { model, Schema } = require('mongoose');

module.exports = model(
    'GuildConfig',
    new Schema({
        guildId: String,
        prefix: {
            type: String,
            default: '!'
        },
        logs: {
            moderation: {
                enabled: {
                    type: Boolean,
                },
                channel: {
                    type: String,
                    default: "",
                },
            },
            welcome: {
                enabled: {
                    type: Boolean,
                },
                channel: {
                    type: String,
                    default: "",
                },
            },
            modLogs: {
                enabled: {
                    type: Boolean,
                },
                channel: {
                    type: String,
                    default: "",
                },
            },
            MessageLogs: {
                enabled: {
                    type: Boolean,
                },
                channel: {
                    type: String,
                    default: "",
                },
            }
        },
    },
        { timestamps: true })
);

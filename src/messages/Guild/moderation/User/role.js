const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "role",
    description: "Role management commands",
    category: ["moderation"],
    usage: "role <add/remove/give/clear/all> <user/group> <role>",
    aliases: ["role-manage", "role-mod"],
    botPermissions: ['ManageRoles'],
    userPermissions: ['ManageRoles'],
    devSev: false,
    devOnly: false,
    SVOnly: true,
    adminOnly: false,
    ownerOnly: false,
    cooldown: 10,
    category: ["moderation"],
    run: async (client, message, args) => {

        const subcommand = args[0];
        const target =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[1]);
        const role =
            message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

        if (!subcommand) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${client.emote.utility.cross} | Please specify a subcommand: add, remove, give, clear, or all.`
                        )
                        .setColor(client.color.DEFAULT),
                ],
            });
        }

        if (subcommand.toLowerCase() === "give") {
            const group = args[1];
            if (!group) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | Please specify a group (Human/Bot/Everyone).`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }
            if (!role) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | Please specify a valid role.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            const members = message.guild.members.cache.filter((member) => {
                if (group.toLowerCase() === "human") return !member.user.bot;
                if (group.toLowerCase() === "bot") return member.user.bot;
                return true;
            });

            members.forEach((member) => {
                member.roles.add(role).catch(console.error);
            });

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${client.emote.utility.success} | Role <@${role.id}> has been given to ${group} members.`
                        )
                        .setColor(client.color.DEFAULT),
                ],
            });
        }

        if (!role) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${client.emote.utility.cross} | Please specify a valid role.`
                        )
                        .setColor(client.color.DEFAULT),
                ],
            });
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${client.emote.utility.cross} | I cannot manage this role. The role is higher than my highest role.`
                        )
                        .setColor(client.color.DEFAULT),
                ],
            });
        }

        if (
            role.position >= message.member.roles.highest.position &&
            !message.guild.ownerId
        ) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${client.emote.utility.cross} | You cannot manage roles that are higher or equal in position to yours.`
                        )
                        .setColor(client.color.DEFAULT),
                ],
            });
        }

        switch (subcommand.toLowerCase()) {
            case "add":
                if (!target) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | Please specify a user.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }
                if (target.roles.cache.has(role.id)) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | <@${target.user.id}> already has the role <@${role.id}>.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }
                await target.roles.add(role);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.success} | Role <@${role.id}> has been added to <@${target.user.id}>.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });

            case "remove":
                if (!target) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | Please specify a user.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }
                if (!target.roles.cache.has(role.id)) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | <@${target.user.id}> does not have the role <@${role.id}>.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }
                await target.roles.remove(role);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.success} | Role <@${role.id}> has been removed from <@${target.user.id}>.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });

            case "clear":
                if (!target) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | Please specify a user.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }
                const userRoles = target.roles.cache.filter(
                    (r) => r.id !== message.guild.id
                );
                await target.roles.remove(userRoles);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.success} | <@${target.user.id}>'s roles have been cleared.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });

            case "all":
                const action = args[1];
                if (!action) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | Please specify an action (add/remove).`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }
                if (!role) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | Please specify a valid role.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }

                const allMembers = message.guild.members.cache;
                if (action.toLowerCase() === "add") {
                    allMembers.forEach((member) => {
                        member.roles.add(role).catch(console.error);
                    });
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.success} | Role <@${role.id}> has been added to everyone.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                } else if (action.toLowerCase() === "remove") {
                    allMembers.forEach((member) => {
                        member.roles.remove(role).catch(console.error);
                    });
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.success} | Role <@${role.id}> has been removed from everyone.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                } else {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription("Invalid action. Use add or remove.")
                                .setColor(client.color.DEFAULT),
                        ],
                    });
                }

            default:
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Invalid subcommand. Use add, remove, give, clear, or all."
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
        }
    },
};
